import type { Metadata } from "next";
import { JsonLd, faqLd } from "@/components/JsonLd";
import { Faqs } from "@/components/ui";
import { CATEGORIES } from "@/lib/catalog";

export const metadata: Metadata = { alternates: { canonical: "/faqs" }, title: "FAQs" };

const GENERAL = [
  { q: "Which areas do you serve?", a: "Homes and offices across the city. Enter your address at checkout and drop a pin on the map so our professional can find you." },
  { q: "What are your working hours?", a: "9:00 AM to 12:30 AM, 7 days a week. Slots are 30 minutes apart; book at least 1 hour ahead and up to 7 days in advance." },
  { q: "How are professionals verified?", a: "Every professional completes Aadhaar KYC and a police background check before their first job." },
  { q: "What are the start and end OTPs?", a: "When your pro arrives, share the start OTP shown on your tracking page. Share the end OTP only once you're satisfied — this confirms the job is complete." },
  { q: "Is there a visiting charge?", a: "A ₹49 visiting charge applies to repair orders below ₹499. It's waived on orders of ₹499 or more. Consultation visits have their own fee, adjustable against your order." },
];

export default function FaqsPage() {
  const all = [...GENERAL, ...CATEGORIES.flatMap((c) => c.faqs.slice(0, 1).map((f) => ({ q: `${c.shortName}: ${f.q}`, a: f.a })))];
  return (
    <div className="container-x max-w-3xl space-y-6 py-10">
      <JsonLd data={faqLd(all)} />
      <h1 className="section-title">Frequently Asked Questions</h1>
      <Faqs items={GENERAL} />
      {CATEGORIES.map((c) => (
        <section key={c.slug}>
          <h2 className="mb-3 font-semibold">{c.icon} {c.shortName}</h2>
          <Faqs items={c.faqs} />
        </section>
      ))}
    </div>
  );
}
