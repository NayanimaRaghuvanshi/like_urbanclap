"use client";
import { useEffect, useState } from "react";
import { dateLabel, slotLabel, slotShort } from "@/lib/format";
import { slotGroup, istDate, type SlotAvailability } from "@/lib/slots";
import type { CategorySlug } from "@/lib/types";
import { api } from "./store";

interface Resp { date: string; dates: { date: string; open: number }[]; slots: SlotAvailability[] }

export function SlotPicker({ category, durationMin, exclude, value, onChange }: { category: CategorySlug; durationMin: number; exclude?: string; value?: { date: string; slot: number }; onChange: (v: { date: string; slot: number } | undefined) => void }) {
  const [date, setDate] = useState<string | undefined>(value?.date);
  const [data, setData] = useState<Resp>();
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let live = true;
    setLoading(true);
    const q = new URLSearchParams({ category, duration: String(durationMin), ...(date ? { date } : {}), ...(exclude ? { exclude } : {}) });
    api<Resp>(`/api/slots?${q}`)
      .then((r) => {
        if (!live) return;
        setData(r);
        setErr("");
        if (!date) {
          // Default to the first date that has open slots.
          const first = r.dates.find((d) => d.open > 0)?.date;
          if (first && first !== r.date) setDate(first);
        }
        if (value && value.date === r.date && !r.slots.find((s) => s.slot === value.slot && s.available > 0)) onChange(undefined);
      })
      .catch((e) => live && setErr((e as Error).message))
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, durationMin, date, exclude]);

  const today = istDate();
  const shown = data?.date ?? date;
  const groups = ["Morning", "Afternoon", "Evening", "Night"] as const;
  const firstOpen = data?.slots.find((s) => s.available > 0);

  return (
    <div>
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1" role="radiogroup" aria-label="Date">
        {(data?.dates ?? []).map((d) => {
          const [, , dd] = d.date.split("-");
          const active = d.date === shown;
          return (
            <button
              key={d.date}
              role="radio"
              aria-checked={active}
              onClick={() => setDate(d.date)}
              className={`flex min-w-[68px] shrink-0 flex-col items-center rounded-2xl border px-3 py-2 transition ${active ? "border-primary bg-primary text-white" : d.open ? "border-slate-300 bg-white hover:border-primary" : "border-slate-200 bg-slate-50 text-slate-400"}`}
            >
              <span className="text-xs">{d.date === today ? "Today" : dateLabel(d.date, { weekday: "short" })}</span>
              <span className="font-display text-xl font-bold">{Number(dd)}</span>
              <span className={`text-[10px] ${active ? "text-white/80" : "text-ink-muted"}`}>{d.open ? `${d.open} slots` : "Full"}</span>
            </button>
          );
        })}
        {!data && Array.from({ length: 7 }).map((_, i) => <div key={i} className="skeleton h-[76px] w-[68px] shrink-0 rounded-2xl" />)}
      </div>
      {err && <p className="mt-4 text-sm text-danger">{err}</p>}
      {shown && data && (
        <p className="mt-4 text-sm font-medium">
          Available slots for {dateLabel(shown, { weekday: "short", day: "numeric", month: "short" })}
          {shown === today && firstOpen && <span className="ml-2 rounded-full bg-success-50 px-2 py-0.5 text-xs text-emerald-700">⚡ Same-day available! Next slot: {slotLabel(firstOpen.slot)}</span>}
        </p>
      )}
      <div className={`mt-3 space-y-4 ${loading ? "opacity-50" : ""}`}>
        {data &&
          groups.map((g) => {
            // Hide slots that have already passed (or are within the 1-hour lead time); keep booked ones visible but grayed.
            const list = data.slots.filter((s) => slotGroup(s.slot) === g && s.reason !== "past");
            if (!list.length) return null;
            return (
              <div key={g}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">{g}</p>
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8">
                  {list.map((s) => {
                    const sel = value?.date === data.date && value.slot === s.slot;
                    const off = s.available <= 0;
                    return (
                      <button
                        key={s.slot}
                        disabled={off}
                        onClick={() => onChange({ date: data.date, slot: s.slot })}
                        className={`min-h-[44px] rounded-xl border text-sm font-medium transition ${sel ? "border-primary bg-primary text-white" : off ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 line-through" : "border-slate-300 bg-white hover:border-primary hover:text-primary"}`}
                        title={off ? (s.reason === "past" ? "Too soon or past" : s.reason === "late" ? "Job can't finish before 12:30 AM" : s.reason === "blocked" ? "Unavailable" : "Fully booked") : `${s.available} pro${s.available > 1 ? "s" : ""} available`}
                        aria-pressed={sel}
                      >
                        {slotShort(s.slot)}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        {data && !data.slots.some((s) => s.available > 0) && <p className="rounded-xl bg-slate-50 p-4 text-sm text-ink-muted">No open slots on this day. Please pick another date.</p>}
      </div>
      <p className="mt-3 text-xs text-ink-muted">Grayed out = fully booked or within 1 hour. Bookings up to 7 days ahead.</p>
    </div>
  );
}
