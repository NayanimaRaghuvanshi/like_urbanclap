import type { Metadata } from "next";
import { bookingView } from "@/lib/bookings";
import { categoryBySlug } from "@/lib/catalog";
import { db, syncDb } from "@/lib/db";
import { visibleReviews } from "@/lib/queries";
import { currentProId } from "@/lib/session";
import { bookableDates } from "@/lib/slots";
import { ProDashboard, ProLogin } from "./ProDashboard";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Partner Dashboard", robots: { index: false } };

export default async function ProPage() {
  await syncDb();
  const id = currentProId();
  const p = id ? db().providers.find((x) => x.id === id) : undefined;
  if (!p) return <ProLogin />;
  const jobs = db()
    .bookings.filter((b) => b.providerId === p.id)
    .sort((a, b) => a.date.localeCompare(b.date) || a.slot - b.slot)
    .map((b) => ({
      ...bookingView(b, "provider"),
      // Pros see what they need for the job; the customer's number is masked (calls are bridged by support).
      customerPhone: b.customerPhone.replace(/^(\+91\d{2})\d{5}(\d{3})$/, "$1•••••$2"),
      notes: b.notes,
      photos: b.photos,
    }));
  const reviews = visibleReviews((r) => r.providerId === p.id).slice(0, 5);
  return (
    <ProDashboard
      provider={{ name: p.name, rating: p.rating, totalJobs: p.totalJobs, categories: p.categories.map((c) => categoryBySlug(c)?.shortName ?? c), leaveDates: p.leaveDates }}
      jobs={jobs}
      reviews={reviews}
      dates={bookableDates()}
    />
  );
}
