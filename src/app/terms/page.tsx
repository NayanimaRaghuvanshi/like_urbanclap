import type { Metadata } from "next";
export const metadata: Metadata = { title: "Terms & Conditions" };

export default function Terms() {
  return (
    <article className="container-x prose-sm max-w-3xl space-y-4 py-10 text-ink-muted [&_h2]:mt-6 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-ink">
      <h1 className="section-title">Terms & Conditions</h1>
      <p className="rounded-xl bg-secondary-50 p-3 text-sm text-amber-800">Template — have these reviewed by a lawyer before launch.</p>
      <h2>1. Services</h2><p>HomeServ provides home services through professionals it employs or contracts. Prices shown are for the described scope; additional work is quoted and done only with your approval.</p>
      <h2>2. Bookings & slots</h2><p>Bookings can be made between 9:00 AM and 12:30 AM, at least 1 hour and at most 7 days in advance.</p>
      <h2>3. Cancellation & rescheduling</h2><p>Free up to 2 hours before the slot. Cancellations within 2 hours of the slot incur a ₹50 fee. Online payments for cancelled bookings are refunded to the original method within 5–7 working days.</p>
      <h2>4. Payments</h2><p>Pay after service via UPI or cash, or pay online via Razorpay. Spare parts are charged at MRP with a receipt. All prices are exclusive of GST unless stated.</p>
      <h2>5. Consultations & custom work</h2><p>Consultation fees (₹49–₹199) are adjusted against your order if you proceed. Custom work requires a 50% advance for materials; the balance is due on completion.</p>
      <h2>6. Warranty</h2><p>30-day workmanship guarantee on repairs; 1 year on painting, wall design and furniture; up to 5 years on panels and installation as stated on your quote. Warranty excludes misuse, water damage from external sources, and third-party alterations.</p>
      <h2>7. Job OTPs</h2><p>Sharing the end OTP confirms that the job was completed to your satisfaction.</p>
      <h2>8. Conduct</h2><p>Customers and professionals must treat each other with respect. We may refuse service in unsafe conditions.</p>
    </article>
  );
}
