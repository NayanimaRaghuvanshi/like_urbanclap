import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { JsonLd, faqLd } from "@/components/JsonLd";
import { Faqs, Stars } from "@/components/ui";
import { CATEGORIES } from "@/lib/catalog";
import { BASE, SUPPORT_PHONE } from "@/lib/config";
import { durationLabel, inr } from "@/lib/format";
import { distanceM } from "@/lib/geo";
import { activeServices, ratingSummary } from "@/lib/queries";
import { parseSeo, seoSlug, servedLocalities } from "@/lib/seo";

export const dynamic = "force-dynamic";

export function generateMetadata({ params }: { params: { seo: string } }): Metadata {
  const p = parseSeo(params.seo);
  if (!p) return {};
  return {
    title: `${p.category.shortName} in ${p.locality.name}, ${BASE.cityName} — ${p.category.startingLabel}`,
    description: `Verified ${p.category.shortName.toLowerCase()} in ${p.locality.name} (${p.locality.pin}). ${p.category.tagline}. Same-day slots, 9 AM – 12:30 AM.`,
    alternates: { canonical: `/${params.seo}` },
  };
}

export default function SeoPage({ params }: { params: { seo: string } }) {
  const p = parseSeo(params.seo);
  if (!p) notFound();
  const { category: c, locality: l } = p;
  const services = activeServices(c.slug).slice(0, 8);
  const rating = ratingSummary(c.slug);
  const km = (distanceM(l, BASE) / 1000).toFixed(1);
  const neighbours = servedLocalities().filter((x) => x.slug !== l.slug).sort((a, b) => distanceM(a, l) - distanceM(b, l)).slice(0, 6);
  const faqs = [
    { q: `Do you provide ${c.shortName.toLowerCase()} services in ${l.name}?`, a: `Yes. ${l.name} (${l.pin}) is about ${km} km from our base — well inside our 2 km service area, so same-day slots are usually available.` },
    { q: `How much does a ${c.shortName.toLowerCase()} cost in ${l.name}?`, a: `Prices are the same across our service area: ${c.startingLabel.toLowerCase()}. See the rate card on this page; GST extra.` },
    ...c.faqs.slice(0, 3),
  ];
  return (
    <div className="container-x max-w-4xl space-y-10 py-10">
      <JsonLd data={{ "@context": "https://schema.org", "@type": "LocalBusiness", name: `HomeServ ${c.shortName}`, telephone: SUPPORT_PHONE, areaServed: { "@type": "Place", name: `${l.name}, ${BASE.cityName}`, address: { "@type": "PostalAddress", postalCode: l.pin, addressLocality: l.name, addressRegion: "Karnataka", addressCountry: "IN" } }, openingHours: "Mo-Su 09:00-00:30", aggregateRating: { "@type": "AggregateRating", ratingValue: rating.avg, reviewCount: rating.total } }} />
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Service", serviceType: c.name, areaServed: l.name, provider: { "@type": "LocalBusiness", name: "HomeServ" } }} />
      <JsonLd data={faqLd(faqs)} />
      <header>
        <p className="text-sm text-ink-muted"><Link href="/">Home</Link> › <Link href={`/services/${c.slug}`}>{c.shortName}</Link> › {l.name}</p>
        <h1 className="mt-2 text-3xl font-bold">{c.icon} {c.shortName} in {l.name}, {BASE.cityName}</h1>
        <p className="mt-2 flex items-center gap-2 text-sm"><Stars value={rating.avg} /> {rating.avg} · {rating.total.toLocaleString("en-IN")} reviews · {km} km from our base</p>
        <p className="mt-3 text-ink-muted">{c.description} Serving {l.name} and nearby areas from 9 AM to 12:30 AM, every day.</p>
        <div className="mt-5 flex gap-3"><Link href={`/services/${c.slug}`} className="btn-primary">Book {c.shortName}</Link><a href={`tel:${SUPPORT_PHONE}`} className="btn-outline">☎ Call</a></div>
      </header>
      <section>
        <h2 className="mb-3 text-xl font-bold">{c.shortName} prices in {l.name}</h2>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-sm"><tbody>
            {services.map((s, i) => <tr key={s.id} className={i % 2 ? "bg-slate-50/60" : ""}><td className="px-4 py-2.5">{s.name}</td><td className="px-4 py-2.5 text-right font-semibold">{inr(s.price)}{s.unit ?? ""}</td><td className="hidden px-4 py-2.5 text-right text-ink-muted sm:table-cell">{durationLabel(s.durationMin)}</td></tr>)}
          </tbody></table>
        </div>
      </section>
      <section><h2 className="mb-3 text-xl font-bold">FAQs</h2><Faqs items={faqs} /></section>
      <section>
        <h2 className="mb-3 text-lg font-bold">{c.shortName} in nearby areas</h2>
        <div className="flex flex-wrap gap-2">{neighbours.map((n) => <Link key={n.slug} className="chip" href={`/${seoSlug(c.slug, n.slug)}`}>{n.name}</Link>)}</div>
        <h2 className="mb-3 mt-6 text-lg font-bold">Other services in {l.name}</h2>
        <div className="flex flex-wrap gap-2">{CATEGORIES.filter((x) => x.slug !== c.slug).map((x) => <Link key={x.slug} className="chip" href={`/${seoSlug(x.slug, l.slug)}`}>{x.icon} {x.shortName}</Link>)}</div>
      </section>
    </div>
  );
}
