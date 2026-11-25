"use client";
import { useMemo, useState } from "react";
import { PANELS, TRIM_PRICE, estimateWall, type Panel } from "@/lib/catalog";
import { inr } from "@/lib/format";
import type { Service } from "@/lib/types";
import { ConsultCta } from "./CategoryView";
import { Sheet } from "./ui";
import { PanelSwatch } from "./WallArt";

const PRICE_BANDS = [
  { label: "Under ₹1,000", test: (p: Panel) => p.price < 1000 },
  { label: "₹1,000 – ₹2,000", test: (p: Panel) => p.price >= 1000 && p.price <= 2000 },
  { label: "Above ₹2,000", test: (p: Panel) => p.price > 2000 },
];

function Select({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <label className="relative">
      <span className="sr-only">{label}</span>
      <select className="input min-h-[40px] appearance-none py-2 pr-8 text-sm" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">{label}: All</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-muted">▾</span>
    </label>
  );
}

export function PanelCatalog({ measure }: { measure: Service }) {
  const [type, setType] = useState("");
  const [color, setColor] = useState("");
  const [pattern, setPattern] = useState("");
  const [band, setBand] = useState("");
  const [view, setView] = useState<Panel | null>(null);
  const list = PANELS.filter(
    (p) => (!type || p.type === type) && (!color || p.color === color) && (!pattern || p.pattern === pattern) && (!band || PRICE_BANDS.find((b) => b.label === band)!.test(p))
  );
  const uniq = (k: keyof Panel) => Array.from(new Set(PANELS.map((p) => String(p[k]))));
  return (
    <div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Select label="Type" value={type} options={uniq("type")} onChange={setType} />
        <Select label="Color" value={color} options={uniq("color")} onChange={setColor} />
        <Select label="Pattern" value={pattern} options={uniq("pattern")} onChange={setPattern} />
        <Select label="Price" value={band} options={PRICE_BANDS.map((b) => b.label)} onChange={setBand} />
      </div>
      {list.length === 0 ? (
        <p className="py-10 text-center text-ink-muted">No panels match these filters.</p>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {list.map((p) => (
            <button key={p.id} onClick={() => setView(p)} className="card overflow-hidden text-left transition hover:-translate-y-0.5 hover:shadow-lg">
              <div className="aspect-square"><PanelSwatch pattern={p.pattern} color={p.color} /></div>
              <div className="p-3">
                <p className="font-semibold leading-tight">{p.name}</p>
                <p className="text-xs text-ink-muted">{p.type} · {p.size}</p>
                <p className="mt-1 text-sm font-semibold">{inr(p.price)}<span className="text-xs font-normal text-ink-muted">/panel</span></p>
              </div>
            </button>
          ))}
        </div>
      )}
      <ul className="mt-4 space-y-1 text-xs text-ink-muted">
        <li>* All prices include materials, delivery & installation</li>
        <li>* Grade A fire-resistant, recyclable panels</li>
        <li>* Trims and beading: {inr(TRIM_PRICE)} each · LED installation kits available</li>
      </ul>
      <Sheet open={!!view} onClose={() => setView(null)} title={view?.name}>
        {view && (
          <div>
            <div className="aspect-[16/9] overflow-hidden rounded-2xl"><PanelSwatch pattern={view.pattern} color={view.color} /></div>
            <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-xl bg-slate-50 p-3"><dt className="text-xs text-ink-muted">Type</dt><dd className="font-semibold">{view.type}</dd></div>
              <div className="rounded-xl bg-slate-50 p-3"><dt className="text-xs text-ink-muted">Size</dt><dd className="font-semibold">{view.size}</dd></div>
              <div className="rounded-xl bg-slate-50 p-3"><dt className="text-xs text-ink-muted">Covers</dt><dd className="font-semibold">{view.coverageSqft} sq ft</dd></div>
              <div className="rounded-xl bg-slate-50 p-3"><dt className="text-xs text-ink-muted">Price (installed)</dt><dd className="font-semibold">{inr(view.price)}/panel</dd></div>
            </dl>
            <ConsultCta service={measure} className="btn-primary mt-5 w-full" label={`Book Measurement Visit — ${inr(measure.price)} →`} note={`Interested in ${view.name} (${view.type}) panels.`} />
          </div>
        )}
      </Sheet>
    </div>
  );
}

export function PriceCalculator({ measure }: { measure: Service }) {
  const [w, setW] = useState("12");
  const [h, setH] = useState("10");
  const [type, setType] = useState<Panel["type"]>("PVC");
  const designs = PANELS.filter((p) => p.type === type);
  const [design, setDesign] = useState(designs[0].id);
  const panel = PANELS.find((p) => p.id === design && p.type === type) ?? designs[0];
  const est = useMemo(() => estimateWall(Number(w) || 0, Number(h) || 0, panel), [w, h, panel]);
  const valid = Number(w) > 0 && Number(h) > 0 && Number(w) <= 60 && Number(h) <= 20;
  return (
    <div className="card p-5 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label><span className="label">Wall Width (ft)</span><input className="input" inputMode="decimal" value={w} onChange={(e) => setW(e.target.value.replace(/[^\d.]/g, ""))} /></label>
        <label><span className="label">Wall Height (ft)</span><input className="input" inputMode="decimal" value={h} onChange={(e) => setH(e.target.value.replace(/[^\d.]/g, ""))} /></label>
        <label>
          <span className="label">Panel Type</span>
          <select className="input" value={type} onChange={(e) => { const t = e.target.value as Panel["type"]; setType(t); setDesign(PANELS.find((p) => p.type === t)!.id); }}>
            {Array.from(new Set(PANELS.map((p) => p.type))).map((t) => <option key={t}>{t}</option>)}
          </select>
        </label>
        <label>
          <span className="label">Design</span>
          <select className="input" value={panel.id} onChange={(e) => setDesign(e.target.value)}>
            {designs.map((p) => <option key={p.id} value={p.id}>{p.name} — {inr(p.price)}</option>)}
          </select>
        </label>
      </div>
      <div className="mt-5 rounded-2xl bg-primary-50 p-4" aria-live="polite">
        {valid ? (
          <>
            <p className="text-sm text-ink-muted">Estimated Cost</p>
            <p className="font-display text-3xl font-bold text-primary">{inr(est.total)}</p>
            <p className="mt-1 text-xs text-ink-muted">
              {est.area.toFixed(0)} sq ft · {est.panels} panels × {inr(panel.price)} + {est.trims} trims × {inr(TRIM_PRICE)} (includes panels + trims + installation, 5% wastage)
            </p>
          </>
        ) : (
          <p className="text-sm text-ink-muted">Enter a wall width up to 60 ft and height up to 20 ft.</p>
        )}
      </div>
      <p className="mt-2 text-xs text-ink-muted">Final quote after measurement. Excludes GST, LED profiles and wall repairs.</p>
      <ConsultCta service={measure} className="btn-primary mt-4 w-full sm:w-auto" label={`Book Measurement Visit — ${inr(measure.price)} →`} note={valid ? `Wall ${w}×${h} ft, ${panel.name} (${panel.type}). Calculator estimate ${inr(est.total)}.` : undefined} />
    </div>
  );
}
