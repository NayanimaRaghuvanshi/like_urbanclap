import "server-only";
import fs from "node:fs";
import path from "node:path";
import { SEED_SERVICES } from "./catalog";
import { DEFAULT_SETTINGS, LEGACY_DEMO_PROVIDER_IDS, SEED_PROVIDERS, seedReviews } from "./seed";
import type { Booking, Customer, NotificationLog, Promo, Provider, Review, Service, Settings } from "./types";

/**
 * Small document store so the app runs with zero infrastructure.
 *
 * Storage backends (picked automatically):
 *  - "redis": Upstash Redis / Vercel KV over REST when UPSTASH_REDIS_REST_URL+TOKEN (or KV_REST_API_URL+TOKEN)
 *    are set. Shared by every server instance — use this on Vercel/serverless.
 *  - "file":  .data/db.json (or DATA_DIR). Good for a single Node server.
 *  - On Vercel without Redis we fall back to /tmp, which works but is per-instance and wiped on cold starts.
 *
 * Request handlers call `await syncDb()` before reading and `await flush()` after writing (see lib/api.ts).
 * Production can swap this for PostgreSQL + PostGIS (db/schema.sql).
 */
export interface DB {
  version: number;
  services: Service[];
  providers: Provider[];
  bookings: Booking[];
  reviews: Review[];
  customers: Customer[];
  sessions: Record<string, { phone: string; createdAt: string }>;
  otps: Record<string, { code: string; expires: number; attempts: number }>;
  waitlist: { phone?: string; email?: string; locality?: string; lat?: number; lng?: number; at: string }[];
  contacts: { name: string; phone: string; message: string; at: string }[];
  promos: Promo[];
  settings: Settings;
  notifications: NotificationLog[];
  counters: Record<string, number>;
  orders: Record<string, { amount: number; mock: boolean; createdAt: string; usedBy?: string }>;
  /** File-mode photo storage (Redis mode keeps photos in separate keys). */
  photoData?: Record<string, string>;
  /** WhatsApp bot: message ids already answered (Meta retries webhooks) */
  waSeen?: string[];
  /** WhatsApp bot: numbers that asked for a person → auto-replies paused until this time (ms) */
  waMuted?: Record<string, number>;
  /** Data migrations already applied */
  migrated?: number;
}

/** Remove the sample professionals/reviews/ratings that early builds shipped with. Keeps real bookings. */
function migrate(d: DB): boolean {
  if ((d.migrated ?? 0) >= 2) return false;
  const demo = new Set(LEGACY_DEMO_PROVIDER_IDS);
  d.providers = d.providers.filter((p) => !(demo.has(p.id) && /^\+9198000000\d\d$/.test(p.phone)));
  d.reviews = d.reviews.filter((r) => !r.id.startsWith("r-seed"));
  d.services.forEach((s) => ((s.rating = 0), (s.reviewCount = 0)));
  d.bookings.forEach((b) => {
    if (b.providerId && demo.has(b.providerId) && !d.providers.some((p) => p.id === b.providerId)) {
      b.providerId = undefined;
      if (b.status === "assigned") b.status = "confirmed";
    }
  });
  d.migrated = 2;
  return true;
}

const DB_VERSION = 1;
const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
const KEY = process.env.REDIS_KEY_PREFIX || "homeserv";
export const storageMode: "redis" | "file" = REDIS_URL && REDIS_TOKEN ? "redis" : "file";

const DATA_DIR = process.env.DATA_DIR || (process.env.VERCEL ? "/tmp/homeserv" : path.join(process.cwd(), ".data"));
const FILE = path.join(DATA_DIR, "db.json");

function fresh(): DB {
  return {
    version: DB_VERSION,
    services: structuredClone(SEED_SERVICES),
    providers: structuredClone(SEED_PROVIDERS),
    bookings: [],
    reviews: seedReviews(),
    customers: [],
    sessions: {},
    otps: {},
    waitlist: [],
    contacts: [],
    promos: [
      { code: "FIRST100", percent: 15, maxOff: 100, minOrder: 199, active: true },
      { code: "PANEL500", percent: 5, maxOff: 500, minOrder: 5000, active: true },
    ],
    settings: structuredClone(DEFAULT_SETTINGS),
    notifications: [],
    counters: {},
    orders: {},
    photoData: {},
    migrated: 2,
  };
}

const g = globalThis as unknown as {
  __hsDb?: DB;
  __hsDirty?: boolean;
  __hsFlushing?: Promise<void>;
  __hsPhotos?: Record<string, string>;
  __hsWarned?: boolean;
};

/* ---------------- Redis REST ---------------- */
async function redis<T = unknown>(cmd: (string | number)[]): Promise<T> {
  const res = await fetch(REDIS_URL!, {
    method: "POST",
    headers: { Authorization: `Bearer ${REDIS_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(cmd),
    cache: "no-store",
  });
  const json = (await res.json().catch(() => ({}))) as { result?: T; error?: string };
  if (!res.ok || json.error) throw new Error(`Redis ${cmd[0]} failed: ${json.error ?? res.status}`);
  return json.result as T;
}

/* ---------------- Public API ---------------- */

/** Synchronous access to the in-memory copy. Call `syncDb()` first in each request. */
export function db(): DB {
  if (g.__hsDb) return g.__hsDb;
  let data: DB | undefined;
  if (storageMode === "file") {
    try {
      const parsed = JSON.parse(fs.readFileSync(FILE, "utf8")) as DB;
      if (parsed.version === DB_VERSION) data = parsed;
    } catch {
      /* first run */
    }
  }
  g.__hsDb = data ?? fresh();
  if (!data || migrate(g.__hsDb)) persist();
  return g.__hsDb;
}

/** Load the latest shared state (Redis) before handling a request. No-op for file storage. */
export async function syncDb(): Promise<void> {
  if (storageMode !== "redis") {
    db();
    return;
  }
  if (g.__hsFlushing) await g.__hsFlushing;
  if (g.__hsDirty) return; // local changes not yet written — keep them
  const raw = await redis<string | null>(["GET", `${KEY}:db`]);
  let data: DB | undefined;
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as DB;
      if (parsed.version === DB_VERSION) data = parsed;
    } catch {
      /* corrupt — reseed */
    }
  }
  g.__hsDb = data ?? fresh();
  if (!data || migrate(g.__hsDb)) g.__hsDirty = true;
}

/** Mark state as changed. File mode writes immediately; Redis mode writes on `flush()`. */
export function persist() {
  if (!g.__hsDb) return;
  if (storageMode === "redis") {
    g.__hsDirty = true;
    return;
  }
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    const tmp = FILE + ".tmp";
    fs.writeFileSync(tmp, JSON.stringify(g.__hsDb));
    fs.renameSync(tmp, FILE);
  } catch (e) {
    // Read-only filesystem: keep serving from memory rather than crashing.
    if (!g.__hsWarned) console.warn("[db] could not write data file, keeping data in memory only:", (e as Error).message);
    g.__hsWarned = true;
  }
}

/** Write pending changes to Redis. Called at the end of every API request. */
export async function flush(): Promise<void> {
  if (storageMode !== "redis") return;
  if (g.__hsFlushing) await g.__hsFlushing;
  const photos = g.__hsPhotos;
  if (!g.__hsDirty && !photos) return;
  const snapshot = JSON.stringify(g.__hsDb);
  g.__hsDirty = false;
  g.__hsPhotos = undefined;
  g.__hsFlushing = (async () => {
    try {
      if (photos) for (const [k, v] of Object.entries(photos)) await redis(["SET", `${KEY}:photo:${k}`, v]);
      await redis(["SET", `${KEY}:db`, snapshot]);
    } catch (e) {
      g.__hsDirty = true;
      if (photos) g.__hsPhotos = { ...photos, ...(g.__hsPhotos ?? {}) };
      throw e;
    } finally {
      g.__hsFlushing = undefined;
    }
  })();
  await g.__hsFlushing;
}

/** Run a mutation and persist. */
export function mutate<T>(fn: (d: DB) => T): T {
  const out = fn(db());
  persist();
  return out;
}

export function resetDb() {
  g.__hsDb = fresh();
  persist();
}

/* ---------------- Photos (kept out of the main document) ---------------- */
export function savePhoto(key: string, dataUrl: string) {
  if (storageMode === "redis") {
    g.__hsPhotos = { ...(g.__hsPhotos ?? {}), [key]: dataUrl };
  } else {
    mutate((d) => void ((d.photoData ??= {})[key] = dataUrl));
  }
}

export async function getPhoto(key: string): Promise<string | null> {
  if (storageMode === "redis") return g.__hsPhotos?.[key] ?? (await redis<string | null>(["GET", `${KEY}:photo:${key}`]));
  return db().photoData?.[key] ?? null;
}

export const uid = (prefix = "") => prefix + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
export const otp4 = () => String(Math.floor(1000 + Math.random() * 9000));
