"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { categoryBySlug } from "@/lib/catalog";
import { durationLabel, inr } from "@/lib/format";
import type { Service } from "@/lib/types";
import { useStore, useToast, type CartLine } from "./store";
import { Sheet } from "./ui";

export function useAddToCart() {
  const { add, replaceCartWith, cartCategory } = useStore();
  const toast = useToast();
  const [conflict, setConflict] = useState<Omit<CartLine, "qty"> | null>(null);
  const addService = (s: Service, silent = false) => {
    const line = { serviceId: s.id, name: s.name, price: s.price, durationMin: s.durationMin, category: s.category, isConsultation: s.isConsultation };
    const r = add(line);
    if (r === "conflict") setConflict(line);
    else if (!silent) toast(`Added ${s.name.replace(/^PACKAGE: /, "")}`, "ok");
    return r !== "conflict";
  };
  const dialog = (
    <Sheet open={!!conflict} onClose={() => setConflict(null)} title="Replace your cart?">
      <p className="text-sm text-ink-muted">
        Your cart has {categoryBySlug(cartCategory ?? "")?.shortName} services. Each booking is handled by one professional, so you can book one category at a time.
      </p>
      <div className="mt-5 flex gap-2">
        <button className="btn-outline flex-1" onClick={() => setConflict(null)}>Keep current cart</button>
        <button
          className="btn-primary flex-1"
          onClick={() => {
            if (conflict) replaceCartWith(conflict);
            toast("Cart replaced", "ok");
            setConflict(null);
          }}
        >
          Replace
        </button>
      </div>
    </Sheet>
  );
  return { addService, dialog };
}

export function ServiceCard({ s, onDetails, onAdd }: { s: Service; onDetails: () => void; onAdd: () => void }) {
  const { cart, setQty } = useStore();
  const inCart = cart.find((c) => c.serviceId === s.id);
  return (
    <article className={`card p-5 ${s.isPackage ? "border-2 border-secondary/70 bg-secondary-50/30" : ""} ${s.isConsultation ? "border-accent/40" : ""}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="font-semibold">{s.isPackage ? "📦 " : ""}{s.name}</h3>
        {s.isPackage && s.mrp && <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-bold text-ink">SAVE {inr(s.mrp - s.price)}</span>}
        {s.isConsultation && <span className="rounded-full bg-accent-50 px-2 py-0.5 text-xs font-semibold text-violet-700">Consultation</span>}
      </div>
      <p className="mt-1 text-sm text-ink-muted">
        {s.reviewCount > 0 && <>⭐ {s.rating.toFixed(1)} ({s.reviewCount}) · </>}{s.isPackage && s.mrp ? <><s className="mr-1">{inr(s.mrp)}</s><b className="text-ink">{inr(s.price)}</b></> : <>Starts at <b className="text-ink">{inr(s.price)}{s.unit ?? ""}</b></>} · {durationLabel(s.durationMin)}
      </p>
      <ul className="mt-3 space-y-1 text-sm">
        {s.inclusions.slice(0, 3).map((i) => <li key={i}>✓ {i}</li>)}
      </ul>
      <div className="mt-4 flex items-center justify-between gap-2">
        <button className="btn-ghost btn-sm -ml-3" onClick={onDetails}>View Details</button>
        {inCart ? (
          <div className="flex items-center rounded-xl border border-primary text-primary">
            <button className="h-10 w-10 text-lg" onClick={() => setQty(s.id, inCart.qty - 1)} aria-label="Decrease">−</button>
            <span className="w-6 text-center font-semibold tabular-nums">{inCart.qty}</span>
            <button className="h-10 w-10 text-lg" onClick={() => setQty(s.id, inCart.qty + 1)} aria-label="Increase">+</button>
          </div>
        ) : (
          <button className="btn-primary btn-sm" onClick={onAdd}>Add to Cart 🛒</button>
        )}
      </div>
    </article>
  );
}

export function CartBar() {
  const { count, subtotal, ready } = useStore();
  if (!ready || !count) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 p-3 shadow-[0_-8px_24px_rgba(15,23,42,.08)] backdrop-blur">
      <div className="container-x flex items-center gap-3">
        <p className="flex-1 text-sm">🛒 <b>{count} item{count > 1 ? "s" : ""}</b> · {inr(subtotal)}</p>
        <Link href="/book" className="btn-primary">View Cart →</Link>
      </div>
    </div>
  );
}

export function CategoryServices({ services, subcategories }: { services: Service[]; subcategories: string[] }) {
  const [sub, setSub] = useState<string | null>(null);
  const [details, setDetails] = useState<Service | null>(null);
  const [more, setMore] = useState(false);
  const { addService, dialog } = useAddToCart();
  const subsWithServices = subcategories.filter((x) => services.some((s) => s.sub === x));
  const visibleSubs = more ? subsWithServices : subsWithServices.slice(0, 8);
  const list = services.filter((s) => !sub || s.sub === sub);
  return (
    <>
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 py-1">
        <button className={`chip ${!sub ? "chip-active" : ""}`} onClick={() => setSub(null)}>All</button>
        {visibleSubs.map((x) => (
          <button key={x} className={`chip ${sub === x ? "chip-active" : ""}`} onClick={() => setSub(x)}>{x}</button>
        ))}
        {!more && subsWithServices.length > 8 && <button className="chip" onClick={() => setMore(true)}>+{subsWithServices.length - 8} more</button>}
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {list.map((s) => <ServiceCard key={s.id} s={s} onDetails={() => setDetails(s)} onAdd={() => addService(s)} />)}
      </div>
      <Sheet open={!!details} onClose={() => setDetails(null)} title={details?.name}>
        {details && (
          <div>
            <p className="text-sm text-ink-muted">{details.description}</p>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
              <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-ink-muted">Price</p><p className="font-semibold">{inr(details.price)}{details.unit ?? ""}</p></div>
              <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-ink-muted">Duration</p><p className="font-semibold">{durationLabel(details.durationMin)}</p></div>
              <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-ink-muted">{details.reviewCount ? "Rating" : "Type"}</p><p className="font-semibold">{details.reviewCount ? `⭐ ${details.rating.toFixed(1)}` : details.isConsultation ? "Visit" : details.isPackage ? "Package" : "Fixed price"}</p></div>
            </div>
            <h4 className="mt-5 text-sm font-semibold">What's included</h4>
            <ul className="mt-2 space-y-1 text-sm">{details.inclusions.map((i) => <li key={i}>✓ {i}</li>)}</ul>
            <h4 className="mt-4 text-sm font-semibold">Good to know</h4>
            <ul className="mt-2 space-y-1 text-sm text-ink-muted">
              <li>• Spare parts, if needed, are charged at MRP with your approval.</li>
              <li>• Free cancellation up to 2 hours before the slot.</li>
              <li>• Share the start OTP when the pro arrives, and the end OTP when you're satisfied.</li>
            </ul>
            <button className="btn-primary mt-6 w-full" onClick={() => { if (addService(details)) setDetails(null); }}>Add to Cart · {inr(details.price)}</button>
          </div>
        )}
      </Sheet>
      {dialog}
      <CartBar />
    </>
  );
}

/** Primary CTA for consultation categories: put the consultation in the cart and go to booking. */
export function ConsultCta({ service, label, className = "btn-primary", note }: { service: Service; label?: string; className?: string; note?: string }) {
  const { addService, dialog } = useAddToCart();
  const router = useRouter();
  return (
    <>
      <button
        className={className}
        onClick={() => {
          if (note) {
            try { sessionStorage.setItem("hs_note", note); } catch {}
          }
          if (addService(service, true)) router.push("/book");
        }}
      >
        {label ?? `Book ${service.name} — ${inr(service.price)} →`}
      </button>
      {dialog}
    </>
  );
}
