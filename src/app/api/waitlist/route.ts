import { z } from "zod";
import { body, fail, handle, normalizePhone, ok } from "@/lib/api";
import { mutate } from "@/lib/db";

const S = z.object({
  phone: z.string().optional(),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  locality: z.string().max(120).optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

export const POST = (req: Request) =>
  handle(async () => {
    const b = await body(req, S);
    const phone = b.phone ? normalizePhone(b.phone) : undefined;
    if (b.phone && !phone) return fail("Enter a valid 10-digit mobile number", 422);
    if (!phone && !b.email) return fail("Share a phone number or email so we can tell you when we arrive", 422);
    mutate((d) => void d.waitlist.push({ phone: phone || undefined, email: b.email || undefined, locality: b.locality, lat: b.lat, lng: b.lng, at: new Date().toISOString() }));
    return ok({ ok: true });
  });
