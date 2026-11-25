"use client";
import { useState } from "react";
import type { GalleryItem } from "@/lib/catalog";
import { GalleryCard } from "./BeforeAfter";

const FILTERS = ["All", "PVC Panels", "Wall Design", "Furniture", "Carpentry", "Painting"] as const;

export function GalleryGrid({ items, limit, carousel }: { items: GalleryItem[]; limit?: number; carousel?: boolean }) {
  const [f, setF] = useState<(typeof FILTERS)[number]>("All");
  const list = items.filter((i) => f === "All" || i.filter === f).slice(0, limit);
  return (
    <div>
      <div className="no-scrollbar -mx-4 mb-6 flex gap-2 overflow-x-auto px-4" role="tablist" aria-label="Filter gallery">
        {FILTERS.map((x) => (
          <button key={x} role="tab" aria-selected={f === x} className={`chip ${f === x ? "chip-active" : ""}`} onClick={() => setF(x)}>
            {x}
          </button>
        ))}
      </div>
      {list.length === 0 ? (
        <p className="py-10 text-center text-ink-muted">No projects in this category yet.</p>
      ) : carousel ? (
        <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
          {list.map((i) => (
            <div key={i.id} className="w-[85%] shrink-0 snap-center md:w-auto">
              <GalleryCard item={i} />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((i) => <GalleryCard key={i.id} item={i} />)}
        </div>
      )}
    </div>
  );
}
