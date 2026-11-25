"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, useToast } from "@/components/store";
import { Badge, Stars } from "@/components/ui";
import type { BookingView } from "@/lib/bookings";
import { dateLabel, inr, relTime, slotLabel } from "@/lib/format";
import { istDate } from "@/lib/slots";
import type { Review } from "@/lib/types";

type Job = BookingView & { customerPhone: string; notes: string; photos: string[] };

export function ProLogin() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [err, setErr] = useState("");
  return (
    <div className="container-x max-w-sm py-16">
      <h1 className="text-2xl font-bold">Partner Login</h1>
      <p className="mt-1 text-sm text-ink-muted">For HomeServ professionals.</p>
      <form
        className="card mt-6 space-y-4 p-5"
        onSubmit={async (e) => {
          e.preventDefault();
          setErr("");
          try {
            await api("/api/pro/login", { json: { phone, pin } });
            router.refresh();
          } catch (x) {
            setErr((x as Error).message);
          }
        }}
      >
        <label className="block"><span className="label">Mobile number</span><input className="input" inputMode="numeric" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} /></label>
        <label className="block"><span className="label">4-digit PIN</span><input className="input tracking-[0.5em]" type="password" inputMode="numeric" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))} /></label>
        {err && <p className="text-sm text-danger">{err}</p>}
        <button className="btn-primary w-full">Log in</button>
        <p className="text-xs text-ink-muted">Demo: 9800000001 / PIN 1111 (Rajesh, plumber) · 9800000005 / 5555 (Anil, panels)</p>
      </form>
    </div>
  );
}

export function ProDashboard({ provider, jobs, reviews, dates }: { provider: { name: string; rating: number; totalJobs: number; categories: string[]; leaveDates: string[] }; jobs: Job[]; reviews: Review[]; dates: string[] }) {
  const router = useRouter();
  const toast = useToast();
  const [tab, setTab] = useState<"today" | "upcoming" | "history">("today");
  const today = istDate();
  const active = jobs.filter((j) => !["completed", "cancelled"].includes(j.status));
  // Completed-but-unpaid jobs stay on "today" so the pro can record payment right away.
  const toCollect = jobs.filter((j) => j.status === "completed" && j.paymentStatus !== "paid");
  const list = tab === "today" ? [...active.filter((j) => j.date <= today), ...toCollect] : tab === "upcoming" ? active.filter((j) => j.date > today) : jobs.filter((j) => ["completed", "cancelled"].includes(j.status)).reverse();
  const done = jobs.filter((j) => j.status === "completed");
  const earned = done.filter((j) => j.paymentStatus === "paid").reduce((s, j) => s + j.quote.taxable, 0);
  const pending = done.filter((j) => j.paymentStatus !== "paid").reduce((s, j) => s + j.quote.total, 0);

  async function act(id: string, action: string, otp?: string) {
    try {
      await api(`/api/pro/jobs/${id}`, { json: { action, otp } });
      toast("Updated", "ok");
      router.refresh();
    } catch (e) {
      toast((e as Error).message, "err");
    }
  }

  return (
    <div className="container-x max-w-4xl space-y-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Hi, {provider.name.split(" ")[0]} 👋</h1>
          <p className="text-sm text-ink-muted">{provider.categories.join(", ")} · ⭐ {provider.rating} · {provider.totalJobs} jobs</p>
        </div>
        <button className="btn-outline btn-sm" onClick={async () => { await api("/api/pro/logout", { method: "POST" }); router.refresh(); }}>Log out</button>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Active jobs" value={String(active.length)} />
        <Stat label="Collected (excl. GST)" value={inr(earned)} />
        <Stat label="To collect" value={inr(pending)} />
      </div>

      <div className="flex gap-2">
        {(["today", "upcoming", "history"] as const).map((t) => <button key={t} className={`chip capitalize ${tab === t ? "chip-active" : ""}`} onClick={() => setTab(t)}>{t}</button>)}
      </div>
      <div className="space-y-4">
        {list.length === 0 && <p className="card p-6 text-center text-ink-muted">No jobs here.</p>}
        {list.map((j) => <JobCard key={j.id} j={j} act={act} />)}
      </div>

      <section className="card p-5">
        <h2 className="font-semibold">Availability — mark leave</h2>
        <p className="mb-3 text-sm text-ink-muted">Tap a day to block it. Existing jobs on that day stay assigned — call support to reassign.</p>
        <div className="flex flex-wrap gap-2">
          {dates.map((d) => {
            const off = provider.leaveDates.includes(d);
            return (
              <button key={d} className={`chip ${off ? "border-danger bg-danger-50 text-red-700" : ""}`} onClick={async () => { await api("/api/pro/leave", { json: { date: d } }); router.refresh(); }}>
                {dateLabel(d, { weekday: "short", day: "numeric", month: "short" })} {off ? "· Leave" : ""}
              </button>
            );
          })}
        </div>
      </section>

      <section className="card p-5">
        <h2 className="mb-3 font-semibold">Recent reviews</h2>
        {reviews.length ? reviews.map((r) => <div key={r.id} className="border-b border-slate-100 py-2 text-sm last:border-0"><Stars value={r.rating} /> “{r.text}” <span className="text-ink-muted">— {r.customerName}, {relTime(r.createdAt)}</span></div>) : <p className="text-sm text-ink-muted">No reviews yet.</p>}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="card p-4"><p className="text-xs text-ink-muted">{label}</p><p className="font-display text-xl font-bold">{value}</p></div>;
}

function JobCard({ j, act }: { j: Job; act: (id: string, a: string, otp?: string) => void }) {
  const [otp, setOtp] = useState("");
  const tone = j.status === "completed" ? "green" : j.status === "cancelled" ? "red" : j.status === "started" ? "amber" : "blue";
  return (
    <article className="card p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-semibold">#{j.id}</p>
        <Badge tone={tone}>{j.status.replace("_", " ")}</Badge>
      </div>
      <div className="mt-2 grid gap-1 text-sm sm:grid-cols-2">
        <p>📅 {dateLabel(j.date)} · <b>{slotLabel(j.slot)}</b></p>
        <p>🧰 {j.items.map((i) => i.name + (i.qty > 1 ? ` × ${i.qty}` : "")).join(", ")}</p>
        <p>👤 {j.customerName} · {j.customerPhone}</p>
        <p>📍 {j.address.line1}, {j.address.building}, {j.address.locality}{j.address.landmark ? ` (near ${j.address.landmark})` : ""}</p>
        <p className="sm:col-span-2">📝 “{j.notes}”</p>
        <p>💰 {inr(j.quote.total)} · {j.paymentStatus === "paid" ? "Paid" : j.paymentMethod === "online" ? "Online (pending)" : "Collect after service"}</p>
        <a className="text-primary" href={`https://www.google.com/maps/dir/?api=1&destination=${j.address.lat},${j.address.lng}`} target="_blank" rel="noopener noreferrer">🧭 Directions</a>
      </div>
      {j.photos.length > 0 && (
        <div className="mt-3 flex gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {j.photos.map((p, i) => <a key={i} href={p} target="_blank" rel="noopener noreferrer"><img src={p} alt="Customer upload" className="h-16 w-16 rounded-lg object-cover" /></a>)}
        </div>
      )}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {j.status === "assigned" && <button className="btn-primary btn-sm" onClick={() => act(j.id, "on_way")}>🚗 I'm on the way</button>}
        {(j.status === "on_way" || j.status === "assigned" || j.status === "started") && (
          <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); act(j.id, j.status === "started" ? "complete" : "start", otp); setOtp(""); }}>
            <input className="input w-28 min-h-[36px] py-1.5 tracking-[0.3em]" inputMode="numeric" placeholder={j.status === "started" ? "End OTP" : "Start OTP"} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))} aria-label="Customer OTP" />
            <button className="btn-amber btn-sm" disabled={otp.length !== 4}>{j.status === "started" ? "Complete job" : "Start job"}</button>
          </form>
        )}
        {j.status === "completed" && j.paymentStatus !== "paid" && <button className="btn-primary btn-sm" onClick={() => act(j.id, "mark_paid")}>💰 Mark {inr(j.quote.total)} collected</button>}
      </div>
    </article>
  );
}
