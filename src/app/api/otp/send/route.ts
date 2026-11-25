import { z } from "zod";
import { body, fail, handle, normalizePhone, ok } from "@/lib/api";
import { db, mutate, otp4 } from "@/lib/db";
import { notify } from "@/lib/notify";

const S = z.object({ phone: z.string() });

export const POST = (req: Request) =>
  handle(async () => {
    const phone = normalizePhone((await body(req, S)).phone);
    if (!phone) return fail("Enter a valid 10-digit Indian mobile number", 422);
    const existing = db().otps[phone];
    if (existing && existing.expires - 4.5 * 60000 > Date.now()) return fail("Please wait 30 seconds before requesting another OTP", 429);
    const code = otp4();
    mutate((d) => void (d.otps[phone] = { code, expires: Date.now() + 5 * 60000, attempts: 0 }));
    notify([{ to: phone, channel: "sms", audience: "customer", message: `${code} is your HomeServ OTP. Valid for 5 minutes.` }]);
    const dev = process.env.OTP_DEV_MODE !== "false";
    return ok({ ok: true, phone, ...(dev ? { devCode: code } : {}) });
  });
