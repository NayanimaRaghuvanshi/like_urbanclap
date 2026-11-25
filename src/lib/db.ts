import "server-only";
import fs from "node:fs";
import path from "node:path";
import { SEED_SERVICES } from "./catalog";
import { DEFAULT_SETTINGS, SEED_PROVIDERS, seedReviews } from "./seed";
import type { Booking, Customer, NotificationLog, Promo, Provider, Review, Service, Settings } from "./types";

/**
 * Minimal JSON-file datastore so the app runs with zero infrastructure.
 * Production should swap this module for PostgreSQL + PostGIS (see db/schema.sql) — every
 * read/write goes through the functions below, so the surface to replace is small.
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
}

const DB_VERSION = 1;
const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), ".data");
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
  };
}

const g = globalThis as unknown as { __homeservDb?: DB };

export function db(): DB {
  if (g.__homeservDb) return g.__homeservDb;
  let data: DB | undefined;
  try {
    const parsed = JSON.parse(fs.readFileSync(FILE, "utf8")) as DB;
    if (parsed.version === DB_VERSION) data = parsed;
  } catch {
    /* first run */
  }
  g.__homeservDb = data ?? fresh();
  if (!data) persist();
  return g.__homeservDb;
}

export function persist() {
  if (!g.__homeservDb) return;
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = FILE + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(g.__homeservDb));
  fs.renameSync(tmp, FILE);
}

/** Run a mutation and persist. Node runs route handlers on one thread, so this is atomic per request. */
export function mutate<T>(fn: (d: DB) => T): T {
  const out = fn(db());
  persist();
  return out;
}

export function resetDb() {
  g.__homeservDb = fresh();
  persist();
}

export const uid = (prefix = "") => prefix + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
export const otp4 = () => String(Math.floor(1000 + Math.random() * 9000));
