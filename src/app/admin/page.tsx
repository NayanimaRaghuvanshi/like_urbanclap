import type { Metadata } from "next";
import { bookingView } from "@/lib/bookings";
import { CATEGORIES } from "@/lib/catalog";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/session";
import { allSlots, bookableDates, istDate, slotGroup } from "@/lib/slots";
import { AdminDashboard, AdminLogin } from "./AdminDashboard";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin", robots: { index: false } };

export default function AdminPage() {
  if (!isAdmin()) return <AdminLogin />;
  const d = db();
  const bookings = d.bookings.map((b) => ({ ...bookingView(b, "admin"), customerPhone: b.customerPhone, notes: b.notes, photos: b.photos }));

  // Analytics
  const live = d.bookings.filter((b) => b.status !== "cancelled");
  const completed = d.bookings.filter((b) => b.status === "completed");
  const revenue = completed.filter((b) => b.paymentStatus === "paid").reduce((s, b) => s + b.quote.total, 0);
  const pendingPay = completed.filter((b) => b.paymentStatus !== "paid").reduce((s, b) => s + b.quote.total, 0);
  const byCategory = CATEGORIES.map((c) => ({ label: c.shortName, value: live.filter((b) => b.category === c.slug).length }));
  const svcCount = new Map<string, number>();
  live.forEach((b) => b.items.forEach((i) => svcCount.set(i.name, (svcCount.get(i.name) ?? 0) + i.qty)));
  const popular = [...svcCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([label, value]) => ({ label, value }));
  const locCount = new Map<string, number>();
  live.forEach((b) => locCount.set(b.address.locality, (locCount.get(b.address.locality) ?? 0) + 1));
  const localities = [...locCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([label, value]) => ({ label, value }));
  const groups = ["Morning", "Afternoon", "Evening", "Night"] as const;
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const heat = groups.map((g) => days.map((_, wd) => live.filter((b) => slotGroup(b.slot) === g && new Date(b.date + "T00:00:00Z").getUTCDay() === wd).length));
  const newReviews = d.reviews.filter((r) => !r.id.startsWith("r-seed"));
  const avgRating = newReviews.length ? Math.round((newReviews.reduce((s, r) => s + r.rating, 0) / newReviews.length) * 10) / 10 : null;

  return (
    <AdminDashboard
      today={istDate()}
      bookings={bookings}
      providers={d.providers}
      services={d.services}
      settings={d.settings}
      reviews={d.reviews}
      promos={d.promos}
      waitlist={d.waitlist}
      contacts={d.contacts}
      notifications={d.notifications.slice(0, 100)}
      customers={d.customers.map((c) => ({ ...c, bookings: d.bookings.filter((b) => b.customerPhone === c.phone).length, spent: d.bookings.filter((b) => b.customerPhone === c.phone && b.paymentStatus === "paid").reduce((s, b) => s + b.quote.total, 0) }))}
      dates={bookableDates()}
      slots={allSlots()}
      analytics={{ total: d.bookings.length, active: live.filter((b) => b.status !== "completed").length, completed: completed.length, cancelled: d.bookings.length - live.length, revenue, pendingPay, avgRating, newReviews: newReviews.length, byCategory, popular, localities, heat, days, groups: [...groups] }}
    />
  );
}
