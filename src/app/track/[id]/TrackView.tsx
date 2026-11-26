"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { BookingActions, ReviewForm } from "@/components/BookingActions";
import { OtpLogin, useMe } from "@/components/OtpLogin";
import { WHATSAPP_NUMBER } from "@/lib/config";
import { api } from "@/components/store";
import { Avatar, Badge, Stars } from "@/components/ui";
import type { BookingView } from "@/lib/bookings";
import { dateLabel, inr, slotLabel } from "@/lib/format";
import type { BookingStatus } from "@/lib/types";

const STEPS: { s: BookingStatus; label: string }[] = [
  { s: "confirmed", label: "Booking Confirmed" },
  { s: "assigned", label: "Professional Assigned" },
  { s: "on_way", label: "On the Way" },
  { s: "started", label: "Job Started" },
  { s: "completed", label: "Job Completed" },
];
const ORDER: BookingStatus[] = ["confirmed", "assigned", "on_way", "started", "completed"];
const time = (iso: string) => new Date(iso).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" });

export function TrackView({ id, isNew }: { id: string; isNew: boolean }) {
  const [b, setB] = useState<BookingView>();
  const [err, setErr] = useState<{ msg: string; auth?: boolean }>();
  const { me } = useMe();
  const load = useCallback(async () => {
    try {
      const r = await api<{ booking: BookingView }>(`/api/bookings/${encodeURIComponent(id)}`);
      setB(r.booking);
      setErr(undefined);
    } catch (e) {
      const msg = (e as Error).message;
      setErr({ msg, auth: /log in/i.test(msg) });
    }
  }, [id]);
  useEffect(() => {
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, [load]);

  if (err?.auth)
    return (
      <div className="container-x max-w-md py-12">
        <h1 className="text-2xl font-bold">Track booking {id}</h1>
        {me?.otpMode === "none" ? (
          <p className="mt-2 text-ink-muted">
            For your privacy, bookings open only on the device they were made from.{" "}
            <a className="text-primary underline" href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hi, I need an update on booking ${id}`)}`} target="_blank" rel="noopener noreferrer">Message us on WhatsApp</a> for an update.
          </p>
        ) : (
          <>
            <p className="mb-6 mt-2 text-ink-muted">Verify the mobile number used for this booking.</p>
            <div className="card p-5"><OtpLogin onVerified={load} /></div>
          </>
        )}
      </div>
    );
  if (err) return <div className="container-x py-16 text-center"><p className="text-lg font-semibold">{err.msg}</p><Link className="btn-primary mt-6" href="/my-bookings">My Bookings</Link></div>;
  if (!b) return <div className="container-x max-w-3xl space-y-4 py-10"><div className="skeleton h-24" /><div className="skeleton h-40" /><div className="skeleton h-64" /></div>;

  const cancelled = b.status === "cancelled";
  const idx = ORDER.indexOf(b.status);
  const at = (s: BookingStatus) => [...b.timeline].reverse().find((t) => t.status === s);

  return (
    <div className="container-x max-w-3xl space-y-5 py-8">
      {isNew && !cancelled && (
        <div className="rounded-3xl bg-gradient-to-br from-success to-emerald-600 p-6 text-white">
          <p className="text-4xl">✅</p>
          <h1 className="mt-2 text-2xl font-bold">Booking Confirmed!</h1>
          <p className="mt-1 text-white/90">Booking ID: <b>#{b.id}</b></p>
          <p className="mt-2 text-sm text-white/90">Your {b.categoryName.toLowerCase()} will arrive at your doorstep. A confirmation has been sent via SMS and WhatsApp.</p>
        </div>
      )}
      {!isNew && (
        <div>
          <Link href="/my-bookings" className="text-sm text-ink-muted hover:text-primary">← My Bookings</Link>
          <h1 className="mt-2 text-2xl font-bold">Booking #{b.id}</h1>
        </div>
      )}

      <div className="card grid gap-3 p-5 text-sm sm:grid-cols-2">
        <p>🧰 <b>{b.categoryName}:</b> {b.items.map((i) => i.name + (i.qty > 1 ? ` × ${i.qty}` : "")).join(", ")}</p>
        <p>📅 {dateLabel(b.date)} · {slotLabel(b.slot)}</p>
        <p>📍 {b.address.line1}, {b.address.building}, {b.address.locality}</p>
        <p>💰 {inr(b.quote.total)} · {b.paymentStatus === "paid" ? <Badge tone="green">Paid{b.paymentMethod === "online" ? " online" : ""}</Badge> : b.paymentStatus === "refunded" ? <Badge tone="gray">Refunded</Badge> : <Badge tone="amber">Pay after service</Badge>}</p>
      </div>

      {b.provider && !cancelled && (
        <div className="card p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-muted">👤 Meet your professional</p>
          <div className="flex gap-4">
            <Avatar name={b.provider.name} hue={b.provider.avatarHue} size={64} />
            <div className="flex-1 text-sm">
              <Link href={`/providers/${b.provider.id}`} className="text-lg font-semibold hover:text-primary">{b.provider.name}</Link>
              <p>{b.provider.rating > 0 ? `⭐ ${b.provider.rating} (${b.provider.totalJobs} jobs) · ` : ""}{b.provider.experienceYears} yrs experience</p>
              <p className="text-ink-muted">Speciality: {b.provider.speciality}</p>
              <p className="mt-1 flex flex-wrap gap-1.5">{b.provider.aadhaarVerified && <Badge tone="green">✅ Aadhaar KYC</Badge>}{b.provider.policeVerified && <Badge tone="green">✅ Police verified</Badge>}</p>
              <p className="mt-2 text-ink-muted">📞 Will call 30 mins before arrival</p>
            </div>
          </div>
        </div>
      )}

      {!cancelled && b.status !== "completed" && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className={`rounded-2xl p-5 ${["assigned", "on_way", "confirmed"].includes(b.status) ? "bg-primary text-white" : "bg-slate-100 text-ink-muted"}`}>
            <p className="text-xs font-semibold uppercase tracking-wide opacity-80">Start OTP</p>
            <p className="mt-1 font-display text-4xl font-bold tracking-[0.3em]">{b.startOtp}</p>
            <p className="mt-1 text-xs opacity-80">Share with your pro when they arrive</p>
          </div>
          <div className={`rounded-2xl p-5 ${b.status === "started" ? "bg-secondary text-ink" : "bg-slate-100 text-ink-muted"}`}>
            <p className="text-xs font-semibold uppercase tracking-wide opacity-80">End OTP</p>
            <p className="mt-1 font-display text-4xl font-bold tracking-[0.3em]">{b.endOtp ?? "····"}</p>
            <p className="mt-1 text-xs opacity-80">{b.endOtp ? "Share only when you're satisfied with the work" : "Shown once the job starts"}</p>
          </div>
        </div>
      )}

      <div className="card p-5">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-ink-muted">Booking status</p>
        {cancelled ? (
          <p className="rounded-xl bg-danger-50 p-4 text-sm text-red-700">❌ Cancelled — {b.timeline[b.timeline.length - 1]?.note}{b.cancelFee ? ` (fee ${inr(b.cancelFee)})` : ""}</p>
        ) : (
          <ol className="relative space-y-5 border-l-2 border-slate-200 pl-6">
            {[...STEPS, { s: "review" as const, label: "Rate & Review" }].map((st, i) => {
              const done = st.s === "review" ? !!b.review : i <= idx;
              const current = st.s !== "review" && i === idx + 1;
              const ev = st.s !== "review" ? at(st.s) : undefined;
              return (
                <li key={st.s} className="relative">
                  <span className={`absolute -left-[33px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-white ${done ? "bg-success" : current ? "bg-primary animate-pulse" : "bg-slate-300"}`} />
                  <p className={`font-medium ${done ? "" : "text-ink-muted"}`}>
                    {st.label}
                    {ev && <span className="ml-2 text-sm font-normal text-ink-muted">— {time(ev.at)}{ev.note && st.s !== "confirmed" ? ` · ${ev.note}` : ""} ✅</span>}
                  </p>
                  {st.s === "started" && !done && <p className="text-xs text-ink-muted">Start OTP required</p>}
                  {st.s === "completed" && !done && <p className="text-xs text-ink-muted">End OTP + payment</p>}
                </li>
              );
            })}
          </ol>
        )}
      </div>

      {b.status === "completed" && (
        <div className="card p-5">
          {b.review ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Your review</p>
              <Stars value={b.review.rating} size="text-xl" />
              {b.review.text && <p className="mt-1 text-sm">“{b.review.text}”</p>}
            </div>
          ) : (
            <>
              <h2 className="mb-3 font-semibold">⭐ How did {b.provider?.name.split(" ")[0] ?? "we"} do?</h2>
              <ReviewForm b={b} onChange={setB} />
            </>
          )}
          <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
            <Link className="btn-outline btn-sm" href={`/track/${b.id}/invoice`}>Download Invoice</Link>
            <Link className="btn-outline btn-sm" href={`/services/${b.category}`}>Rebook Same Service</Link>
          </div>
        </div>
      )}

      {!["completed", "cancelled", "started"].includes(b.status) && <BookingActions b={b} onChange={setB} />}
      <p className="text-center text-sm text-ink-muted">📲 WhatsApp updates are sent automatically. This page refreshes every 15 seconds.</p>
    </div>
  );
}
