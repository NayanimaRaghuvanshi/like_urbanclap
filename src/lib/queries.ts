import "server-only";
import { CATEGORIES, categoryBySlug } from "./catalog";
import { db } from "./db";
import { nextAvailable } from "./slots";
import type { CategorySlug, Review } from "./types";

export const visibleReviews = (filter: (r: Review) => boolean = () => true) =>
  db().reviews.filter((r) => !r.hidden && filter(r)).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

/** Histogram = seeded aggregate (historic) + live reviews collected on the platform. */
export function histogramFor(category?: CategorySlug): number[] {
  const cats = category ? [categoryBySlug(category)!] : CATEGORIES;
  const h = [0, 0, 0, 0, 0];
  cats.forEach((c) => c.histogram.forEach((v, i) => (h[i] += v)));
  db().reviews.forEach((r) => {
    if (r.id.startsWith("r-seed") || r.hidden) return;
    if (!category || r.category === category) h[5 - r.rating]++;
  });
  return h;
}

export function ratingSummary(category?: CategorySlug) {
  const h = histogramFor(category);
  const total = h.reduce((a, b) => a + b, 0);
  const avg = total ? h.reduce((s, c, i) => s + c * (5 - i), 0) / total : 0;
  return { histogram: h, total, avg: Math.round(avg * 10) / 10 };
}

export const activeServices = (category?: CategorySlug) => db().services.filter((s) => s.isActive && (!category || s.category === category));

export function startingPrice(category: CategorySlug) {
  const list = activeServices(category);
  return list.length ? Math.min(...list.map((s) => s.price)) : 0;
}

export function nextSlotFor(category: CategorySlug, durationMin = 30) {
  const d = db();
  return nextAvailable({ category, durationMin, providers: d.providers, bookings: d.bookings, settings: d.settings });
}

export const providersFor = (category?: CategorySlug) => db().providers.filter((p) => p.isActive && (!category || p.categories.includes(category)));
