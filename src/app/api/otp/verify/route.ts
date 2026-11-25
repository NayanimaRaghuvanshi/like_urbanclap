import { z } from "zod";
import { body, fail, handle, normalizePhone, ok } from "@/lib/api";
import { db, mutate } from "@/lib/db";
import { createSession } from "@/lib/session";

const S = z.object({ phone: z.string(), code: z.string().regex(/^\d{4}$/, "OTP must be 4 digits") });

export const POST = (req: Request) =>
  handle(async () => {
    const b = await body(req, S);
    const phone = normalizePhone(b.phone);
    if (!phone) return fail("Invalid phone", 422);
    const rec = db().otps[phone];
    if (!rec || rec.expires < Date.now()) return fail("OTP expired. Please request a new one.");
    if (rec.attempts >= 5) return fail("Too many attempts. Request a new OTP.", 429);
    if (rec.code !== b.code) {
      mutate((d) => void d.otps[phone].attempts++);
      return fail("Incorrect OTP");
    }
    mutate((d) => void delete d.otps[phone]);
    createSession(phone);
    const c = db().customers.find((x) => x.phone === phone);
    return ok({ ok: true, phone, name: c?.name, email: c?.email });
  });
