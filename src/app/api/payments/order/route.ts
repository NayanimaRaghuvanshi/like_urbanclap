import { z } from "zod";
import { body, handle, ok } from "@/lib/api";
import { quoteFor } from "@/lib/bookings";
import { createOrder } from "@/lib/payments";

const S = z.object({ items: z.array(z.object({ serviceId: z.string(), qty: z.number().int().min(1).max(10) })).min(1), promoCode: z.string().optional() });

export const POST = (req: Request) =>
  handle(async () => {
    const b = await body(req, S);
    const { quote } = quoteFor(b.items, b.promoCode || undefined);
    return ok({ ...(await createOrder(quote.total)), total: quote.total });
  });
