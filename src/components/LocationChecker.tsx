"use client";
import { useMemo, useState } from "react";
import { LOCALITIES } from "@/lib/catalog";
import { SUPPORT_PHONE } from "@/lib/config";
import { api, useStore, useToast } from "./store";
import { Sheet } from "./ui";

type Result = { serviceable: boolean; distanceM: number };

export function WaitlistForm({ locality, lat, lng, onDone }: { locality?: string; lat?: number; lng?: number; onDone?: () => void }) {
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");
  if (done) return <p className="rounded-xl bg-success-50 p-4 text-sm font-medium text-emerald-700">✅ You're on the waitlist. We'll message you as soon as we start serving your area.</p>;
  return (
    <form
      className="space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setErr("");
        try {
          await api("/api/waitlist", { json: { phone: phone || undefined, email: email || undefined, locality, lat, lng } });
          setDone(true);
          onDone?.();
        } catch (x) {
          setErr((x as Error).message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <div className="flex gap-2">
        <span className="input w-16 shrink-0 text-center text-ink-muted">+91</span>
        <input className="input" inputMode="numeric" placeholder="Mobile number" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} aria-label="Mobile number" />
      </div>
      <input className="input" type="email" placeholder="or Email" value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Email" />
      {err && <p className="text-sm text-danger">{err}</p>}
      <div className="flex flex-col gap-2 sm:flex-row">
        <button className="btn-primary flex-1" disabled={busy}>{busy ? "Joining…" : "Join Waitlist"}</button>
        <a href={`tel:${SUPPORT_PHONE}`} className="btn-outline flex-1">Call Us for Custom Arrangement</a>
      </div>
    </form>
  );
}

export function LocationChecker({ compact = false }: { compact?: boolean }) {
  const { location, setLocation } = useStore();
  const toast = useToast();
  const [q, setQ] = useState("");
  const [focus, setFocus] = useState(false);
  const [busy, setBusy] = useState(false);
  const [waitlist, setWaitlist] = useState<{ label: string; lat: number; lng: number; distanceM: number } | null>(null);

  const matches = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return LOCALITIES.slice(0, 6);
    return LOCALITIES.filter((l) => l.name.toLowerCase().includes(s) || l.pin.startsWith(s)).slice(0, 6);
  }, [q]);

  async function check(lat: number, lng: number, label: string) {
    setBusy(true);
    try {
      const r = await api<Result>("/api/serviceability", { json: { lat, lng } });
      setLocation({ lat, lng, label, ...r });
      setQ(label);
      if (r.serviceable) toast(`Great! We serve ${label}.`, "ok");
      else setWaitlist({ label, lat, lng, distanceM: r.distanceM });
    } catch (e) {
      toast((e as Error).message, "err");
    } finally {
      setBusy(false);
      setFocus(false);
    }
  }

  function gps() {
    if (!navigator.geolocation) return toast("Location isn't available on this device", "err");
    setBusy(true);
    navigator.geolocation.getCurrentPosition(
      (p) => check(p.coords.latitude, p.coords.longitude, "Current location"),
      () => {
        setBusy(false);
        toast("Couldn't get your location. Please allow access or type your area.", "err");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return (
    <div className={compact ? "" : "w-full max-w-xl"}>
      <div className="relative">
        <div className="flex gap-2 rounded-2xl bg-white p-2 shadow-xl ring-1 ring-slate-200">
          <label className="flex flex-1 items-center gap-2 pl-2">
            <span aria-hidden>📍</span>
            <input
              className="min-h-[44px] w-full bg-transparent text-base text-ink placeholder:text-slate-400 focus:outline-none"
              placeholder="Enter your area or PIN code"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onFocus={() => setFocus(true)}
              onBlur={() => setTimeout(() => setFocus(false), 150)}
              aria-label="Your location"
              aria-autocomplete="list"
            />
          </label>
          <button type="button" onClick={gps} className="btn-outline btn-sm h-11 px-3" disabled={busy} title="Use my current location" aria-label="Use my current location">
            🎯
          </button>
          <button
            type="button"
            className="btn-primary h-11"
            disabled={busy}
            onClick={() => {
              const m = matches[0];
              if (m) check(m.lat, m.lng, m.name);
              else toast("We couldn't find that area. Try the 🎯 GPS button or pick on the map at checkout.", "err");
            }}
          >
            {busy ? "…" : "Check"}
          </button>
        </div>
        {focus && matches.length > 0 && (
          <ul className="absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-2xl bg-white text-ink shadow-xl ring-1 ring-slate-200" role="listbox">
            {matches.map((m) => (
              <li key={m.slug}>
                <button type="button" className="flex min-h-[44px] w-full items-center justify-between px-4 py-2 text-left text-sm hover:bg-slate-50" onMouseDown={(e) => e.preventDefault()} onClick={() => check(m.lat, m.lng, m.name)}>
                  <span>{m.name}</span>
                  <span className="text-xs text-ink-muted">{m.pin}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {location && !compact && (
        <p className={`mt-3 text-sm font-medium ${location.serviceable ? "text-emerald-300" : "text-red-300"}`}>
          {location.serviceable ? `✅ We serve ${location.label}` : `❌ ${location.label} is outside our service area`}
        </p>
      )}
      <Sheet open={!!waitlist} onClose={() => setWaitlist(null)} title="We're not in your area yet">
        <p className="mb-4 text-sm text-ink-muted">
          {waitlist?.label} is {((waitlist?.distanceM ?? 0) / 1000).toFixed(1)} km from our base — outside our current service area. Join the waitlist and we'll tell you the day we expand.
        </p>
        <WaitlistForm locality={waitlist?.label} lat={waitlist?.lat} lng={waitlist?.lng} />
      </Sheet>
    </div>
  );
}
