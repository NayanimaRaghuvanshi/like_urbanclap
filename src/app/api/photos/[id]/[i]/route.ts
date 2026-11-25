import { fail, handle } from "@/lib/api";
import { getBooking } from "@/lib/bookings";
import { getPhoto } from "@/lib/db";
import { currentPhone, currentProId, isAdmin } from "@/lib/session";

export const dynamic = "force-dynamic";

/** Serve a booking photo to the customer, the assigned pro, or an admin. */
export const GET = (_req: Request, { params }: { params: { id: string; i: string } }) =>
  handle(async () => {
    const b = getBooking(params.id);
    if (!b) return fail("Not found", 404);
    if (b.customerPhone !== currentPhone() && b.providerId !== currentProId() && !isAdmin()) return fail("Forbidden", 403);
    const data = await getPhoto(`${b.id}:${Number(params.i)}`);
    const m = data?.match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/);
    if (!m) return fail("Not found", 404);
    return new Response(Buffer.from(m[2], "base64"), { headers: { "Content-Type": m[1], "Cache-Control": "private, max-age=86400" } });
  });
