import { z } from "zod";
import { body, fail, handle, ok } from "@/lib/api";
import { advanceBooking } from "@/lib/bookings";
import { currentProId } from "@/lib/session";

const S = z.object({ action: z.enum(["on_way", "start", "complete", "mark_paid"]), otp: z.string().optional() });

export const POST = (req: Request, { params }: { params: { id: string } }) =>
  handle(async () => {
    const providerId = currentProId();
    if (!providerId) return fail("Please log in", 401);
    const b = await body(req, S);
    advanceBooking(params.id, b.action, { otp: b.otp, providerId });
    return ok({ ok: true });
  });
