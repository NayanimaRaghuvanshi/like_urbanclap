"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { OtpLogin, useMe } from "@/components/OtpLogin";
import { SlotPicker } from "@/components/SlotPicker";
import { api, useStore, useToast } from "@/components/store";
import { Sheet } from "@/components/ui";
import { CATEGORIES, LOCALITIES } from "@/lib/catalog";
import { AUTO_DISCOUNT, SERVICE_RADIUS_M, SUPPORT_PHONE, VISITING_CHARGE, VISITING_WAIVER_MIN } from "@/lib/config";
import { dateLabel, durationLabel, inr, slotLabel } from "@/lib/format";
import { checkServiceable } from "@/lib/geo";
import { compressImage } from "@/lib/image";
import type { Address, Quote } from "@/lib/types";
import { WaitlistForm } from "@/components/LocationChecker";

const MapPicker = dynamic(() => import("@/components/MapPicker"), { ssr: false, loading: () => <div className="skeleton h-72 w-full rounded-2xl" /> });

type Step = 1 | 2 | 3 | 4 | 5;
const STEP_TITLES = ["Your Cart", "Date & Time", "Service Address", "Your Details", "Review & Confirm"];

interface Draft {
  slot?: { date: string; slot: number };
  address: Partial<Address>;
  name: string;
  email: string;
  notes: string;
  promo: string;
  payment: "after_service" | "online";
}

const emptyDraft: Draft = { address: {}, name: "", email: "", notes: "", promo: "", payment: "after_service" };

declare global {
  interface Window { Razorpay?: new (opts: Record<string, unknown>) => { open: () => void } }
}

export function BookingFlow() {
  const { cart, cartCategory, setQty, clearCart, subtotal, location, ready } = useStore();
  const toast = useToast();
  const router = useRouter();
  const { me, setMe } = useMe();
  const [step, setStep] = useState<Step>(1);
  const [d, setD] = useState<Draft>(emptyDraft);
  const [photos, setPhotos] = useState<string[]>([]);
  const [quote, setQuote] = useState<Quote>();
  const [promoApplied, setPromoApplied] = useState<string | null>(null);
  const [terms, setTerms] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [mockPay, setMockPay] = useState<{ orderId: string; amount: number } | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const cat = CATEGORIES.find((c) => c.slug === cartCategory);
  const duration = cart.reduce((s, l) => s + l.durationMin * l.qty, 0);
  const items = useMemo(() => cart.map((c) => ({ serviceId: c.serviceId, qty: c.qty })), [cart]);

  // Restore draft (photos aren't persisted — too large for sessionStorage)
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("hs_draft");
      const note = sessionStorage.getItem("hs_note");
      const base: Draft = saved ? { ...emptyDraft, ...JSON.parse(saved) } : emptyDraft;
      if (note && !base.notes) base.notes = note.slice(0, 250);
      sessionStorage.removeItem("hs_note");
      setD(base);
    } catch {}
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (hydrated) try { sessionStorage.setItem("hs_draft", JSON.stringify(d)); } catch {}
  }, [d, hydrated]);
  // Prefill address location from the homepage check
  useEffect(() => {
    if (hydrated && location && d.address.lat === undefined) setD((x) => ({ ...x, address: { ...x.address, lat: location.lat, lng: location.lng, locality: x.address.locality || (location.label !== "Current location" ? location.label : "") } }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, location]);
  useEffect(() => {
    if (me?.phone) setD((x) => ({ ...x, name: x.name || me.name || "", email: x.email || me.email || "" }));
  }, [me]);

  // Live quote from the server (source of truth for prices)
  useEffect(() => {
    if (!items.length) return setQuote(undefined);
    let live = true;
    api<{ quote: Quote; promo: string | null }>("/api/quote", { json: { items, promoCode: promoApplied || undefined } })
      .then((r) => live && setQuote(r.quote))
      .catch((e) => {
        if (!live) return;
        if (promoApplied) {
          setPromoApplied(null);
          toast((e as Error).message, "err");
        } else setErr((e as Error).message);
      });
    return () => {
      live = false;
    };
  }, [items, promoApplied, toast]);

  const geo = d.address.lat !== undefined && d.address.lng !== undefined ? checkServiceable({ lat: d.address.lat, lng: d.address.lng }) : undefined;
  const addressOk = !!(geo?.serviceable && d.address.line1?.trim() && (d.address.building?.trim().length ?? 0) >= 2 && (d.address.locality?.trim().length ?? 0) >= 2 && /^\d{6}$/.test(d.address.pin ?? ""));
  const detailsOk = !!(me?.phone && d.name.trim().length >= 2 && d.notes.trim().length >= 5 && (!d.email || /^\S+@\S+\.\S+$/.test(d.email)));

  const canNext: Record<Step, boolean> = { 1: cart.length > 0, 2: !!d.slot, 3: addressOk, 4: detailsOk, 5: terms };
  const go = (s: Step) => {
    setErr("");
    setStep(s);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  async function confirm() {
    setErr("");
    setBusy(true);
    try {
      if (d.payment === "online") {
        const order = await api<{ orderId: string; amount: number; keyId?: string; mock: boolean }>("/api/payments/order", { json: { items, promoCode: promoApplied || undefined } });
        if (order.mock) {
          setMockPay({ orderId: order.orderId, amount: order.amount });
          return;
        }
        await loadRazorpay();
        const rzp = new window.Razorpay!({
          key: order.keyId, order_id: order.orderId, amount: order.amount, currency: "INR", name: "HomeServ",
          description: cat?.shortName, prefill: { name: d.name, email: d.email, contact: me?.phone }, theme: { color: "#2563EB" },
          handler: (r: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) =>
            submit({ orderId: r.razorpay_order_id, paymentId: r.razorpay_payment_id, signature: r.razorpay_signature }),
          modal: { ondismiss: () => setBusy(false) },
        });
        rzp.open();
        return;
      }
      await submit();
    } catch (e) {
      setErr((e as Error).message);
      setBusy(false);
    }
  }

  async function submit(payment?: { orderId: string; paymentId: string; signature?: string }) {
    setBusy(true);
    try {
      const r = await api<{ booking: { id: string } }>("/api/bookings", {
        json: {
          name: d.name, email: d.email || undefined, items, date: d.slot!.date, slot: d.slot!.slot,
          address: d.address, notes: d.notes, photos, paymentMethod: d.payment, payment, promoCode: promoApplied || undefined, acceptTerms: terms,
        },
      });
      clearCart();
      try { sessionStorage.removeItem("hs_draft"); } catch {}
      router.push(`/track/${r.booking.id}?new=1`);
    } catch (e) {
      const msg = (e as Error).message;
      setErr(msg);
      if (/slot/i.test(msg)) {
        setD((x) => ({ ...x, slot: undefined }));
        toast(msg, "err");
        go(2);
      }
      setBusy(false);
    }
  }

  if (!ready || !hydrated) return <div className="container-x py-10"><div className="skeleton h-96 w-full" /></div>;

  if (!cart.length)
    return (
      <div className="container-x max-w-lg py-16 text-center">
        <p className="text-5xl">🛒</p>
        <h1 className="mt-4 text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-ink-muted">Pick a service to get started.</p>
        <Link href="/services" className="btn-primary mt-6">Browse Services</Link>
      </div>
    );

  return (
    <div className="container-x max-w-3xl pb-32 pt-6">
      {/* Stepper */}
      <div className="mb-6 flex items-center justify-between gap-4">
        {step > 1 ? <button className="btn-ghost btn-sm -ml-3" onClick={() => go((step - 1) as Step)}>← Back</button> : <Link href={`/services/${cartCategory}`} className="btn-ghost btn-sm -ml-3">← Add more</Link>}
        <p className="text-sm font-medium text-ink-muted">Step {step} of 5</p>
      </div>
      <div className="mb-6 flex gap-1.5" aria-hidden>
        {STEP_TITLES.map((_, i) => <div key={i} className={`h-1.5 flex-1 rounded-full ${i < step ? "bg-primary" : "bg-slate-200"}`} />)}
      </div>
      <h1 className="mb-6 text-2xl font-bold">{["🛒", "📅", "📍", "👤", "📋"][step - 1]} {STEP_TITLES[step - 1]}</h1>

      {step === 1 && (
        <div className="space-y-4">
          <div className="card divide-y divide-slate-100">
            {cart.map((l) => (
              <div key={l.serviceId} className="flex items-center gap-3 p-4">
                <div className="flex-1">
                  <p className="font-medium">{l.name}</p>
                  <p className="text-sm text-ink-muted">{inr(l.price)} · {durationLabel(l.durationMin)}</p>
                </div>
                {l.isConsultation ? (
                  <button className="btn-ghost btn-sm text-danger" onClick={() => setQty(l.serviceId, 0)}>Remove</button>
                ) : (
                  <div className="flex items-center rounded-xl border border-slate-300">
                    <button className="h-10 w-10" onClick={() => setQty(l.serviceId, l.qty - 1)} aria-label={`Decrease ${l.name}`}>−</button>
                    <span className="w-6 text-center font-semibold tabular-nums">{l.qty}</span>
                    <button className="h-10 w-10" onClick={() => setQty(l.serviceId, l.qty + 1)} aria-label={`Increase ${l.name}`}>+</button>
                  </div>
                )}
                <p className="w-16 text-right font-semibold tabular-nums">{inr(l.price * l.qty)}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-ink-muted">{cat?.icon} {cat?.shortName} · est. {durationLabel(duration)} · one professional handles your whole cart.</p>
          <Offers subtotal={subtotal} consultation={cart.every((c) => c.isConsultation)} />
          <PromoBox applied={promoApplied} value={d.promo} onChange={(v) => setD({ ...d, promo: v })} onApply={() => setPromoApplied(d.promo.trim().toUpperCase() || null)} onRemove={() => setPromoApplied(null)} />
          {quote && <QuoteBox q={quote} />}
        </div>
      )}

      {step === 2 && cartCategory && <SlotPicker category={cartCategory} durationMin={duration} value={d.slot} onChange={(slot) => setD({ ...d, slot })} />}

      {step === 3 && (
        <div className="space-y-5">
          <div className="card grid gap-4 p-5 sm:grid-cols-2">
            <Field label="Flat / House No. *" value={d.address.line1} onChange={(v) => setD({ ...d, address: { ...d.address, line1: v } })} autoComplete="address-line1" />
            <Field label="Building / Society Name *" value={d.address.building} onChange={(v) => setD({ ...d, address: { ...d.address, building: v } })} autoComplete="address-line2" />
            <Field label="Landmark" value={d.address.landmark} onChange={(v) => setD({ ...d, address: { ...d.address, landmark: v } })} />
            <label>
              <span className="label">Area / Locality *</span>
              <input
                className="input"
                list="localities"
                value={d.address.locality ?? ""}
                onChange={(e) => {
                  const v = e.target.value;
                  const m = LOCALITIES.find((l) => l.name.toLowerCase() === v.toLowerCase());
                  setD({ ...d, address: { ...d.address, locality: v, ...(m ? { lat: m.lat, lng: m.lng, pin: d.address.pin || m.pin } : {}) } });
                }}
              />
              <datalist id="localities">{LOCALITIES.map((l) => <option key={l.slug} value={l.name} />)}</datalist>
            </label>
            <Field label="PIN Code *" value={d.address.pin} inputMode="numeric" onChange={(v) => setD({ ...d, address: { ...d.address, pin: v.replace(/\D/g, "").slice(0, 6) } })} autoComplete="postal-code" />
          </div>
          <div className="card p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium">Drag the 📍 pin to your exact building — blue circle is our 2 km area.</p>
              <button
                className="btn-outline btn-sm"
                onClick={() =>
                  navigator.geolocation?.getCurrentPosition(
                    (p) => setD((x) => ({ ...x, address: { ...x.address, lat: p.coords.latitude, lng: p.coords.longitude } })),
                    () => toast("Couldn't get your location — please allow access or drag the pin.", "err"),
                    { enableHighAccuracy: true, timeout: 10000 }
                  )
                }
              >
                📍 Use My Current Location
              </button>
            </div>
            <MapPicker value={d.address.lat !== undefined ? { lat: d.address.lat, lng: d.address.lng! } : undefined} onChange={(p) => setD((x) => ({ ...x, address: { ...x.address, ...p } }))} />
          </div>
          {geo ? (
            geo.serviceable ? (
              <p className="rounded-xl bg-success-50 p-4 text-sm font-medium text-emerald-700">✅ Great! You're within our 2 km service area ({(geo.distanceM / 1000).toFixed(1)} km away).</p>
            ) : (
              <div className="rounded-xl bg-danger-50 p-4">
                <p className="mb-3 text-sm font-medium text-red-700">❌ Sorry, this location is {(geo.distanceM / 1000).toFixed(1)} km away — outside our {SERVICE_RADIUS_M / 1000} km service area.</p>
                <WaitlistForm locality={d.address.locality} lat={d.address.lat} lng={d.address.lng} />
              </div>
            )
          ) : (
            <p className="rounded-xl bg-slate-100 p-4 text-sm text-ink-muted">Pick your locality or drop the pin so we can confirm we serve your address.</p>
          )}
        </div>
      )}

      {step === 4 && (
        <div className="space-y-5">
          <div className="card p-5">
            {me?.phone ? (
              <div className="flex items-center justify-between gap-3">
                <div><p className="label mb-0">Mobile Number</p><p className="font-medium">{me.phone} <span className="text-sm text-emerald-600">(verified ✅)</span></p></div>
                <button className="btn-ghost btn-sm" onClick={async () => { await api("/api/logout", { method: "POST" }); setMe({ phone: null, name: null, email: null }); }}>Change</button>
              </div>
            ) : (
              <OtpLogin onVerified={(m) => setMe(m)} />
            )}
          </div>
          <div className="card grid gap-4 p-5">
            <Field label="Full Name *" value={d.name} onChange={(v) => setD({ ...d, name: v })} autoComplete="name" />
            <div>
              <Field label="Email (optional)" value={d.email} onChange={(v) => setD({ ...d, email: v })} type="email" autoComplete="email" />
              <p className="mt-1 text-xs text-ink-muted">For invoice & booking confirmation</p>
            </div>
            <label>
              <span className="label">Reason / Notes *</span>
              <textarea
                className="input min-h-[120px]"
                maxLength={250}
                placeholder={'Describe your requirement… e.g. "2 taps leaking in kitchen", "Need PVC panel for 10x12 ft bedroom wall", "Ceiling fan not working"'}
                value={d.notes}
                onChange={(e) => setD({ ...d, notes: e.target.value })}
              />
              <span className="mt-1 block text-right text-xs text-ink-muted">{d.notes.length}/250</span>
            </label>
            <div>
              <p className="label">📷 Upload Photos (optional, up to 3)</p>
              <div className="flex flex-wrap gap-3">
                {photos.map((p, i) => (
                  <div key={i} className="relative h-20 w-20 overflow-hidden rounded-xl ring-1 ring-slate-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p} alt={`Upload ${i + 1}`} className="h-full w-full object-cover" />
                    <button className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-xs text-white" onClick={() => setPhotos(photos.filter((_, j) => j !== i))} aria-label="Remove photo">✕</button>
                  </div>
                ))}
                {photos.length < 3 && (
                  <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 text-xs text-ink-muted hover:border-primary">
                    <span className="text-xl">+</span>Add
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="sr-only"
                      onChange={async (e) => {
                        const files = Array.from(e.target.files ?? []).slice(0, 3 - photos.length);
                        e.target.value = "";
                        for (const f of files) {
                          try {
                            const url = await compressImage(f);
                            setPhotos((p) => (p.length < 3 ? [...p, url] : p));
                          } catch (x) {
                            toast((x as Error).message, "err");
                          }
                        }
                      }}
                    />
                  </label>
                )}
              </div>
              <p className="mt-2 text-xs text-ink-muted">Helps our expert prepare better. Max 5 MB each.</p>
            </div>
          </div>
        </div>
      )}

      {step === 5 && quote && d.slot && (
        <div className="space-y-4">
          <div className="card p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-muted">Service Details</h2>
            {cart.map((l) => (
              <div key={l.serviceId} className="flex justify-between py-1 text-sm"><span>{cat?.icon} {l.name}{l.qty > 1 ? ` × ${l.qty}` : ""}</span><span className="tabular-nums">{inr(l.price * l.qty)}</span></div>
            ))}
            <div className="mt-3 border-t border-slate-100 pt-3"><QuoteBox q={quote} bare /></div>
          </div>
          <div className="card p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">Booking Details</h2>
            </div>
            <ul className="space-y-2 text-sm">
              <Row icon="📅" label={dateLabel(d.slot.date)} onEdit={() => go(2)} />
              <Row icon="🕐" label={`Arrival ${slotLabel(d.slot.slot)} – ${slotLabel(d.slot.slot + 30)}`} onEdit={() => go(2)} />
              <Row icon="📍" label={[d.address.line1, d.address.building, d.address.landmark, d.address.locality, d.address.pin].filter(Boolean).join(", ")} onEdit={() => go(3)} />
              <Row icon="👤" label={d.name} onEdit={() => go(4)} />
              <Row icon="📞" label={`${me?.phone} (verified ✅)`} />
              {d.email && <Row icon="📧" label={d.email} onEdit={() => go(4)} />}
              <Row icon="📝" label={`“${d.notes}”`} onEdit={() => go(4)} />
              {photos.length > 0 && <Row icon="📷" label={`${photos.length} photo${photos.length > 1 ? "s" : ""} attached`} />}
            </ul>
          </div>
          <div className="card p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-muted">💳 Payment</h2>
            <div className="space-y-2">
              {([["after_service", "Pay After Service (Recommended)", "Pay via UPI/cash after job completion"], ["online", "Pay Now Online", "UPI • Cards • Net Banking • Wallets — Razorpay secure payment"]] as const).map(([v, t, s]) => (
                <label key={v} className={`flex cursor-pointer gap-3 rounded-xl border p-4 ${d.payment === v ? "border-primary bg-primary-50" : "border-slate-200"}`}>
                  <input type="radio" name="pay" className="mt-1 h-4 w-4 accent-primary" checked={d.payment === v} onChange={() => setD({ ...d, payment: v })} />
                  <span><span className="block font-medium">{t}</span><span className="text-sm text-ink-muted">{s}</span></span>
                </label>
              ))}
            </div>
          </div>
          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" className="mt-0.5 h-5 w-5 accent-primary" checked={terms} onChange={(e) => setTerms(e.target.checked)} />
            <span>I agree to the <Link href="/terms" target="_blank" className="text-primary underline">Terms & Conditions</Link> — free cancellation up to 2 hours before the slot, ₹50 after.</span>
          </label>
        </div>
      )}

      {err && <p className="mt-4 rounded-xl bg-danger-50 p-3 text-sm text-red-700" role="alert">{err}</p>}

      {/* Sticky action bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 p-3 backdrop-blur">
        <div className="container-x flex max-w-3xl items-center gap-3">
          <div className="flex-1 text-sm">
            <p className="font-semibold">{quote ? inr(quote.total) : inr(subtotal)}</p>
            <p className="text-xs text-ink-muted">{step === 2 && d.slot ? `${dateLabel(d.slot.date, { day: "numeric", month: "short" })}, ${slotLabel(d.slot.slot)}` : "incl. GST"}</p>
          </div>
          {step < 5 ? (
            <button className="btn-primary min-w-[140px]" disabled={!canNext[step]} onClick={() => go((step + 1) as Step)}>Continue →</button>
          ) : (
            <button className="btn-primary min-w-[180px]" disabled={!terms || busy || !quote} onClick={confirm}>{busy ? "Confirming…" : d.payment === "online" ? `Pay ${quote ? inr(quote.total) : ""} & Confirm` : "Confirm Booking ✓"}</button>
          )}
        </div>
      </div>

      <Sheet open={!!mockPay} onClose={() => { setMockPay(null); setBusy(false); }} title="Razorpay (simulated)">
        <p className="text-sm text-ink-muted">Razorpay keys aren't configured, so this is a test checkout. Set RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET to take real payments.</p>
        <p className="mt-4 font-display text-3xl font-bold">{inr((mockPay?.amount ?? 0) / 100)}</p>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <button className="btn-outline" onClick={() => { setMockPay(null); setBusy(false); setErr("Payment cancelled. You can retry or choose Pay After Service."); }}>Fail / Cancel</button>
          <button className="btn-primary" onClick={() => { const o = mockPay!; setMockPay(null); submit({ orderId: o.orderId, paymentId: "pay_mock_" + Date.now().toString(36) }); }}>Pay with UPI ✓</button>
        </div>
      </Sheet>
      {step === 3 && geo && !geo.serviceable && <p className="mt-3 text-center text-sm text-ink-muted">Need help? <a className="text-primary" href={`tel:${SUPPORT_PHONE}`}>Call us</a></p>}
    </div>
  );
}

function loadRazorpay() {
  return new Promise<void>((res, rej) => {
    if (window.Razorpay) return res();
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => res();
    s.onerror = () => rej(new Error("Couldn't load Razorpay. Check your connection or choose Pay After Service."));
    document.body.appendChild(s);
  });
}

function Field({ label, value, onChange, ...rest }: { label: string; value?: string; onChange: (v: string) => void } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return (
    <label>
      <span className="label">{label}</span>
      <input className="input" value={value ?? ""} onChange={(e) => onChange(e.target.value)} {...rest} />
    </label>
  );
}

function Row({ icon, label, onEdit }: { icon: string; label: string; onEdit?: () => void }) {
  return (
    <li className="flex items-start gap-3">
      <span>{icon}</span>
      <span className="flex-1 break-words">{label}</span>
      {onEdit && <button className="text-xs font-semibold text-primary" onClick={onEdit}>Edit</button>}
    </li>
  );
}

function QuoteBox({ q, bare }: { q: Quote; bare?: boolean }) {
  const rows: [string, string, string?][] = [["Subtotal", inr(q.subtotal)]];
  if (q.visitingCharge) rows.push(["Visiting charge", inr(q.visitingCharge)]);
  if (q.visitingWaived) rows.push(["Visiting charge", "FREE", "text-emerald-600"]);
  if (q.discount) rows.push([q.discountLabel ?? "Discount", "−" + inr(q.discount), "text-emerald-600"]);
  rows.push(["GST (18%)", inr(q.gst)]);
  return (
    <div className={bare ? "" : "card p-5"}>
      {rows.map(([k, v, c]) => (
        <div key={k + v} className="flex justify-between py-1 text-sm"><span className="text-ink-muted">{k}</span><span className={`tabular-nums ${c ?? ""}`}>{v}</span></div>
      ))}
      <div className="mt-2 flex justify-between border-t border-slate-200 pt-2 font-semibold"><span>TOTAL</span><span className="tabular-nums">{inr(q.total)}</span></div>
    </div>
  );
}

function Offers({ subtotal, consultation }: { subtotal: number; consultation: boolean }) {
  return (
    <div className="space-y-2 text-sm">
      {!consultation && (
        <p className={`rounded-xl p-3 ${subtotal >= VISITING_WAIVER_MIN ? "bg-success-50 text-emerald-700" : "bg-secondary-50 text-amber-800"}`}>
          🎁 {subtotal >= VISITING_WAIVER_MIN ? "Visiting fee waived on your order!" : `Add ${inr(VISITING_WAIVER_MIN - subtotal)} more to waive the ${inr(VISITING_CHARGE)} visiting fee.`}
        </p>
      )}
      <p className={`rounded-xl p-3 ${subtotal > AUTO_DISCOUNT.minOrder ? "bg-success-50 text-emerald-700" : "bg-slate-100 text-ink-muted"}`}>
        🏷️ {AUTO_DISCOUNT.percent}% off on orders above {inr(AUTO_DISCOUNT.minOrder)} (max {inr(AUTO_DISCOUNT.maxOff)}){subtotal > AUTO_DISCOUNT.minOrder ? " — applied!" : ""}
      </p>
    </div>
  );
}

function PromoBox({ applied, value, onChange, onApply, onRemove }: { applied: string | null; value: string; onChange: (v: string) => void; onApply: () => void; onRemove: () => void }) {
  if (applied)
    return (
      <div className="flex items-center justify-between rounded-xl border border-dashed border-success bg-success-50 p-3 text-sm">
        <span>🎟️ Promo <b>{applied}</b> applied</span>
        <button className="font-semibold text-danger" onClick={onRemove}>Remove</button>
      </div>
    );
  return (
    <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); onApply(); }}>
      <input className="input uppercase" placeholder="Promo code (try FIRST100)" value={value} onChange={(e) => onChange(e.target.value.toUpperCase().slice(0, 20))} aria-label="Promo code" />
      <button className="btn-outline shrink-0" disabled={!value.trim()}>Apply</button>
    </form>
  );
}
