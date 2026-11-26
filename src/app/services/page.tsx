import Link from "next/link";
import type { Metadata } from "next";
import { CATEGORIES } from "@/lib/catalog";
import { durationLabel, inr } from "@/lib/format";
import { activeServices, ratingSummary } from "@/lib/queries";
import { syncDb } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { alternates: { canonical: "/services" }, title: "All Services & Rate Card", description: "Full rate card for plumbing, electrical, carpentry, PVC panels, wall design, furniture and painting." };

export default async function ServicesPage() {
  await syncDb();
  return (
    <div className="container-x py-10">
      <h1 className="section-title">All Services</h1>
      <p className="mt-2 text-ink-muted">Pick a category to book. Full rate card below — prices exclude GST.</p>
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {CATEGORIES.map((c) => {
          const r = ratingSummary(c.slug);
          return (
            <Link key={c.slug} href={`/services/${c.slug}`} className="card p-5 transition hover:-translate-y-1 hover:shadow-xl">
              <span className="text-3xl">{c.icon}</span>
              <h2 className="mt-2 font-semibold">{c.shortName}</h2>
              <p className="text-sm text-ink-muted">{c.tagline}</p>
              <p className="mt-2 text-sm">{r.total > 0 ? `⭐ ${r.avg} · ` : ""}{c.startingLabel}</p>
            </Link>
          );
        })}
      </div>
      <h2 className="mt-14 text-xl font-bold" id="rate-card">Full Rate Card</h2>
      <div className="mt-4 space-y-8">
        {CATEGORIES.map((c) => (
          <section key={c.slug}>
            <h3 className="mb-2 font-semibold">{c.icon} {c.shortName}</h3>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <table className="w-full text-left text-sm">
                <tbody>
                  {activeServices(c.slug).map((s, i) => (
                    <tr key={s.id} className={i % 2 ? "bg-slate-50/60" : ""}>
                      <td className="px-4 py-2.5">{s.name}</td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-right font-semibold tabular-nums">{inr(s.price)}{s.unit ?? ""}</td>
                      <td className="hidden whitespace-nowrap px-4 py-2.5 text-right text-ink-muted sm:table-cell">{durationLabel(s.durationMin)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
