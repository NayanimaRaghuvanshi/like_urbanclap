import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ReviewList } from "@/components/ReviewList";
import { Avatar, Badge } from "@/components/ui";
import { WallArt } from "@/components/WallArt";
import { db, syncDb } from "@/lib/db";
import { visibleReviews } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  await syncDb();
  const p = db().providers.find((x) => x.id === params.id);
  return p ? { title: `${p.name} — ${p.speciality}` } : {};
}

export default async function ProviderPage({ params }: { params: { id: string } }) {
  await syncDb();
  const p = db().providers.find((x) => x.id === params.id && x.isActive);
  if (!p) notFound();
  const reviews = visibleReviews((r) => r.providerId === p.id);
  const since = new Date(p.joined + "-01").toLocaleDateString("en-IN", { month: "short", year: "numeric" });
  return (
    <div className="container-x max-w-4xl space-y-8 py-8">
      <Link href="/providers" className="text-sm text-ink-muted hover:text-primary">← Back</Link>
      <section className="card flex flex-col gap-6 p-6 sm:flex-row">
        <Avatar name={p.name} hue={p.avatarHue} size={112} />
        <div className="space-y-1 text-sm">
          <h1 className="text-2xl font-bold">{p.name}</h1>
          <p className="text-base">{p.speciality}</p>
          <p>{p.rating > 0 ? <>⭐ <b>{p.rating}</b> ({reviews.length} review{reviews.length === 1 ? "" : "s"} · {p.totalJobs} jobs)</> : <>🆕 New to HomeServ{p.totalJobs ? ` · ${p.totalJobs} jobs` : ""}</>}</p>
          <p>📅 With HomeServ since {since}</p>
          <p>🏅 {p.experienceYears} years experience</p>
          <div className="flex flex-wrap gap-2 pt-1">
            {p.aadhaarVerified && <Badge tone="green">✅ Aadhaar KYC Verified</Badge>}
            {p.policeVerified && <Badge tone="green">✅ Police Background Checked</Badge>}
          </div>
        </div>
      </section>
      <div className="grid gap-6 sm:grid-cols-2">
        <section className="card p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-muted">Services Offered</h2>
          <ul className="grid grid-cols-1 gap-1 text-sm">{p.servicesOffered.map((s) => <li key={s}>• {s}</li>)}</ul>
        </section>
        <section className="card p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-muted">Skills & Certifications</h2>
          {p.certifications.length ? <ul className="space-y-1 text-sm">{p.certifications.map((s) => <li key={s}>• {s}</li>)}</ul> : <p className="text-sm text-ink-muted">On-the-job trained; skills assessed by HomeServ.</p>}
        </section>
      </div>
      {p.gallery.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-bold">Work Gallery</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{p.gallery.map((g, i) => <div key={i} className="aspect-[4/3] overflow-hidden rounded-xl"><WallArt variant={g} /></div>)}</div>
        </section>
      )}
      <section>
        <h2 className="mb-3 text-lg font-bold">Reviews</h2>
        {reviews.length ? <ReviewList reviews={reviews} initial={6} filterable={false} /> : <p className="text-sm text-ink-muted">No reviews yet.</p>}
      </section>
      <p className="text-center text-xs text-ink-muted">For your safety, all communication happens through HomeServ — we don't share pros' personal numbers.</p>
    </div>
  );
}
