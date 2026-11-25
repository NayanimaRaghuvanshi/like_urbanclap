import Link from "next/link";
import { BeforeAfterSlider } from "@/components/BeforeAfter";
import { GalleryGrid } from "@/components/GalleryGrid";
import { LocationChecker } from "@/components/LocationChecker";
import { ReviewCard } from "@/components/ReviewList";
import { Histogram, Stars } from "@/components/ui";
import { CATEGORIES, GALLERY } from "@/lib/catalog";
import { SUPPORT_PHONE } from "@/lib/config";
import { dateLabel, durationLabel, inr, slotLabel } from "@/lib/format";
import { activeServices, nextSlotFor, ratingSummary, startingPrice, visibleReviews } from "@/lib/queries";
import { istDate } from "@/lib/slots";

export const dynamic = "force-dynamic";

const RATE_CARD = ["plb-tap", "ele-fan", "ele-switch", "car-lock", "pnl:PVC Panel (per panel):880:varies", "pnl:WPC Panel (per panel):1350:varies", "wd-texture", "car-assembly", "fur-tv-price:Custom TV Unit:8000:3-5 days", "pvc-full-wall"];

export default function Home() {
  const overall = ratingSummary();
  const next = nextSlotFor("plumber");
  const today = istDate();
  const services = activeServices();
  const rateRows = RATE_CARD.map((k) => {
    if (k.includes(":")) {
      const [, name, price, dur] = k.split(":");
      return { name, price: Number(price), dur, unit: "" };
    }
    const s = services.find((x) => x.id === k);
    return s ? { name: s.name, price: s.price, dur: durationLabel(s.durationMin), unit: s.unit ?? "" } : null;
  }).filter(Boolean) as { name: string; price: number; dur: string; unit: string }[];

  // Show a mix including critical reviews — we don't hide them.
  const all = visibleReviews();
  const picks = [...all.filter((r) => r.rating === 5).slice(0, 3), ...all.filter((r) => r.rating <= 3).slice(0, 1), ...all.filter((r) => r.rating === 4).slice(0, 2)];

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-ink text-white">
        <div className="absolute inset-0 opacity-60" aria-hidden>
          <div className="h-full w-full" style={{ background: "repeating-linear-gradient(90deg,#b98d5f 0 14px,#a07447 14px 22px,#c8a274 22px 30px)" }} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-slate-900/30" aria-hidden />
        <div className="container-x relative grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-[1fr_420px] lg:py-24">
          <div>
          <p className="mb-4 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-secondary ring-1 ring-white/20">Hyperlocal · Within 2 km of you</p>
          <h1 className="max-w-2xl text-3xl font-bold leading-tight sm:text-5xl">🏠 Home Repairs & Design — At Your Doorstep</h1>
          <p className="mt-4 max-w-xl text-base text-slate-200 sm:text-lg">PVC Panels • Wall Design • Plumber • Electrician • Carpenter • Furniture — within 2 km of you.</p>
          <div className="mt-8"><LocationChecker /></div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/services" className="btn-amber">Book a Service</Link>
            <a href={`tel:${SUPPORT_PHONE}`} className="btn border border-white/30 text-white hover:bg-white/10">☎ Call Now</a>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-200">
            <li>✅ Verified Pros</li>
            <li>⚡ Same-Day Service</li>
            <li>🛡️ Warranty Covered</li>
            <li>⭐ {overall.total.toLocaleString("en-IN")}+ rated jobs</li>
          </ul>
          <p className="mt-4 inline-flex flex-wrap items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm ring-1 ring-white/15">
            🕐 Operating: 9 AM – 12:30 AM
            <span className="text-slate-400">|</span>
            {next ? <span>Next slot: <b className="text-secondary">{next.date === today ? "Today" : dateLabel(next.date, { weekday: "short", day: "numeric", month: "short" })}, {slotLabel(next.slot)}</b></span> : <span>Fully booked this week — call us</span>}
          </p>
          </div>
          <figure className="hidden overflow-hidden rounded-3xl bg-white text-ink shadow-2xl ring-1 ring-white/20 lg:block">
            <BeforeAfterSlider variant="fluted" label="Fluted PVC living room" />
            <figcaption className="flex items-center justify-between p-4 text-sm">
              <span><b>Fluted PVC Living Room</b><br /><span className="text-ink-muted">HSR Layout Sector 2 · 2 days</span></span>
              <span className="rounded-full bg-secondary-50 px-3 py-1 font-semibold text-amber-700">~₹12,000</span>
            </figcaption>
          </figure>
        </div>
      </section>

      {/* SERVICES */}
      <section className="container-x py-14" id="services">
        <h2 className="section-title text-center">Our Services</h2>
        <p className="mt-2 text-center text-ink-muted">Fixed prices for standard jobs. Paid consultations for custom work.</p>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4">
          {CATEGORIES.map((c) => {
            const r = ratingSummary(c.slug);
            const from = startingPrice(c.slug);
            return (
              <Link key={c.slug} href={`/services/${c.slug}`} className="card group flex flex-col items-start p-4 transition hover:-translate-y-1 hover:shadow-xl sm:p-5">
                <span className={`flex h-14 w-14 items-center justify-center rounded-2xl text-3xl ${c.accent ? "bg-accent-50" : "bg-primary-50"}`}>{c.icon}</span>
                <h3 className="mt-3 font-semibold">{c.shortName}</h3>
                <p className="text-sm text-ink-muted">{c.mode === "consultation" && c.consultationFee && c.slug === "furniture" ? `Consult ${inr(c.consultationFee)}` : `Starts ${inr(c.slug === "pvc-panels" ? 880 : from)}`}</p>
                <p className="mt-2 text-sm">⭐ {r.avg} <span className="text-ink-muted">({r.total.toLocaleString("en-IN")})</span></p>
                {c.accent && <span className="mt-2 rounded-full bg-accent-50 px-2 py-0.5 text-[11px] font-semibold text-violet-700">Custom design</span>}
              </Link>
            );
          })}
          <Link href="/gallery" className="card flex flex-col items-start justify-center bg-gradient-to-br from-primary to-accent p-5 text-white transition hover:-translate-y-1">
            <span className="text-3xl">✨</span>
            <h3 className="mt-3 font-semibold">See our work</h3>
            <p className="text-sm text-white/80">Before & after gallery →</p>
          </Link>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-slate-100 py-14">
        <div className="container-x">
          <h2 className="section-title text-center">How It Works</h2>
          <ol className="relative mt-10 grid gap-8 md:grid-cols-4">
            <div className="absolute left-[12.5%] right-[12.5%] top-6 hidden border-t-2 border-dashed border-primary/30 md:block" aria-hidden />
            {[
              ["Choose Service", "Select from 7 categories and pick the exact sub-service you need."],
              ["Pick a Date & Slot", "Choose any 30-minute slot between 9 AM and 12:30 AM, any day."],
              ["We Assign a Verified Pro", "A background-verified pro arrives at your doorstep with tools and materials."],
              ["Job Done!", "Pay after service or online. Rate & review your professional."],
            ].map(([t, d], i) => (
              <li key={t} className="relative flex gap-4 md:flex-col md:items-center md:text-center">
                <span className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary font-display text-lg font-bold text-white ring-4 ring-slate-100">{i + 1}</span>
                <div>
                  <h3 className="font-semibold">{t}</h3>
                  <p className="mt-1 text-sm text-ink-muted">{d}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-10 text-center"><Link href="/services" className="btn-primary">Book Now →</Link></div>
        </div>
      </section>

      {/* GALLERY */}
      <section className="container-x py-14">
        <h2 className="section-title text-center">Transformations by Our Experts</h2>
        <p className="mb-8 mt-2 text-center text-ink-muted">Drag the slider to compare. Every project tagged with locality, duration and cost.</p>
        <GalleryGrid items={GALLERY} limit={3} carousel />
        <div className="mt-8 text-center"><Link href="/gallery" className="btn-outline">View Full Gallery →</Link></div>
      </section>

      {/* RATE CARD */}
      <section className="bg-white py-14">
        <div className="container-x max-w-4xl">
          <h2 className="section-title text-center">Transparent Pricing</h2>
          <p className="mt-2 text-center text-ink-muted">What you see is what you pay. GST extra as applicable.</p>
          <div className="mt-8 hidden overflow-hidden rounded-2xl border border-slate-200 sm:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-ink-muted">
                <tr><th className="px-5 py-3">Service</th><th className="px-5 py-3 text-right">Starting Price</th><th className="px-5 py-3 text-right">Duration</th></tr>
              </thead>
              <tbody>
                {rateRows.map((r, i) => (
                  <tr key={r.name} className={i % 2 ? "bg-slate-50/60" : ""}>
                    <td className="px-5 py-3 font-medium">{r.name}</td>
                    <td className="px-5 py-3 text-right font-semibold tabular-nums">{inr(r.price)}{r.unit}</td>
                    <td className="px-5 py-3 text-right text-ink-muted">{r.dur}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6 grid gap-3 sm:hidden">
            {rateRows.map((r) => (
              <div key={r.name} className="card flex items-center justify-between p-4">
                <div><p className="font-medium">{r.name}</p><p className="text-xs text-ink-muted">{r.dur}</p></div>
                <p className="font-semibold">{inr(r.price)}{r.unit}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-ink-muted">* Prices include materials & installation for panel work. * Custom work priced after a ₹49–₹199 consultation visit, adjustable against your order.</p>
          <div className="mt-6 text-center"><Link href="/services" className="btn-ghost">See Full Rate Card →</Link></div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="container-x py-14">
        <h2 className="section-title text-center">What Our Customers Say</h2>
        <div className="mt-8 grid gap-8 lg:grid-cols-[320px_1fr] [&>*]:min-w-0">
          <div className="card p-6">
            <p className="font-display text-5xl font-bold">{overall.avg}</p>
            <Stars value={overall.avg} size="text-xl" />
            <p className="mt-1 text-sm text-ink-muted">average from {overall.total.toLocaleString("en-IN")} reviews</p>
            <div className="mt-5"><Histogram counts={overall.histogram} /></div>
            <p className="mt-4 text-xs text-ink-muted">We publish every rating, including 1-star ones.</p>
            <Link href="/my-bookings" className="btn-outline mt-5 w-full">Write a Review</Link>
          </div>
          <div className="no-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 xl:grid-cols-3">
            {picks.map((r) => <div key={r.id} className="w-[80%] shrink-0 snap-center sm:w-auto"><ReviewCard r={r} /></div>)}
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="bg-primary-50 py-14">
        <div className="container-x">
          <h2 className="section-title text-center">The HomeServ Promise</h2>
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              ["🛡️", "Up to 5-Year Warranty", "On panels & installation work. 30-day guarantee on repairs."],
              ["👤", "Background-Verified Pros", "Aadhaar KYC + police verification for every professional."],
              ["🔒", "Secure Payments", "UPI & cards via Razorpay, or pay after service."],
              ["💰", "No Hidden Charges", "What you see is what you pay. Parts at MRP with receipt."],
            ].map(([i, t, d]) => (
              <div key={t} className="card p-5">
                <span className="text-3xl">{i}</span>
                <h3 className="mt-2 font-semibold">{t}</h3>
                <p className="mt-1 text-sm text-ink-muted">{d}</p>
              </div>
            ))}
          </div>
          <p className="mx-auto mt-6 max-w-2xl rounded-xl bg-white p-4 text-center text-sm text-ink-muted">⚠️ We only claim what we verify: Aadhaar KYC & police verification. No fake certifications or invented badges.</p>
        </div>
      </section>
    </>
  );
}
