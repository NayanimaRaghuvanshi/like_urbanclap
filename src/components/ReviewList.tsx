"use client";
import { useState } from "react";
import { relTime } from "@/lib/format";
import type { Review } from "@/lib/types";
import { Stars } from "./ui";

export function ReviewCard({ r }: { r: Review }) {
  return (
    <article className="card flex h-full flex-col p-5">
      <Stars value={r.rating} />
      <p className="mt-2 flex-1 text-sm leading-relaxed">“{r.text}”</p>
      {r.adminReply && <p className="mt-3 rounded-lg bg-slate-50 p-3 text-xs text-ink-muted">↳ {r.adminReply}</p>}
      <p className="mt-3 text-xs text-ink-muted">
        <span className="font-semibold text-ink">— {r.customerName}</span> · {r.serviceName} · {relTime(r.createdAt)}
      </p>
    </article>
  );
}

export function ReviewList({ reviews, initial = 6, filterable = true }: { reviews: Review[]; initial?: number; filterable?: boolean }) {
  const [n, setN] = useState(initial);
  const [star, setStar] = useState<number | null>(null);
  const list = reviews.filter((r) => star === null || r.rating === star);
  return (
    <div>
      {filterable && (
        <div className="no-scrollbar -mx-4 mb-4 flex gap-2 overflow-x-auto px-4">
          <button className={`chip ${star === null ? "chip-active" : ""}`} onClick={() => setStar(null)}>All</button>
          {[5, 4, 3, 2, 1].map((s) => (
            <button key={s} className={`chip ${star === s ? "chip-active" : ""}`} onClick={() => setStar(s)}>{s} ★</button>
          ))}
        </div>
      )}
      {list.length === 0 ? (
        <p className="py-6 text-center text-sm text-ink-muted">No reviews with this rating yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.slice(0, n).map((r) => <ReviewCard key={r.id} r={r} />)}
        </div>
      )}
      {list.length > n && (
        <div className="mt-6 text-center">
          <button className="btn-outline" onClick={() => setN((x) => x + 6)}>Load More Reviews</button>
        </div>
      )}
    </div>
  );
}
