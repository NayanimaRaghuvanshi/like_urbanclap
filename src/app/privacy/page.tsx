import type { Metadata } from "next";
export const metadata: Metadata = { title: "Privacy Policy" };

export default function Privacy() {
  return (
    <article className="container-x max-w-3xl space-y-4 py-10 text-ink-muted [&_h2]:mt-6 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-ink">
      <h1 className="section-title">Privacy Policy</h1>
      <p className="rounded-xl bg-secondary-50 p-3 text-sm text-amber-800">Template — review for DPDP Act 2023 compliance before launch.</p>
      <h2>What we collect</h2><p>Your name, mobile number, optional email, service address and location pin, booking notes and any photos you upload.</p>
      <h2>Why</h2><p>To check serviceability, schedule and fulfil your booking, send updates over SMS/WhatsApp/email, issue invoices, and improve our service.</p>
      <h2>Who sees it</h2><p>Only the professional assigned to your job sees your address and notes, and only for that job. Payments are processed by Razorpay; we never store card details.</p>
      <h2>Retention</h2><p>Booking records are kept for tax and warranty purposes. Ask us to delete your account at any time.</p>
      <h2>Marketing</h2><p>Promotional WhatsApp messages are sent only if you opt in.</p>
      <h2>Contact</h2><p>Write to hello@homeserv.in for any privacy request.</p>
    </article>
  );
}
