import "server-only";
import { cookies } from "next/headers";
import crypto from "node:crypto";
import { db, mutate } from "./db";

const COOKIE = "hs_session";
const ADMIN_COOKIE = "hs_admin";
const PRO_COOKIE = "hs_pro";

export function createSession(phone: string) {
  const token = crypto.randomBytes(24).toString("hex");
  mutate((d) => {
    d.sessions[token] = { phone, createdAt: new Date().toISOString() };
  });
  cookies().set(COOKIE, token, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30, secure: process.env.NODE_ENV === "production" });
}

export function currentPhone(): string | undefined {
  const t = cookies().get(COOKIE)?.value;
  return t ? db().sessions[t]?.phone : undefined;
}

export function logout() {
  const t = cookies().get(COOKIE)?.value;
  if (t) mutate((d) => void delete d.sessions[t]);
  cookies().delete(COOKIE);
}

/* ----- Admin (single shared password; replace with real auth in production) ----- */
function adminToken() {
  const pw = process.env.ADMIN_PASSWORD || "admin123";
  return crypto.createHmac("sha256", pw).update("homeserv-admin").digest("hex");
}
export function adminLogin(password: string): boolean {
  const pw = process.env.ADMIN_PASSWORD || "admin123";
  const a = Buffer.from(password);
  const b = Buffer.from(pw);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  cookies().set(ADMIN_COOKIE, adminToken(), { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 12 });
  return true;
}
export const isAdmin = () => cookies().get(ADMIN_COOKIE)?.value === adminToken();
export const adminLogout = () => cookies().delete(ADMIN_COOKIE);

/* ----- Provider dashboard (phone + PIN; HMAC-signed provider id) ----- */
function sign(v: string) {
  const secret = (process.env.ADMIN_PASSWORD || "admin123") + "-pro";
  return v + "." + crypto.createHmac("sha256", secret).update(v).digest("hex").slice(0, 32);
}
export function proLogin(providerId: string) {
  cookies().set(PRO_COOKIE, sign(providerId), { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7 });
}
export function currentProId(): string | undefined {
  const v = cookies().get(PRO_COOKIE)?.value;
  if (!v) return;
  const id = v.slice(0, v.lastIndexOf("."));
  return sign(id) === v ? id : undefined;
}
export const proLogout = () => cookies().delete(PRO_COOKIE);
