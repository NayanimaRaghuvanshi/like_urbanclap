"use client";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { api, useToast } from "@/components/store";
import { Badge, Sheet, Stars } from "@/components/ui";
import type { BookingView } from "@/lib/bookings";
import { CATEGORIES, categoryBySlug } from "@/lib/catalog";
import { dateLabel, inr, relTime, slotLabel, slotShort } from "@/lib/format";
import type { CategorySlug, Customer, NotificationLog, Promo, Provider, Review, Service, Settings } from "@/lib/types";

type AdminBooking = BookingView & { customerPhone: string; notes: string; photos: string[] };
type Bar = { label: string; value: number };
interface Props {
  today: string;
  bookings: AdminBooking[];
  providers: Provider[];
  services: Service[];
  settings: Settings;
  reviews: Review[];
  promos: Promo[];
  waitlist: { phone?: string; email?: string; locality?: string; at: string }[];
  contacts: { name: string; phone: string; message: string; at: string }[];
  notifications: NotificationLog[];
  customers: (Customer & { bookings: number; spent: number })[];
  dates: string[];
  slots: number[];
  whatsapp: { token: boolean; phoneId: boolean; verify: boolean; secret: boolean; storage: boolean; webhookUrl: string; lastInbound: string | null };
  analytics: { total: number; active: number; completed: number; cancelled: number; revenue: number; pendingPay: number; avgRating: number | null; newReviews: number; byCategory: Bar[]; popular: Bar[]; localities: Bar[]; heat: number[][]; days: string[]; groups: string[] };
}

const TABS = ["Bookings", "Providers", "Services", "Slots", "Reviews", "Promos", "Customers", "Analytics", "Inbox", "WhatsApp"] as const;

export function AdminLogin() {
  const router = useRouter();
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  return (
    <div className="container-x max-w-sm py-16">
      <h1 className="text-2xl font-bold">Admin</h1>
      <form className="card mt-6 space-y-4 p-5" onSubmit={async (e) => { e.preventDefault(); try { await api("/api/admin/login", { json: { password: pw } }); router.refresh(); } catch (x) { setErr((x as Error).message); } }}>
        <label className="block"><span className="label">Password</span><input className="input" type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoFocus /></label>
        {err && <p className="text-sm text-danger">{err}</p>}
        <button className="btn-primary w-full">Log in</button>
        <p className="text-xs text-ink-muted">Set ADMIN_PASSWORD in the environment (default for local dev: admin123).</p>
      </form>
    </div>
  );
}

export function AdminDashboard(p: Props) {
  const router = useRouter();
  const toast = useToast();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Bookings");
  const run = async (json: Record<string, unknown>, msg = "Saved") => {
    try {
      await api("/api/admin", { json });
      toast(msg, "ok");
      router.refresh();
      return true;
    } catch (e) {
      toast((e as Error).message, "err");
      return false;
    }
  };
  return (
    <div className="container-x py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <div className="flex gap-2">
          <button className="btn-outline btn-sm" onClick={() => router.refresh()}>↻ Refresh</button>
          <button className="btn-outline btn-sm" onClick={() => confirm("Delete ALL data — bookings, customers, providers, reviews — and start fresh? This cannot be undone.") && run({ op: "reset" }, "All data reset")}>Reset all data</button>
          <button className="btn-outline btn-sm" onClick={async () => { await api("/api/admin/login", { method: "DELETE" }); router.refresh(); }}>Log out</button>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Active bookings" value={p.analytics.active} />
        <Stat label="Completed" value={p.analytics.completed} />
        <Stat label="Revenue collected" value={inr(p.analytics.revenue)} />
        <Stat label="Pending collection" value={inr(p.analytics.pendingPay)} />
      </div>
      <div className="no-scrollbar -mx-4 mt-5 flex gap-2 overflow-x-auto px-4" role="tablist">
        {TABS.map((t) => <button key={t} role="tab" aria-selected={tab === t} className={`chip ${tab === t ? "chip-active" : ""}`} onClick={() => setTab(t)}>{t}</button>)}
      </div>
      <div className="mt-5">
        {tab === "Bookings" && <BookingsTab {...p} run={run} />}
        {tab === "Providers" && <ProvidersTab providers={p.providers} run={run} />}
        {tab === "Services" && <ServicesTab services={p.services} run={run} />}
        {tab === "Slots" && <SlotsTab settings={p.settings} providers={p.providers} dates={p.dates} slots={p.slots} run={run} />}
        {tab === "Reviews" && <ReviewsTab reviews={p.reviews} run={run} />}
        {tab === "Promos" && <PromosTab promos={p.promos} run={run} />}
        {tab === "Customers" && <Table head={["Name", "Phone", "Email", "Bookings", "Paid", "Since"]} rows={p.customers.map((c) => [c.name, c.phone, c.email ?? "—", c.bookings, inr(c.spent), new Date(c.createdAt).toLocaleDateString("en-IN")])} empty="No customers yet." />}
        {tab === "Analytics" && <AnalyticsTab a={p.analytics} />}
        {tab === "Inbox" && <InboxTab {...p} />}
        {tab === "WhatsApp" && <WhatsAppTab s={p.whatsapp} />}
      </div>
    </div>
  );
}

type Run = (json: Record<string, unknown>, msg?: string) => Promise<boolean>;

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return <div className="card p-4"><p className="text-xs text-ink-muted">{label}</p><p className="font-display text-2xl font-bold">{value}</p></div>;
}

function Table({ head, rows, empty }: { head: string[]; rows: React.ReactNode[][]; empty: string }) {
  if (!rows.length) return <p className="card p-6 text-center text-ink-muted">{empty}</p>;
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase text-ink-muted"><tr>{head.map((h) => <th key={h} className="px-3 py-2.5">{h}</th>)}</tr></thead>
        <tbody>{rows.map((r, i) => <tr key={i} className="border-t border-slate-100 align-top">{r.map((c, j) => <td key={j} className="px-3 py-2.5">{c}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

const statusTone = (s: string) => (s === "completed" ? "green" : s === "cancelled" ? "red" : s === "started" ? "amber" : s === "confirmed" ? "purple" : "blue") as "green";

function BookingsTab({ bookings, providers, today, run }: Props & { run: Run }) {
  const [filter, setFilter] = useState<"active" | "today" | "unassigned" | "all">("active");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<AdminBooking | null>(null);
  const list = bookings
    .filter((b) => (filter === "all" ? true : filter === "today" ? b.date === today : filter === "unassigned" ? !b.providerId && b.status !== "cancelled" : !["completed", "cancelled"].includes(b.status)))
    .filter((b) => !q || [b.id, b.customerName, b.customerPhone, b.address.locality].join(" ").toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2">
        {(["active", "today", "unassigned", "all"] as const).map((f) => <button key={f} className={`chip btn-sm capitalize ${filter === f ? "chip-active" : ""}`} onClick={() => setFilter(f)}>{f}</button>)}
        <input className="input max-w-xs min-h-[36px] py-1.5 text-sm" placeholder="Search ID, name, phone, area" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <Table
        head={["Booking", "When", "Customer", "Service", "Pro", "Amount", "Status", ""]}
        empty="No bookings match."
        rows={list.map((b) => [
          <span key="i" className="font-medium">{b.id}</span>,
          `${dateLabel(b.date, { day: "numeric", month: "short" })} ${slotLabel(b.slot)}`,
          <span key="c">{b.customerName}<br /><span className="text-xs text-ink-muted">{b.customerPhone}{b.phoneVerified === false ? " · unverified" : ""}</span></span>,
          <span key="s">{b.categoryName}<br /><span className="text-xs text-ink-muted">{b.items.map((i) => i.name).join(", ")}</span></span>,
          b.provider?.name ?? <Badge key="u" tone="red">Unassigned</Badge>,
          <span key="a">{inr(b.quote.total)}<br /><span className="text-xs text-ink-muted">{b.paymentStatus}</span></span>,
          <Badge key="st" tone={statusTone(b.status)}>{b.status.replace("_", " ")}</Badge>,
          <button key="m" className="btn-ghost btn-sm" onClick={() => setOpen(b)}>Manage</button>,
        ])}
      />
      <Sheet open={!!open} onClose={() => setOpen(null)} title={open ? `Booking ${open.id}` : ""} wide>
        {open && <ManageBooking b={bookings.find((x) => x.id === open.id) ?? open} providers={providers} run={run} />}
      </Sheet>
    </div>
  );
}

function ManageBooking({ b, providers, run }: { b: AdminBooking; providers: Provider[]; run: Run }) {
  const eligible = providers.filter((p) => p.isActive && p.categories.includes(b.category));
  const [pid, setPid] = useState(b.providerId ?? eligible[0]?.id ?? "");
  const canAssign = ["confirmed", "assigned"].includes(b.status);
  return (
    <div className="space-y-4 text-sm">
      <div className="grid gap-1 rounded-xl bg-slate-50 p-4 sm:grid-cols-2">
        <p>📅 {dateLabel(b.date)} · {slotLabel(b.slot)}</p>
        <p>👤 {b.customerName} · {b.customerPhone}</p>
        <p className="sm:col-span-2">📍 {b.address.line1}, {b.address.building}, {b.address.landmark ? b.address.landmark + ", " : ""}{b.address.locality} {b.address.pin} · {(b.distanceM / 1000).toFixed(2)} km</p>
        <p className="sm:col-span-2">📝 {b.notes}</p>
        <p>🔑 Start OTP {b.startOtp} · End OTP {b.endOtp}</p>
        <p>💳 {b.paymentMethod === "online" ? "Online" : "After service"} · {b.paymentStatus}{b.paymentRef ? ` (${b.paymentRef})` : ""}</p>
      </div>
      {b.photos.length > 0 && (
        // eslint-disable-next-line @next/next/no-img-element
        <div className="flex gap-2">{b.photos.map((ph, i) => <a key={i} href={ph} target="_blank" rel="noopener noreferrer"><img src={ph} alt="" className="h-20 w-20 rounded-lg object-cover" /></a>)}</div>
      )}
      {canAssign && (
        <div className="flex gap-2">
          <select className="input" value={pid} onChange={(e) => setPid(e.target.value)} aria-label="Professional">
            {eligible.map((p) => <option key={p.id} value={p.id}>{p.name}{p.rating > 0 ? ` (⭐ ${p.rating})` : ""}{p.leaveDates.includes(b.date) ? " — on leave" : ""}</option>)}
          </select>
          <button className="btn-primary shrink-0" disabled={!pid} onClick={() => run({ op: "assign", bookingId: b.id, providerId: pid }, "Assigned")}>{b.providerId ? "Reassign" : "Assign"}</button>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {b.status === "assigned" && <button className="btn-outline btn-sm" onClick={() => run({ op: "advance", bookingId: b.id, action: "on_way" })}>Mark on the way</button>}
        {["assigned", "on_way"].includes(b.status) && <button className="btn-outline btn-sm" onClick={() => run({ op: "advance", bookingId: b.id, action: "start", otp: b.startOtp })}>Start (with OTP)</button>}
        {b.status === "started" && <button className="btn-outline btn-sm" onClick={() => run({ op: "advance", bookingId: b.id, action: "complete", otp: b.endOtp })}>Complete (with OTP)</button>}
        {b.status === "completed" && b.paymentStatus !== "paid" && <button className="btn-outline btn-sm" onClick={() => run({ op: "advance", bookingId: b.id, action: "mark_paid" })}>Mark paid</button>}
        {["confirmed", "assigned", "on_way"].includes(b.status) && <button className="btn-outline btn-sm text-danger" onClick={() => confirm("Cancel this booking?") && run({ op: "cancel", bookingId: b.id }, "Cancelled")}>Cancel booking</button>}
        <a className="btn-outline btn-sm" href={`/track/${b.id}`} target="_blank">Customer view ↗</a>
      </div>
      <div>
        <p className="mb-1 font-semibold">Timeline</p>
        <ul className="space-y-1 text-xs text-ink-muted">{b.timeline.map((t, i) => <li key={i}>{new Date(t.at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} — {t.status}{t.note ? ` · ${t.note}` : ""}</li>)}</ul>
      </div>
    </div>
  );
}

function ProvidersTab({ providers, run }: { providers: Provider[]; run: Run }) {
  const blank = { id: "", name: "", phone: "", pin: "", categories: ["plumber"] as CategorySlug[], speciality: "", experienceYears: 1, aadhaarVerified: false, policeVerified: false, isActive: true };
  const [edit, setEdit] = useState<typeof blank | null>(null);
  return (
    <div>
      <button className="btn-primary btn-sm mb-3" onClick={() => setEdit(blank)}>+ Add provider</button>
      <Table
        head={["Name", "Categories", "Rating", "Jobs", "Verification", "Status", ""]}
        empty="No providers."
        rows={providers.map((p) => [
          <span key="n">{p.name}<br /><span className="text-xs text-ink-muted">{p.phone}</span></span>,
          p.categories.map((c) => categoryBySlug(c)?.shortName).join(", "),
          p.rating > 0 ? `⭐ ${p.rating}` : "—",
          p.totalJobs,
          <span key="v" className="flex flex-wrap gap-1">{p.aadhaarVerified ? <Badge tone="green">Aadhaar</Badge> : <Badge tone="red">No KYC</Badge>}{p.policeVerified ? <Badge tone="green">Police</Badge> : <Badge tone="red">No PV</Badge>}</span>,
          p.isActive ? <Badge key="a" tone="green">Active</Badge> : <Badge key="a" tone="gray">Inactive</Badge>,
          <button key="e" className="btn-ghost btn-sm" onClick={() => setEdit({ id: p.id, name: p.name, phone: p.phone, pin: p.pin, categories: p.categories, speciality: p.speciality, experienceYears: p.experienceYears, aadhaarVerified: p.aadhaarVerified, policeVerified: p.policeVerified, isActive: p.isActive })}>Edit</button>,
        ])}
      />
      <Sheet open={!!edit} onClose={() => setEdit(null)} title={edit?.id && providers.some((x) => x.id === edit.id) ? "Edit provider" : "Add provider"}>
        {edit && (
          <form className="space-y-3" onSubmit={async (e) => { e.preventDefault(); const id = edit.id || edit.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); if (await run({ op: "upsertProvider", provider: { ...edit, id } })) setEdit(null); }}>
            <In label="Name" v={edit.name} on={(v) => setEdit({ ...edit, name: v })} />
            <In label="Phone" v={edit.phone} on={(v) => setEdit({ ...edit, phone: v })} />
            <In label="Dashboard PIN (4 digits)" v={edit.pin} on={(v) => setEdit({ ...edit, pin: v.replace(/\D/g, "").slice(0, 4) })} />
            <In label="Speciality" v={edit.speciality} on={(v) => setEdit({ ...edit, speciality: v })} />
            <In label="Experience (years)" v={String(edit.experienceYears)} on={(v) => setEdit({ ...edit, experienceYears: Number(v.replace(/\D/g, "")) || 0 })} />
            <fieldset><legend className="label">Categories</legend><div className="flex flex-wrap gap-2">{CATEGORIES.map((c) => { const on = edit.categories.includes(c.slug); return <button type="button" key={c.slug} className={`chip ${on ? "chip-active" : ""}`} onClick={() => setEdit({ ...edit, categories: on ? edit.categories.filter((x) => x !== c.slug) : [...edit.categories, c.slug] })}>{c.shortName}</button>; })}</div></fieldset>
            <Check label="Aadhaar KYC verified" v={edit.aadhaarVerified} on={(v) => setEdit({ ...edit, aadhaarVerified: v })} />
            <Check label="Police verification done" v={edit.policeVerified} on={(v) => setEdit({ ...edit, policeVerified: v })} />
            <Check label="Active (receives jobs)" v={edit.isActive} on={(v) => setEdit({ ...edit, isActive: v })} />
            <button className="btn-primary w-full">Save</button>
          </form>
        )}
      </Sheet>
    </div>
  );
}

function ServicesTab({ services, run }: { services: Service[]; run: Run }) {
  const [cat, setCat] = useState<CategorySlug>("plumber");
  const [edit, setEdit] = useState<Service | null>(null);
  const list = services.filter((s) => s.category === cat);
  const blank: Service = { id: "", category: cat, sub: categoryBySlug(cat)!.subcategories[0], name: "", description: "", price: 0, durationMin: 30, rating: 0, reviewCount: 0, inclusions: [], isActive: true };
  return (
    <div>
      <div className="no-scrollbar mb-3 flex gap-2 overflow-x-auto">{CATEGORIES.map((c) => <button key={c.slug} className={`chip ${cat === c.slug ? "chip-active" : ""}`} onClick={() => setCat(c.slug)}>{c.shortName}</button>)}</div>
      <button className="btn-primary btn-sm mb-3" onClick={() => setEdit(blank)}>+ Add service</button>
      <Table
        head={["Service", "Sub-category", "Price", "Duration", "Type", "Status", ""]}
        empty="No services."
        rows={list.map((s) => [s.name, s.sub, `${inr(s.price)}${s.unit ?? ""}`, `${s.durationMin} min`, s.isConsultation ? "Consultation" : s.isPackage ? "Package" : "Standard", s.isActive ? <Badge key="a" tone="green">Live</Badge> : <Badge key="a" tone="gray">Hidden</Badge>, <button key="e" className="btn-ghost btn-sm" onClick={() => setEdit(s)}>Edit</button>])}
      />
      <Sheet open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? "Edit service" : "Add service"}>
        {edit && (
          <form className="space-y-3" onSubmit={async (e) => { e.preventDefault(); const id = edit.id || `${cat.slice(0, 3)}-${edit.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 30)}`; if (await run({ op: "upsertService", service: { ...edit, id, mrp: edit.mrp || undefined, unit: edit.unit || undefined } })) setEdit(null); }}>
            <In label="Name" v={edit.name} on={(v) => setEdit({ ...edit, name: v })} />
            <label className="block"><span className="label">Sub-category</span><select className="input" value={edit.sub} onChange={(e) => setEdit({ ...edit, sub: e.target.value })}>{categoryBySlug(edit.category)!.subcategories.map((s) => <option key={s}>{s}</option>)}</select></label>
            <In label="Description" v={edit.description} on={(v) => setEdit({ ...edit, description: v })} />
            <div className="grid grid-cols-3 gap-2">
              <In label="Price ₹" v={String(edit.price)} on={(v) => setEdit({ ...edit, price: Number(v.replace(/\D/g, "")) || 0 })} />
              <In label="MRP ₹ (pkg)" v={String(edit.mrp ?? "")} on={(v) => setEdit({ ...edit, mrp: Number(v.replace(/\D/g, "")) || undefined })} />
              <In label="Minutes" v={String(edit.durationMin)} on={(v) => setEdit({ ...edit, durationMin: Number(v.replace(/\D/g, "")) || 0 })} />
            </div>
            <In label="Unit suffix (e.g. /wall)" v={edit.unit ?? ""} on={(v) => setEdit({ ...edit, unit: v })} />
            <label className="block"><span className="label">Inclusions (one per line)</span><textarea className="input min-h-[80px]" value={edit.inclusions.join("\n")} onChange={(e) => setEdit({ ...edit, inclusions: e.target.value.split("\n").filter(Boolean) })} /></label>
            <Check label="Package / combo" v={!!edit.isPackage} on={(v) => setEdit({ ...edit, isPackage: v })} />
            <Check label="Consultation visit" v={!!edit.isConsultation} on={(v) => setEdit({ ...edit, isConsultation: v })} />
            <Check label="Live on site" v={edit.isActive} on={(v) => setEdit({ ...edit, isActive: v })} />
            <div className="flex gap-2">
              {edit.id && <button type="button" className="btn-outline text-danger" onClick={async () => { if (confirm("Delete this service?") && (await run({ op: "deleteService", id: edit.id }, "Deleted"))) setEdit(null); }}>Delete</button>}
              <button className="btn-primary flex-1">Save</button>
            </div>
          </form>
        )}
      </Sheet>
    </div>
  );
}

function SlotsTab({ settings, providers, dates, slots, run }: { settings: Settings; providers: Provider[]; dates: string[]; slots: number[]; run: Run }) {
  const [date, setDate] = useState(dates[0]);
  return (
    <div className="space-y-6">
      <section className="card p-5">
        <h2 className="font-semibold">Capacity per slot</h2>
        <p className="mb-3 text-sm text-ink-muted">Max bookings that can start in one slot per category. Leave 0 to use the number of active pros.</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((c) => {
            const pros = providers.filter((p) => p.isActive && p.categories.includes(c.slug)).length;
            return (
              <label key={c.slug} className="block">
                <span className="label">{c.shortName} <span className="text-xs font-normal text-ink-muted">({pros} pros)</span></span>
                <input className="input" type="number" min={0} max={50} defaultValue={settings.slotCapacity[c.slug] ?? 0} onBlur={(e) => { const v = Number(e.target.value) || 0; if (v !== (settings.slotCapacity[c.slug] ?? 0)) run({ op: "capacity", category: c.slug, value: v }); }} />
              </label>
            );
          })}
        </div>
      </section>
      <section className="card p-5">
        <h2 className="font-semibold">Block slots</h2>
        <p className="mb-3 text-sm text-ink-muted">Blocked slots are hidden from customers for all categories (e.g. holidays, team training).</p>
        <div className="no-scrollbar mb-3 flex gap-2 overflow-x-auto">{dates.map((d) => <button key={d} className={`chip ${date === d ? "chip-active" : ""}`} onClick={() => setDate(d)}>{dateLabel(d, { weekday: "short", day: "numeric" })}</button>)}</div>
        <button className={`btn-sm mb-3 ${settings.blocked.includes(`${date}|*`) ? "btn bg-danger text-white" : "btn-outline"}`} onClick={() => run({ op: "toggleBlock", key: `${date}|*` })}>{settings.blocked.includes(`${date}|*`) ? "Whole day blocked — unblock" : "Block whole day"}</button>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
          {slots.map((s) => {
            const on = settings.blocked.includes(`${date}|${s}`);
            return <button key={s} className={`min-h-[40px] rounded-lg border text-xs ${on ? "border-danger bg-danger-50 text-red-700" : "border-slate-200 bg-white"}`} onClick={() => run({ op: "toggleBlock", key: `${date}|${s}` }, on ? "Unblocked" : "Blocked")}>{slotShort(s)}</button>;
          })}
        </div>
      </section>
    </div>
  );
}

function ReviewsTab({ reviews, run }: { reviews: Review[]; run: Run }) {
  const [only, setOnly] = useState<"all" | "low" | "flagged" | "hidden">("all");
  const [reply, setReply] = useState<Review | null>(null);
  const [text, setText] = useState("");
  const list = reviews.filter((r) => (only === "low" ? r.rating <= 2 : only === "flagged" ? r.flagged : only === "hidden" ? r.hidden : true));
  return (
    <div>
      <div className="mb-3 flex gap-2">{(["all", "low", "flagged", "hidden"] as const).map((f) => <button key={f} className={`chip capitalize ${only === f ? "chip-active" : ""}`} onClick={() => setOnly(f)}>{f === "low" ? "1–2 ★" : f}</button>)}</div>
      <div className="space-y-3">
        {list.length === 0 && <p className="card p-6 text-center text-ink-muted">Nothing here.</p>}
        {list.map((r) => (
          <div key={r.id} className={`card p-4 text-sm ${r.hidden ? "opacity-60" : ""}`}>
            <div className="flex flex-wrap items-center gap-2"><Stars value={r.rating} /><b>{r.customerName}</b><span className="text-ink-muted">{r.serviceName} · {relTime(r.createdAt)}</span>{r.flagged && <Badge tone="red">Flagged</Badge>}{r.hidden && <Badge tone="gray">Hidden</Badge>}</div>
            <p className="mt-1">{r.text}</p>
            {r.adminReply && <p className="mt-1 text-xs text-ink-muted">↳ {r.adminReply}</p>}
            <div className="mt-2 flex gap-2">
              <button className="btn-ghost btn-sm" onClick={() => { setReply(r); setText(r.adminReply ?? ""); }}>Reply</button>
              <button className="btn-ghost btn-sm" onClick={() => run({ op: "review", id: r.id, flagged: !r.flagged })}>{r.flagged ? "Unflag" : "Flag"}</button>
              <button className="btn-ghost btn-sm" onClick={() => run({ op: "review", id: r.id, hidden: !r.hidden })}>{r.hidden ? "Unhide" : "Hide (abusive only)"}</button>
            </div>
          </div>
        ))}
      </div>
      <Sheet open={!!reply} onClose={() => setReply(null)} title="Public reply">
        <textarea className="input min-h-[100px]" value={text} onChange={(e) => setText(e.target.value)} maxLength={400} />
        <button className="btn-primary mt-3 w-full" onClick={async () => { if (reply && (await run({ op: "review", id: reply.id, adminReply: text }))) setReply(null); }}>Save reply</button>
      </Sheet>
    </div>
  );
}

function PromosTab({ promos, run }: { promos: Promo[]; run: Run }) {
  const [f, setF] = useState<Promo>({ code: "", percent: 10, maxOff: 100, minOrder: 0, active: true });
  return (
    <div className="space-y-4">
      <Table head={["Code", "% off", "Max off", "Min order", "Status", ""]} empty="No promos." rows={promos.map((p) => [<b key="c">{p.code}</b>, `${p.percent}%`, inr(p.maxOff), inr(p.minOrder), <button key="t" onClick={() => run({ op: "upsertPromo", promo: { ...p, active: !p.active } })}>{p.active ? <Badge tone="green">Active</Badge> : <Badge tone="gray">Paused</Badge>}</button>, <button key="d" className="btn-ghost btn-sm text-danger" onClick={() => run({ op: "deletePromo", code: p.code }, "Deleted")}>Delete</button>])} />
      <form className="card grid gap-3 p-5 sm:grid-cols-5" onSubmit={async (e) => { e.preventDefault(); if (await run({ op: "upsertPromo", promo: f })) setF({ ...f, code: "" }); }}>
        <In label="Code" v={f.code} on={(v) => setF({ ...f, code: v.toUpperCase().replace(/[^A-Z0-9]/g, "") })} />
        <In label="% off" v={String(f.percent)} on={(v) => setF({ ...f, percent: Number(v) || 0 })} />
        <In label="Max ₹ off" v={String(f.maxOff)} on={(v) => setF({ ...f, maxOff: Number(v) || 0 })} />
        <In label="Min order ₹" v={String(f.minOrder)} on={(v) => setF({ ...f, minOrder: Number(v) || 0 })} />
        <div className="flex items-end"><button className="btn-primary w-full">Add promo</button></div>
      </form>
    </div>
  );
}

function BarList({ title, data }: { title: string; data: Bar[] }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="card p-5">
      <h3 className="mb-3 font-semibold">{title}</h3>
      {data.length === 0 || data.every((d) => !d.value) ? <p className="text-sm text-ink-muted">No data yet.</p> : (
        <div className="space-y-2">{data.map((d) => <div key={d.label} className="text-sm"><div className="flex justify-between"><span className="truncate">{d.label}</span><span className="tabular-nums text-ink-muted">{d.value}</span></div><div className="mt-1 h-2 rounded-full bg-slate-100"><div className="h-full rounded-full bg-primary" style={{ width: `${(d.value / max) * 100}%` }} /></div></div>)}</div>
      )}
    </div>
  );
}

function AnalyticsTab({ a }: { a: Props["analytics"] }) {
  const max = useMemo(() => Math.max(1, ...a.heat.flat()), [a.heat]);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Total bookings" value={a.total} />
        <Stat label="Cancelled" value={a.cancelled} />
        <Stat label="Live reviews" value={a.newReviews} />
        <Stat label="Avg live rating" value={a.avgRating ?? "—"} />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <BarList title="Bookings by category" data={a.byCategory} />
        <BarList title="Popular services" data={a.popular} />
        <BarList title="Top localities" data={a.localities} />
      </div>
      <div className="card overflow-x-auto p-5">
        <h3 className="mb-3 font-semibold">Demand heatmap (time of day × weekday)</h3>
        <table className="text-xs">
          <thead><tr><th />{a.days.map((d) => <th key={d} className="px-2 py-1 font-medium text-ink-muted">{d}</th>)}</tr></thead>
          <tbody>{a.groups.map((g, i) => <tr key={g}><td className="pr-3 text-ink-muted">{g}</td>{a.heat[i].map((v, j) => <td key={j} className="p-0.5"><div className="flex h-9 w-12 items-center justify-center rounded" style={{ background: `rgba(37,99,235,${0.08 + (v / max) * 0.85})`, color: v / max > 0.5 ? "#fff" : "#1E293B" }}>{v}</div></td>)}</tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}

function InboxTab({ waitlist, contacts, notifications }: Props) {
  return (
    <div className="space-y-6">
      <section><h2 className="mb-2 font-semibold">Waitlist — {waitlist.length}</h2><Table head={["When", "Phone", "Email", "Area"]} empty="No waitlist sign-ups." rows={waitlist.slice().reverse().map((w) => [relTime(w.at), w.phone ?? "—", w.email ?? "—", w.locality ?? "—"])} /></section>
      <section><h2 className="mb-2 font-semibold">Contact messages — {contacts.length}</h2><Table head={["When", "Name", "Phone", "Message"]} empty="No messages." rows={contacts.map((c) => [relTime(c.at), c.name, c.phone, c.message])} /></section>
      <section><h2 className="mb-2 font-semibold">Notification log (SMS / WhatsApp / Email)</h2><Table head={["When", "Channel", "To", "Booking", "Message"]} empty="Nothing sent yet." rows={notifications.map((n) => [relTime(n.at), n.channel, `${n.audience}: ${n.to}`, n.bookingId ?? "—", n.message])} /></section>
    </div>
  );
}

function WhatsAppTab({ s }: { s: Props["whatsapp"] }) {
  const toast = useToast();
  const [chat, setChat] = useState<{ me: boolean; text: string }[]>([]);
  const [text, setText] = useState("");
  const [phone, setPhone] = useState("");
  const live = s.token && s.phoneId && s.verify;
  const send = async (t: string) => {
    if (!t.trim()) return;
    setChat((c) => [...c, { me: true, text: t }]);
    setText("");
    try {
      const r = await api<{ reply: string }>("/api/admin", { json: { op: "waPreview", text: t, phone: phone || undefined } });
      setChat((c) => [...c, { me: false, text: r.reply }]);
    } catch (e) {
      toast((e as Error).message, "err");
    }
  };
  const steps: [boolean, string, React.ReactNode][] = [
    [s.token, "WHATSAPP_ACCESS_TOKEN", "Permanent System User token from Meta Business Settings (whatsapp_business_messaging permission)."],
    [s.phoneId, "WHATSAPP_PHONE_NUMBER_ID", "Meta app → WhatsApp → API Setup → Phone number ID (not the phone number itself)."],
    [s.verify, "WHATSAPP_VERIFY_TOKEN", "Any password you choose — type the same value into Meta's webhook form."],
    [s.secret, "WHATSAPP_APP_SECRET", "Meta app → App settings → Basic → App secret. Blocks fake messages."],
    [s.storage, "Upstash Redis (Vercel Storage)", "Needed so booking status is correct on Vercel and the bot doesn't reply twice."],
  ];
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="space-y-4">
        <div className={`rounded-2xl p-4 text-sm font-medium ${live ? "bg-success-50 text-emerald-700" : "bg-secondary-50 text-amber-800"}`}>
          {live ? `✅ Bot is configured. ${s.lastInbound ? `Last message received ${relTime(s.lastInbound)}.` : "No messages received yet — finish the webhook step in Meta, then send “hi” to your number."}` : "⚠️ Bot not connected yet — complete the checklist, then redeploy on Vercel."}
        </div>
        <div className="card divide-y divide-slate-100">
          {steps.map(([okk, name, help]) => (
            <div key={name} className="flex gap-3 p-4 text-sm">
              <span className="text-lg">{okk ? "✅" : "⬜"}</span>
              <div><p className="font-mono text-xs font-semibold">{name}</p><p className="text-ink-muted">{help}</p></div>
            </div>
          ))}
        </div>
        <div className="card p-4 text-sm">
          <p className="font-semibold">Paste into Meta → WhatsApp → Configuration → Webhook</p>
          <label className="mt-3 block"><span className="label">Callback URL</span>
            <div className="flex gap-2"><input readOnly className="input font-mono text-xs" value={s.webhookUrl} /><button className="btn-outline btn-sm shrink-0" onClick={() => { navigator.clipboard?.writeText(s.webhookUrl); toast("Copied", "ok"); }}>Copy</button></div>
          </label>
          <p className="mt-2 text-ink-muted">Verify token: the value of WHATSAPP_VERIFY_TOKEN. Then click <b>Manage</b> next to Webhook fields and subscribe to <b>messages</b>.</p>
        </div>
      </section>
      <section className="card flex h-[640px] flex-col overflow-hidden">
        <div className="flex items-center gap-3 bg-[#075E54] p-3 text-white">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 font-bold">H</span>
          <div className="flex-1"><p className="font-semibold">HomeServ — bot preview</p><p className="text-xs text-white/70">Exactly what customers will receive</p></div>
          <input className="w-36 rounded-lg bg-white/15 px-2 py-1 text-xs placeholder:text-white/60" placeholder="Test as phone no." value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} aria-label="Pretend to be this customer phone" />
        </div>
        <div className="flex-1 space-y-2 overflow-y-auto bg-[#ECE5DD] p-3">
          {chat.length === 0 && <p className="mt-10 text-center text-sm text-ink-muted">Type a message like a customer would — “hi”, “1”, “tap leaking”, “8”, “9”.</p>}
          {chat.map((m, i) => (
            <div key={i} className={`max-w-[85%] whitespace-pre-wrap rounded-xl px-3 py-2 text-sm shadow-sm ${m.me ? "ml-auto bg-[#DCF8C6]" : "bg-white"}`}>{m.text.replace(/\*(.+?)\*/g, "$1")}</div>
          ))}
        </div>
        <div className="flex flex-wrap gap-1 border-t border-slate-200 p-2">
          {["hi", "1", "4", "tap leaking", "price", "8", "9"].map((q) => <button key={q} className="chip btn-sm" onClick={() => send(q)}>{q}</button>)}
        </div>
        <form className="flex gap-2 p-2 pt-0" onSubmit={(e) => { e.preventDefault(); send(text); }}>
          <input className="input" placeholder="Type a message" value={text} onChange={(e) => setText(e.target.value)} />
          <button className="btn-primary shrink-0">Send</button>
        </form>
      </section>
    </div>
  );
}

function In({ label, v, on }: { label: string; v: string; on: (v: string) => void }) {
  return <label className="block"><span className="label">{label}</span><input className="input" value={v} onChange={(e) => on(e.target.value)} /></label>;
}
function Check({ label, v, on }: { label: string; v: boolean; on: (v: boolean) => void }) {
  return <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="h-5 w-5 accent-primary" checked={v} onChange={(e) => on(e.target.checked)} />{label}</label>;
}
