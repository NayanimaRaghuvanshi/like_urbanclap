import { CATEGORIES, LOCALITIES } from "./catalog.ts";
import { BASE, SERVICE_RADIUS_M } from "./config.ts";
import { distanceM } from "./geo.ts";

export const servedLocalities = () => LOCALITIES.filter((l) => SERVICE_RADIUS_M <= 0 || distanceM(l, BASE) <= SERVICE_RADIUS_M);

export function seoSlug(category: string, locality: string) {
  return `${BASE.city}-${category}-${locality}`;
}

export function parseSeo(slug: string) {
  const prefix = BASE.city + "-";
  if (!slug.startsWith(prefix)) return null;
  const rest = slug.slice(prefix.length);
  const cat = CATEGORIES.find((c) => rest.startsWith(c.slug + "-"));
  if (!cat) return null;
  const loc = servedLocalities().find((l) => l.slug === rest.slice(cat.slug.length + 1));
  return loc ? { category: cat, locality: loc } : null;
}

export const allSeoPages = () => servedLocalities().flatMap((l) => CATEGORIES.map((c) => ({ slug: seoSlug(c.slug, l.slug), category: c, locality: l })));
