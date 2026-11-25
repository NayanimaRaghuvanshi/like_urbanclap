import Link from "next/link";
import type { Metadata } from "next";
import { Avatar, Badge } from "@/components/ui";
import { categoryBySlug } from "@/lib/catalog";
import { providersFor } from "@/lib/queries";
import { syncDb } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Our Professionals" };

export default async function Providers() {
  await syncDb();
  const list = providersFor();
  return (
    <div className="container-x py-10">
      <h1 className="section-title">Our Professionals</h1>
      <p className="mt-2 text-ink-muted">Every pro is employed or contracted by HomeServ, Aadhaar-KYC'd and police-verified. We assign the best available pro for your slot.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((p) => (
          <Link key={p.id} href={`/providers/${p.id}`} className="card flex gap-4 p-5 transition hover:shadow-xl">
            <Avatar name={p.name} hue={p.avatarHue} />
            <div className="min-w-0">
              <p className="font-semibold">{p.name}</p>
              <p className="truncate text-sm text-ink-muted">{p.speciality}</p>
              <p className="mt-1 text-sm">⭐ {p.rating} · {p.totalJobs} jobs · {p.experienceYears} yrs</p>
              <div className="mt-2 flex flex-wrap gap-1">{p.categories.map((c) => <Badge key={c}>{categoryBySlug(c)?.shortName}</Badge>)}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
