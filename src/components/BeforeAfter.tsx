"use client";
import { useRef, useState } from "react";
import { WallArt } from "./WallArt";
import type { GalleryItem } from "@/lib/catalog";
import { inr } from "@/lib/format";

export function BeforeAfterSlider({ variant, label }: { variant: string; label: string }) {
  const [pos, setPos] = useState(50);
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const update = (clientX: number) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    setPos(Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100)));
  };
  return (
    <div
      ref={ref}
      className="relative aspect-[400/260] select-none overflow-hidden bg-slate-200 touch-pan-y"
      onPointerDown={(e) => {
        dragging.current = true;
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        update(e.clientX);
      }}
      onPointerMove={(e) => dragging.current && update(e.clientX)}
      onPointerUp={() => (dragging.current = false)}
      onPointerCancel={() => (dragging.current = false)}
    >
      <div className="absolute inset-0"><WallArt variant={variant} /></div>
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <WallArt variant={variant} before />
      </div>
      <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow" style={{ left: `${pos}%` }}>
        <div className="absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-xs font-bold text-ink shadow-lg">⇆</div>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        className="absolute inset-x-0 bottom-0 h-8 w-full cursor-ew-resize opacity-0"
        aria-label={`Before and after comparison: ${label}`}
      />
    </div>
  );
}

export function GalleryCard({ item }: { item: GalleryItem }) {
  return (
    <article className="card overflow-hidden">
      <BeforeAfterSlider variant={item.after} label={item.title} />
      <div className="p-4">
        <h3 className="font-semibold">{item.title}</h3>
        <p className="mt-1 text-sm text-ink-muted">
          📍 {item.locality} · {item.duration} · ~{inr(item.cost)}
        </p>
      </div>
    </article>
  );
}
