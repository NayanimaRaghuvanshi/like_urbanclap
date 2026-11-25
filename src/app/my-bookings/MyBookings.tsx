"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BookingActions } from "@/components/BookingActions";
import { OtpLogin, useMe } from "@/components/OtpLogin";
import { api } from "@/components/store";
import { Stars } from "@/components/ui";
import type { BookingView } from "@/lib/bookings";
import { CATEGORIES } from "@/lib/catalog";
import { dateLabel, inr, slotLabel } from "@/lib/format";

const TABS = ["Upcoming", "Completed", "Cancelled"] as const;
const STATUS: Record<string, string> = { confirmed: "Confirmed — assigning pro", assigned: "Professional Assigned 👷", on_way: "Professional On The Way 🚗", started: "Job In Progress 🔨", completed: "Completed ✅", cancelled: "Cancelled" };

export function MyBookings() {
  const { me, setMe } = useMe();
  const [list, setList] = useState<BookingView[]>();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Upcoming");
  const [trackId, setTrackId] = useState("");

  useEffect(() => {
    if (me?.phone) api<{ bookings: BookingView[] }>("/api/bookings").then((r) => setList(r.bookings)).catch(() => setList([]));
  }, [me]);

  if (!me) return <div className="container-x py-10"><div className="skeleton h-64" /></div>;
  if (!me.phone)
    return (
      <div className="container-x grid max-w-4xl gap-6 py-10 md:grid-cols-2">
        <div>
          <h1 className="text-2xl font-bold">My Bookings</h1>
          <p className="mb-6 mt-2 text-ink-muted">Log in with the mobile number you booked with.</p>
          <div className="card p-5"><OtpLogin onVerified={setMe} /></div>
        </div>
        <div className="card h-fit p-5">
          <h2 className="font-semibold">Track a booking</h2>
          <p className="mt-1 text-sm text-ink-muted">Have a booking ID from SMS/WhatsApp?</p>
          <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (trackId.trim()) window.location.href = `/track/${encodeURIComponent(trackId.trim().replace(/^#/, "").toUpperCase())}`; }}>
            <input className="input uppercase" placeholder="HS-2026-1125-0001" value={trackId} onChange={(e) => setTrackId(e.target.value)} aria-label="Booking ID" />
            <button className="btn-primary shrink-0">Track</button>
          </form>
        </div>
      </div>
    );

  const filtered = (list ?? []).filter((b) => (tab === "Upcoming" ? !["completed", "cancelled"].includes(b.status) : tab === "Completed" ? b.status === "completed" : b.status === "cancelled"));
  const update = (nb: BookingView) => setList((l) => l?.map((x) => (x.id === nb.id ? nb : x)));

  return (
    <div className="container-x max-w-3xl py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Bookings</h1>
        <button className="btn-ghost btn-sm" onClick={async () => { await api("/api/logout", { method: "POST" }); setMe({ phone: null, name: null, email: null }); setList(undefined); }}>Log out</button>
      </div>
      <p className="text-sm text-ink-muted">{me.phone}</p>
      <div className="mt-5 flex gap-2" role="tablist">
        {TABS.map((t) => <button key={t} role="tab" aria-selected={tab === t} className={`chip ${tab === t ? "chip-active" : ""}`} onClick={() => setTab(t)}>{t}</button>)}
      </div>
      <div className="mt-5 space-y-4">
        {!list && [1, 2].map((i) => <div key={i} className="skeleton h-40" />)}
        {list && filtered.length === 0 && (
          <div className="card p-8 text-center">
            <p className="text-ink-muted">No {tab.toLowerCase()} bookings.</p>
            <Link href="/services" className="btn-primary mt-4">Book a Service</Link>
          </div>
        )}
        {filtered.map((b) => {
          const icon = CATEGORIES.find((c) => c.slug === b.category)?.icon;
          return (
            <article key={b.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <Link href={`/track/${b.id}`} className="font-semibold hover:text-primary">#{b.id}</Link>
                <span className="text-xs font-medium text-ink-muted">{STATUS[b.status]}</span>
              </div>
              <div className="mt-2 space-y-1 text-sm">
                <p>{icon} {b.categoryName}: {b.items.map((i) => i.name).join(" + ")}</p>
                <p>📅 {dateLabel(b.date)} • {slotLabel(b.slot)}</p>
                {tab === "Upcoming" && <p>📍 {b.address.line1}, {b.address.building}, {b.address.locality}</p>}
                {b.provider && tab !== "Cancelled" && <p>👤 {b.provider.name} • ⭐ {b.provider.rating}</p>}
                {tab === "Completed" && <p>💰 {inr(b.quote.total)} ({b.paymentStatus === "paid" ? (b.paymentMethod === "online" ? "Paid online" : "Paid") : "Payment pending"})</p>}
                {b.review && <p className="flex items-center gap-2">You rated: <Stars value={b.review.rating} /></p>}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {tab === "Upcoming" && <Link href={`/track/${b.id}`} className="btn-primary btn-sm">Track</Link>}
                {tab === "Upcoming" && b.status !== "started" && <BookingActions b={b} onChange={update} compact />}
                {tab !== "Upcoming" && <Link href={`/services/${b.category}`} className="btn-outline btn-sm">Rebook Same Service</Link>}
                {tab === "Completed" && <Link href={`/track/${b.id}/invoice`} className="btn-outline btn-sm">Download Invoice</Link>}
                {tab === "Completed" && !b.review && <Link href={`/track/${b.id}`} className="btn-primary btn-sm">Review</Link>}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
