import { handle, ok } from "@/lib/api";
import { db } from "@/lib/db";
import { currentPhone, deviceBookings } from "@/lib/session";
import { otpMode } from "@/lib/sms";

export const dynamic = "force-dynamic";

export const GET = () =>
  handle(() => {
    const phone = currentPhone();
    const c = phone ? db().customers.find((x) => x.phone === phone) : undefined;
    return ok({ phone: phone ?? null, name: c?.name ?? null, email: c?.email ?? null, otpMode: otpMode(), deviceBookings: deviceBookings().length });
  });
