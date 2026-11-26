import type { MetadataRoute } from "next";
import { CATEGORIES } from "@/lib/catalog";
import { SITE_URL } from "@/lib/config";
import { db, syncDb } from "@/lib/db";
import { allSeoPages } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await syncDb();
  const base = SITE_URL;
  const statics = ["", "/services", "/gallery", "/about", "/contact", "/faqs", "/providers", "/terms", "/privacy"];
  return [
    ...statics.map((p) => ({ url: base + p, changeFrequency: "weekly" as const, priority: p ? 0.6 : 1 })),
    ...CATEGORIES.map((c) => ({ url: `${base}/services/${c.slug}`, changeFrequency: "weekly" as const, priority: 0.9 })),
    ...db().providers.filter((p) => p.isActive).map((p) => ({ url: `${base}/providers/${p.id}`, priority: 0.4 })),
    ...allSeoPages().map((p) => ({ url: `${base}/${p.slug}`, changeFrequency: "monthly" as const, priority: 0.7 })),
  ];
}
