import { test } from "node:test";
import assert from "node:assert/strict";
import { allSlots, bookableDates, fitsBeforeClose, isWithinBookingWindow, istDate, pickProvider, slotAvailability, slotEpoch, slotGroup } from "../src/lib/slots.ts";
import { checkServiceable, distanceM } from "../src/lib/geo.ts";
import { computeQuote } from "../src/lib/pricing.ts";
import { estimateWall, LOCALITIES, PANELS } from "../src/lib/catalog.ts";
import { parseSeo, servedLocalities } from "../src/lib/seo.ts";
import { SEED_PROVIDERS, seedReviews } from "../src/lib/seed.ts";
import { TEST_PROVIDERS } from "./fixtures.ts";
import { slotLabel } from "../src/lib/format.ts";
import type { Booking } from "../src/lib/types.ts";

test("31 slots from 9:00 AM to 12:00 AM, grouped", () => {
  const s = allSlots();
  assert.equal(s.length, 31);
  assert.equal(slotLabel(s[0]), "9:00 AM");
  assert.equal(slotLabel(s[s.length - 1]), "12:00 AM");
  assert.equal(slotGroup(11 * 60 + 30), "Morning");
  assert.equal(slotGroup(12 * 60), "Afternoon");
  assert.equal(slotGroup(16 * 60), "Evening");
  assert.equal(slotGroup(24 * 60), "Night");
});

test("IST date handling and 1-hour lead time", () => {
  // 2026-11-25 20:00 UTC = 2026-11-26 01:30 IST
  const now = Date.UTC(2026, 10, 25, 20, 0);
  assert.equal(istDate(now), "2026-11-26");
  assert.equal(bookableDates(now).length, 7);
  // 10:00 IST on 2026-11-26 = 04:30 UTC
  assert.equal(slotEpoch("2026-11-26", 600), Date.UTC(2026, 10, 26, 4, 30));
  const tenAm = Date.UTC(2026, 10, 26, 4, 30) - 30 * 60000; // 9:30 IST
  assert.equal(isWithinBookingWindow("2026-11-26", 600, tenAm), false);
  assert.equal(isWithinBookingWindow("2026-11-26", 630, tenAm), true);
});

test("long jobs must start early enough to finish by 12:30 AM", () => {
  assert.equal(fitsBeforeClose(24 * 60, 30), true);
  assert.equal(fitsBeforeClose(24 * 60, 60), false);
  assert.equal(fitsBeforeClose(23 * 60 + 30, 60), true);
});

test("availability respects provider bookings, leave, capacity and blocks", () => {
  const now = Date.UTC(2026, 10, 25, 0, 0); // 5:30 AM IST
  const date = "2026-11-25";
  const plumbers = TEST_PROVIDERS.filter((p) => p.categories.includes("plumber")).map((p) => ({ ...p }));
  assert.equal(plumbers.length, 2);
  const booking = { id: "b1", category: "plumber", date, slot: 600, status: "assigned", providerId: plumbers[0].id, items: [{ durationMin: 90, qty: 1 }] } as unknown as Booking;
  const base = { category: "plumber" as const, date, durationMin: 30, providers: plumbers, bookings: [booking], settings: { slotCapacity: {}, blocked: [] }, now };
  const av = slotAvailability(base);
  const at = (m: number) => av.find((s) => s.slot === m)!;
  assert.equal(at(570).available, 2);
  assert.equal(at(600).available, 1); // one plumber busy 10:00–11:30
  assert.equal(at(660).available, 1);
  assert.equal(at(690).available, 2);
  assert.equal(pickProvider(base, 600)?.id, plumbers[1].id);

  const capped = slotAvailability({ ...base, settings: { slotCapacity: { plumber: 1 }, blocked: [] } });
  assert.equal(capped.find((s) => s.slot === 600)!.available, 0);
  const blocked = slotAvailability({ ...base, settings: { slotCapacity: {}, blocked: [`${date}|570`] } });
  assert.equal(blocked.find((s) => s.slot === 570)!.reason, "blocked");
  plumbers[1].leaveDates = [date];
  assert.equal(slotAvailability(base).find((s) => s.slot === 600)!.available, 0);
});

test("serviceability: unrestricted by default, 2 km when configured", () => {
  const indira = LOCALITIES.find((l) => l.slug === "indiranagar")!;
  assert.equal(checkServiceable(indira).serviceable, true);
  assert.equal(checkServiceable({ lat: 12.9116, lng: 77.6389 }, 2000).serviceable, true);
  const r = checkServiceable(indira, 2000);
  assert.equal(r.serviceable, false);
  assert.ok(r.distanceM > 6000);
  assert.ok(Math.abs(distanceM({ lat: 0, lng: 0 }, { lat: 0, lng: 1 }) - 111195) < 50);
});

test("pricing: visiting charge, auto discount, GST", () => {
  const q = computeQuote([{ price: 99, qty: 1 }, { price: 149, qty: 1 }]);
  assert.deepEqual([q.subtotal, q.visitingCharge, q.discount, q.gst, q.total], [248, 49, 0, 53, 350]);
  const big = computeQuote([{ price: 499, qty: 1 }, { price: 149, qty: 1 }]);
  assert.equal(big.visitingWaived, true);
  assert.equal(big.discount, 65); // 10% of 648
  assert.equal(big.total, 583 + Math.round(583 * 0.18));
  const capped = computeQuote([{ price: 6000, qty: 1 }]);
  assert.equal(capped.discount, 200);
  const consult = computeQuote([{ price: 49, qty: 1 }], { consultationOnly: true });
  assert.equal(consult.visitingCharge, 0);
  assert.equal(consult.total, 49 + 9);
  const promo = computeQuote([{ price: 249, qty: 1 }], { promo: { code: "FIRST100", percent: 15, maxOff: 100, minOrder: 199, active: true } });
  assert.equal(promo.discount, 37);
});

test("panel estimate", () => {
  const pvc = PANELS.find((p) => p.id === "p-wood")!;
  const e = estimateWall(12, 10, pvc);
  assert.equal(e.panels, Math.ceil((120 * 1.05) / 12.6));
  assert.equal(e.trims, Math.ceil(44 / 9.5));
  assert.equal(e.total, e.panels * 880 + e.trims * 90);
  assert.equal(estimateWall(0, 10, pvc).total, 0);
});

test("SEO locality pages", () => {
  const served = servedLocalities();
  assert.equal(served.length, LOCALITIES.length);
  assert.equal(parseSeo("bangalore-pvc-panels-agara")?.category.slug, "pvc-panels");
  assert.equal(parseSeo("bangalore-wall-designer-hsr-layout-sector-2")?.locality.slug, "hsr-layout-sector-2");
  assert.equal(parseSeo("bangalore-plumber-indiranagar")?.locality.slug, "indiranagar");
  assert.equal(parseSeo("mumbai-plumber-agara"), null);
});

test("no sample data ships, and booking works before any professional is added", () => {
  assert.equal(SEED_PROVIDERS.length, 0);
  assert.equal(seedReviews().length, 0);
  const now = Date.UTC(2026, 10, 25, 0, 0);
  const date = "2026-11-25";
  const existing = { id: "b1", category: "painting", date, slot: 600, status: "confirmed", items: [{ durationMin: 60, qty: 1 }] } as unknown as Booking;
  const base = { category: "painting" as const, date, durationMin: 60, providers: TEST_PROVIDERS, bookings: [existing], settings: { slotCapacity: {}, blocked: [] }, now };
  const av = slotAvailability(base);
  assert.equal(av.find((s) => s.slot === 570)!.available, 2); // default capacity
  assert.equal(av.find((s) => s.slot === 600)!.available, 1); // one already booked
  assert.equal(slotAvailability({ ...base, settings: { slotCapacity: { painting: 5 }, blocked: [] } }).find((s) => s.slot === 570)!.available, 5);
  assert.equal(pickProvider(base, 570), undefined); // waits for admin assignment
});
