import { AUTO_DISCOUNT, GST_RATE, VISITING_CHARGE, VISITING_WAIVER_MIN } from "./config.ts";
import type { BookingItem, Promo, Quote } from "./types.ts";

export interface QuoteOptions {
  /** Consultation visits carry their own fee — no extra visiting charge. */
  consultationOnly?: boolean;
  promo?: Promo | null;
}

/**
 * Pricing rules
 *  - Visiting charge ₹49 on instant orders below ₹499 (waived at ₹499+).
 *  - Auto offer: 10% off orders above ₹500, max ₹200. A valid promo code replaces it if it gives more.
 *  - GST 18% on (subtotal + visiting − discount).
 */
export function computeQuote(items: Pick<BookingItem, "price" | "qty">[], opts: QuoteOptions = {}): Quote {
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const chargeable = !opts.consultationOnly && subtotal > 0;
  const visitingWaived = chargeable && subtotal >= VISITING_WAIVER_MIN;
  const visitingCharge = chargeable && !visitingWaived ? VISITING_CHARGE : 0;

  let discount = 0;
  let discountLabel: string | undefined;
  if (subtotal > AUTO_DISCOUNT.minOrder) {
    discount = Math.min(AUTO_DISCOUNT.maxOff, Math.round((subtotal * AUTO_DISCOUNT.percent) / 100));
    discountLabel = `${AUTO_DISCOUNT.percent}% off above ₹${AUTO_DISCOUNT.minOrder}`;
  }
  const p = opts.promo;
  if (p && p.active && subtotal >= p.minOrder) {
    const promoOff = Math.min(p.maxOff, Math.round((subtotal * p.percent) / 100));
    if (promoOff > discount) {
      discount = promoOff;
      discountLabel = `Promo ${p.code}`;
    }
  }
  const taxable = Math.max(0, subtotal + visitingCharge - discount);
  const gst = Math.round(taxable * GST_RATE);
  return { subtotal, visitingCharge, visitingWaived, discount, discountLabel, taxable, gst, total: taxable + gst };
}
