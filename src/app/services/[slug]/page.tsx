import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { GalleryCard } from "@/components/BeforeAfter";
import { CategoryServices, ConsultCta } from "@/components/CategoryView";
import { JsonLd, faqLd } from "@/components/JsonLd";
import { PanelCatalog, PriceCalculator } from "@/components/PanelCatalog";
import { ReviewList } from "@/components/ReviewList";
import { Faqs, Histogram, Stars } from "@/components/ui";
import { CATEGORIES, GALLERY, categoryBySlug } from "@/lib/catalog";
import { BASE } from "@/lib/config";
import { dateLabel, inr, slotLabel } from "@/lib/format";
import { activeServices, nextSlotFor, providersFor, ratingSummary, visibleReviews } from "@/lib/queries";
import { istDate } from "@/lib/slots";
import { syncDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const c = categoryBySlug(params.slug);
  if (!c) return {};
  return { alternates: { canonical: `/services/${c.slug}` }, title: `${c.name} near ${BASE.name}`, description: `${c.description} ${c.startingLabel}. Open 9 AM – 12:30 AM.` };
}

const STEPS: Record<string, string[]> = {
  "pvc-panels": [
    "Book a Measurement Visit (₹49, 60 mins)",
    "Expert measures wall & shows 300+ designs on tablet",
    "You pick design, get instant digital quote",
    "Pay 50% advance for materials",
    "Installation in 1–2 days (120 sq ft wall ≈ 3 hours)",
    "Pay balance after satisfaction",
  ],
  "wall-designer": ["Book a design consultation (₹199)", "Designer shows textures, stencils & colour samples", "Get a digital mock-up and fixed quote", "Work completed in 1–2 days", "Pay after you're happy with the wall"],
  furniture: ["Book a consultation (₹99)", "Carpenter-designer measures & shows material samples", "Approve the design & fixed quote", "Pay 50% advance — we build in our workshop", "Installation at home; pay balance after satisfaction"],
};

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  await syncDb();
  const c = categoryBySlug(params.slug);
  if (!c) notFound();
  const services = activeServices(c.slug);
  const rating = ratingSummary(c.slug);
  const reviews = visibleReviews((r) => r.category === c.slug);
  const consult = services.find((s) => s.isConsultation);
  const next = nextSlotFor(c.slug, consult?.durationMin ?? 30);
  const today = istDate();
  const pros = providersFor(c.slug).length;
  const gallery = GALLERY.filter((g) => g.category === c.slug || (c.slug === "wall-designer" && g.filter === "Wall Design"));
  const isPvc = c.slug === "pvc-panels";

  return (
    <div className="pb-24">
      <JsonLd data={faqLd(c.faqs)} />
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Service", serviceType: c.name, provider: { "@type": "LocalBusiness", name: "HomeServ" }, areaServed: BASE.name, aggregateRating: { "@type": "AggregateRating", ratingValue: rating.avg, reviewCount: rating.total } }} />
      <section className={`${c.accent ? "bg-gradient-to-br from-accent-50 to-primary-50" : "bg-white"} border-b border-slate-200`}>
        <div className="container-x py-8">
          <Link href="/services" className="text-sm text-ink-muted hover:text-primary">← Back to Services</Link>
          <h1 className="mt-3 text-2xl font-bold sm:text-4xl">{c.icon} {c.name}</h1>
          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            <span>⭐ <b>{rating.avg}</b> ({c.bookingsLabel})</span>
            <span className="text-ink-muted">•</span>
            <span>{next ? (next.date === today ? `Available today from ${slotLabel(next.slot)}` : `Next slot ${dateLabel(next.date, { weekday: "short", day: "numeric", month: "short" })}, ${slotLabel(next.slot)}`) : "Fully booked — call us"}</span>
            <span className="text-ink-muted">•</span>
            <span>{pros} verified pros nearby</span>
          </p>
          <p className="mt-2 text-sm text-ink-muted">⚡ Same-day service · 🛡️ {c.warranty}{isPvc ? " · 300+ designs available" : ""}</p>
        </div>
      </section>

      <div className="container-x mt-8 space-y-14">
        {c.mode === "consultation" && STEPS[c.slug] && consult && (
          <section className="card overflow-hidden">
            <div className="grid md:grid-cols-[1fr_280px]">
              <div className="p-6">
                <h2 className="text-lg font-bold">📐 How {isPvc ? "PVC panel" : c.shortName.toLowerCase()} booking works</h2>
                <ol className="mt-4 space-y-3">
                  {STEPS[c.slug].map((s, i) => (
                    <li key={s} className="flex gap-3 text-sm">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">{i + 1}</span>
                      <span className="pt-1">{s}</span>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="flex flex-col justify-center gap-3 bg-accent p-6 text-white">
                <p className="text-sm text-white/80">{inr(consult.price)} consultation fee adjustable against your order</p>
                <ConsultCta service={consult} className="btn bg-white text-accent hover:bg-white/90" label={`${isPvc ? "Book Measurement Visit" : "Book Consultation"} — ${inr(consult.price)} →`} />
              </div>
            </div>
          </section>
        )}

        <section>
          <h2 className="mb-4 text-xl font-bold">{c.mode === "consultation" ? "Services & fixed-price options" : "Choose a service"}</h2>
          <CategoryServices services={services} subcategories={c.subcategories} />
        </section>

        {isPvc && consult && (
          <>
            <section>
              <h2 className="mb-4 text-xl font-bold">Panel Catalogue</h2>
              <PanelCatalog measure={consult} />
            </section>
            <section>
              <h2 className="mb-4 text-xl font-bold">Price Calculator</h2>
              <PriceCalculator measure={consult} />
            </section>
          </>
        )}

        {gallery.length > 0 && (
          <section>
            <h2 className="mb-4 text-xl font-bold">Before & After</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{gallery.slice(0, 3).map((g) => <GalleryCard key={g.id} item={g} />)}</div>
          </section>
        )}

        <section>
          <h2 className="mb-4 text-xl font-bold">Reviews</h2>
          <div className="grid gap-6 lg:grid-cols-[300px_1fr] [&>*]:min-w-0">
            <div className="card h-fit p-6">
              <p className="font-display text-4xl font-bold">{rating.avg}</p>
              <Stars value={rating.avg} size="text-lg" />
              <p className="mb-4 text-sm text-ink-muted">from {rating.total.toLocaleString("en-IN")} reviews</p>
              <Histogram counts={rating.histogram} />
            </div>
            <ReviewList reviews={reviews} initial={6} />
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-bold">FAQs for this service</h2>
          <Faqs items={c.faqs} />
        </section>

        <section className="text-sm text-ink-muted">
          Also available: {CATEGORIES.filter((x) => x.slug !== c.slug).map((x, i) => (
            <span key={x.slug}>{i > 0 && " · "}<Link className="hover:text-primary" href={`/services/${x.slug}`}>{x.shortName}</Link></span>
          ))}
        </section>
      </div>
    </div>
  );
}
