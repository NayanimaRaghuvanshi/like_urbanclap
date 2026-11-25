"use client";
import { useEffect } from "react";

export function Stars({ value, size = "text-sm" }: { value: number; size?: string }) {
  const full = Math.round(value);
  return (
    <span className={`${size} tracking-tight`} aria-label={`${value} out of 5 stars`}>
      <span className="text-secondary">{"★".repeat(full)}</span>
      <span className="text-slate-300">{"★".repeat(5 - full)}</span>
    </span>
  );
}

export function Histogram({ counts }: { counts: number[] }) {
  const max = Math.max(...counts, 1);
  return (
    <div className="space-y-1.5">
      {counts.map((c, i) => (
        <div key={i} className="flex items-center gap-3 text-sm">
          <span className="w-8 shrink-0 text-ink-muted">{5 - i} ★</span>
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
            <div className={`h-full rounded-full ${i < 2 ? "bg-success" : i === 2 ? "bg-secondary" : "bg-danger"}`} style={{ width: `${(c / max) * 100}%` }} />
          </div>
          <span className="w-12 shrink-0 text-right tabular-nums text-ink-muted">{c.toLocaleString("en-IN")}</span>
        </div>
      ))}
    </div>
  );
}

export function Avatar({ name, hue = 210, size = 56 }: { name: string; hue?: number; size?: number }) {
  const initials = name.split(/\s+/).map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-2xl font-display font-semibold text-white"
      style={{ width: size, height: size, fontSize: size * 0.36, background: `linear-gradient(135deg, hsl(${hue} 70% 50%), hsl(${(hue + 40) % 360} 70% 40%))` }}
      aria-hidden
    >
      {initials}
    </div>
  );
}

export function Sheet({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title?: string; children: React.ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", k);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", k);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label={title}>
      <button className="absolute inset-0 bg-slate-900/50" onClick={onClose} aria-label="Close" />
      <div className={`relative max-h-[90vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-6 ${wide ? "sm:max-w-2xl" : "sm:max-w-lg"}`}>
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-slate-200 sm:hidden" />
        <div className="mb-3 flex items-start justify-between gap-4">
          {title && <h3 className="text-lg font-semibold">{title}</h3>}
          <button onClick={onClose} className="-mr-2 -mt-1 flex h-10 w-10 items-center justify-center rounded-full text-xl text-ink-muted hover:bg-slate-100" aria-label="Close">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Faqs({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white">
      {items.map((f) => (
        <details key={f.q} className="group">
          <summary className="flex min-h-[52px] cursor-pointer list-none items-center justify-between gap-4 px-5 py-3 font-medium hover:bg-slate-50">
            {f.q}
            <span className="text-ink-muted transition group-open:rotate-90">▸</span>
          </summary>
          <p className="px-5 pb-4 text-sm leading-relaxed text-ink-muted">{f.a}</p>
        </details>
      ))}
    </div>
  );
}

export function Badge({ children, tone = "blue" }: { children: React.ReactNode; tone?: "blue" | "green" | "amber" | "purple" | "red" | "gray" }) {
  const t = {
    blue: "bg-primary-50 text-primary-700",
    green: "bg-success-50 text-emerald-700",
    amber: "bg-secondary-50 text-amber-700",
    purple: "bg-accent-50 text-violet-700",
    red: "bg-danger-50 text-red-700",
    gray: "bg-slate-100 text-slate-700",
  }[tone];
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${t}`}>{children}</span>;
}
