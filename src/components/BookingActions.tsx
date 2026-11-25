"use client";
import { useState } from "react";
import type { BookingView } from "@/lib/bookings";
import { FREE_CANCEL_BEFORE_MIN, LATE_CANCEL_FEE, SUPPORT_PHONE, WHATSAPP_NUMBER } from "@/lib/config";
import { slotEpoch } from "@/lib/slots";
import { SlotPicker } from "./SlotPicker";
import { api, useToast } from "./store";
import { Sheet } from "./ui";

export function BookingActions({ b, onChange, compact }: { b: BookingView; onChange: (b: BookingView) => void; compact?: boolean }) {
  const toast = useToast();
  const [resched, setResched] = useState(false);
  const [cancel, setCancel] = useState(false);
  const [slot, setSlot] = useState<{ date: string; slot: number }>();
  const [busy, setBusy] = useState(false);
  const minsLeft = (slotEpoch(b.date, b.slot) - Date.now()) / 60000;
  const canResched = ["confirmed", "assigned"].includes(b.status) && minsLeft >= FREE_CANCEL_BEFORE_MIN;
  const canCancel = ["confirmed", "assigned", "on_way"].includes(b.status);
  const late = minsLeft < FREE_CANCEL_BEFORE_MIN;
  const duration = b.items.reduce((s, i) => s + i.durationMin * i.qty, 0);

  async function act(json: Record<string, unknown>, msg: string) {
    setBusy(true);
    try {
      const r = await api<{ booking: BookingView }>(`/api/bookings/${b.id}`, { json });
      onChange(r.booking);
      toast(msg, "ok");
      setResched(false);
      setCancel(false);
    } catch (e) {
      toast((e as Error).message, "err");
    } finally {
      setBusy(false);
    }
  }

  const sz = compact ? "btn-sm" : "";
  return (
    <>
      <div className="flex flex-wrap gap-2">
        {canResched && <button className={`btn-outline ${sz}`} onClick={() => setResched(true)}>Reschedule</button>}
        {canCancel && <button className={`btn-outline ${sz} hover:border-danger hover:text-danger`} onClick={() => setCancel(true)}>Cancel{compact ? "" : " Booking"}</button>}
        <a className={`btn-outline ${sz}`} href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hi, I need help with booking ${b.id}`)}`} target="_blank" rel="noopener noreferrer">{compact ? "Contact" : "Contact Support"}</a>
      </div>
      <Sheet open={resched} onClose={() => setResched(false)} title="Reschedule booking" wide>
        <SlotPicker category={b.category} durationMin={duration} exclude={b.id} value={slot} onChange={setSlot} />
        <button className="btn-primary mt-5 w-full" disabled={!slot || busy} onClick={() => slot && act({ action: "reschedule", ...slot }, "Booking rescheduled")}>Confirm new slot</button>
      </Sheet>
      <Sheet open={cancel} onClose={() => setCancel(false)} title="Cancel this booking?">
        <p className="text-sm text-ink-muted">
          {late ? `Your slot is less than 2 hours away, so a ₹${LATE_CANCEL_FEE} late-cancellation fee applies.` : "Free cancellation — you're more than 2 hours before the slot."}
          {b.paymentStatus === "paid" && " Your online payment will be refunded to the original method in 5–7 working days."}
        </p>
        <div className="mt-5 flex gap-2">
          <button className="btn-outline flex-1" onClick={() => setCancel(false)}>Keep booking</button>
          <button className="btn flex-1 bg-danger text-white hover:bg-red-600" disabled={busy} onClick={() => act({ action: "cancel" }, "Booking cancelled")}>Yes, cancel</button>
        </div>
        <p className="mt-4 text-center text-xs text-ink-muted">Or call <a className="text-primary" href={`tel:${SUPPORT_PHONE}`}>{SUPPORT_PHONE}</a> to change details.</p>
      </Sheet>
    </>
  );
}

export function ReviewForm({ b, onChange }: { b: BookingView; onChange: (b: BookingView) => void }) {
  const toast = useToast();
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <form
      className="space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!rating) return toast("Pick a star rating", "err");
        setBusy(true);
        try {
          const r = await api<{ booking: BookingView }>(`/api/bookings/${b.id}`, { json: { action: "review", rating, text } });
          onChange(r.booking);
          toast("Thanks for your review!", "ok");
        } catch (x) {
          toast((x as Error).message, "err");
        } finally {
          setBusy(false);
        }
      }}
    >
      <div className="flex gap-1" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" role="radio" aria-checked={rating === n} aria-label={`${n} star`} onClick={() => setRating(n)} className={`h-11 w-11 text-3xl ${n <= rating ? "text-secondary" : "text-slate-300"}`}>★</button>
        ))}
      </div>
      <textarea className="input min-h-[90px]" maxLength={600} placeholder="Tell others about your experience (optional)" value={text} onChange={(e) => setText(e.target.value)} />
      <button className="btn-primary" disabled={busy}>Submit Review</button>
    </form>
  );
}
