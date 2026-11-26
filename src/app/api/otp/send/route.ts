import { z } from "zod";
import { body, fail, handle, normalizePhone, ok } from "@/lib/api";
import { db, mutate, otp4 } from "@/lib/db";
import { notify } from "@/lib/notify";
import { otpMode, sendOtpSms } from "@/lib/sms";

const S = z.object({ phone: z.string() });

export const POST = (req: Request) =>
  handle(async () => {
    const mode = otpMode();
    if (mode === "none") return fail("Phone verification isn't enabled — just enter your number to book.", 400);
    const phone = normalizePhone((await body(req, S)).phone);
    if (!phone) return fail("Enter a valid 10-digit Indian mobile number", 422);
    const existing = db().otps[phone];
    if (existing && existing.expires - 4.5 * 60000 > Date.now()) return fail("Please wait 30 seconds before requesting another OTP", 429);
    const code = otp4();
    mutate((d) => void (d.otps[phone] = { code, expires: Date.now() + 5 * 60000, attempts: 0 }));
    if (mode === "sms") {
      try {
        await sendOtpSms(phone, code);
      } catch (e) {
        console.error("[otp]", (e as Error).message);
        return fail("Couldn't send the OTP right now. Please try again in a minute.", 502);
      }
    }
    notify([{ to: phone, channel: "sms", audience: "customer", message: "OTP sent for login" }]);
    return ok({ ok: true, phone, ...(mode === "dev" ? { devCode: code } : {}) });
  });
