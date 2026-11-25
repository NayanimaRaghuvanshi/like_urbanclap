import { z } from "zod";
import { body, handle, ok } from "@/lib/api";
import { quoteFor } from "@/lib/bookings";

const S = z.object({ items: z.array(z.object({ serviceId: z.string(), qty: z.number().int().min(1).max(10) })).min(1).max(20), promoCode: z.string().max(20).optional() });

export const POST = (req: Request) =>
  handle(async () => {
    const b = await body(req, S);
    const { quote, lines, promo } = quoteFor(b.items, b.promoCode || undefined);
    return ok({ quote, lines, promo: promo?.code ?? null });
  });
