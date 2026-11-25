import { z } from "zod";
import { body, fail, handle, ok } from "@/lib/api";
import { addReview, bookingView, cancelBooking, getBooking, rescheduleBooking } from "@/lib/bookings";
import { currentPhone, isAdmin } from "@/lib/session";

export const dynamic = "force-dynamic";
type Ctx = { params: { id: string } };

function owned(id: string) {
  const b = getBooking(id);
  if (!b) return { error: fail("Booking not found", 404) };
  const phone = currentPhone();
  if (b.customerPhone !== phone && !isAdmin()) return { error: fail("Please log in with the mobile number used for this booking", 403) };
  return { b, phone: phone! };
}

export const GET = (_req: Request, { params }: Ctx) =>
  handle(() => {
    const r = owned(params.id);
    if (r.error) return r.error;
    return ok({ booking: bookingView(r.b, "customer") });
  });

const Action = z.discriminatedUnion("action", [
  z.object({ action: z.literal("cancel") }),
  z.object({ action: z.literal("reschedule"), date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), slot: z.number().int() }),
  z.object({ action: z.literal("review"), rating: z.number().int().min(1).max(5), text: z.string().max(600).default("") }),
]);

export const POST = (req: Request, { params }: Ctx) =>
  handle(async () => {
    const r = owned(params.id);
    if (r.error) return r.error;
    const a = await body(req, Action);
    if (a.action === "cancel") cancelBooking(params.id, "customer");
    if (a.action === "reschedule") rescheduleBooking(params.id, a.date, a.slot);
    if (a.action === "review") addReview(params.id, r.b.customerPhone, a.rating, a.text);
    return ok({ booking: bookingView(getBooking(params.id)!, "customer") });
  });
