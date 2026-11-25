import { CLOSE_MIN, MAX_ADVANCE_DAYS, MAX_OCCUPANCY_MIN, MIN_ADVANCE_MIN, OPEN_MIN, SLOT_MIN } from "./config.ts";
import type { Booking, CategorySlug, Provider, Settings } from "./types.ts";

const IST_OFFSET_MS = 330 * 60000; // India has no DST

/** All slot start times (minutes from operating-day midnight). 9:00 AM … 12:00 AM = 31 slots. */
export function allSlots(): number[] {
  const out: number[] = [];
  for (let m = OPEN_MIN; m + SLOT_MIN <= CLOSE_MIN; m += SLOT_MIN) out.push(m);
  return out;
}

export type SlotGroup = "Morning" | "Afternoon" | "Evening" | "Night";
export function slotGroup(min: number): SlotGroup {
  if (min < 12 * 60) return "Morning";
  if (min < 16 * 60) return "Afternoon";
  if (min < 20 * 60) return "Evening";
  return "Night";
}

export function istDate(now = Date.now()): string {
  return new Date(now + IST_OFFSET_MS).toISOString().slice(0, 10);
}

export function istMinutes(now = Date.now()): number {
  const d = new Date(now + IST_OFFSET_MS);
  return d.getUTCHours() * 60 + d.getUTCMinutes();
}

export function addDays(date: string, n: number): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

/** Absolute UTC epoch ms of a slot on an operating day (IST). */
export function slotEpoch(date: string, slot: number): number {
  const [y, m, d] = date.split("-").map(Number);
  return Date.UTC(y, m - 1, d) + slot * 60000 - IST_OFFSET_MS;
}

export function bookableDates(now = Date.now()): string[] {
  // An operating day runs past midnight, so between 00:00–00:30 IST "yesterday" may still have slots,
  // but none of them can satisfy the 1-hour lead time — so start from today's IST date.
  const today = istDate(now);
  return Array.from({ length: MAX_ADVANCE_DAYS }, (_, i) => addDays(today, i));
}

export function isWithinBookingWindow(date: string, slot: number, now = Date.now()): boolean {
  const t = slotEpoch(date, slot);
  return t - now >= MIN_ADVANCE_MIN * 60000 && t - now <= (MAX_ADVANCE_DAYS + 1) * 86400000;
}

export function occupancyMin(durationMin: number): number {
  return Math.max(SLOT_MIN, Math.min(MAX_OCCUPANCY_MIN, Math.ceil(durationMin / SLOT_MIN) * SLOT_MIN));
}

/** Job must be able to finish by closing (12:30 AM). */
export function fitsBeforeClose(slot: number, durationMin: number): boolean {
  return slot + Math.min(occupancyMin(durationMin), 60) <= CLOSE_MIN;
}

export function bookingDuration(b: Pick<Booking, "items">): number {
  return b.items.reduce((s, i) => s + i.durationMin * i.qty, 0);
}

function overlaps(aStart: number, aLen: number, bStart: number, bLen: number) {
  return aStart < bStart + bLen && bStart < aStart + aLen;
}

export interface SlotAvailability {
  slot: number;
  available: number;
  reason?: "past" | "blocked" | "full" | "late";
}

export interface AvailabilityInput {
  category: CategorySlug;
  date: string;
  durationMin: number;
  providers: Provider[];
  bookings: Booking[];
  settings: Settings;
  now?: number;
  /** Booking being rescheduled — ignore its own occupancy */
  excludeBookingId?: string;
}

export function freeProviders(input: AvailabilityInput, slot: number): Provider[] {
  const { category, date, durationMin, providers, bookings, excludeBookingId } = input;
  const len = occupancyMin(durationMin);
  return providers.filter((p) => {
    if (!p.isActive || !p.categories.includes(category) || p.leaveDates.includes(date)) return false;
    return !bookings.some(
      (b) =>
        b.id !== excludeBookingId &&
        b.providerId === p.id &&
        b.status !== "cancelled" &&
        b.status !== "completed" &&
        b.date === date &&
        overlaps(slot, len, b.slot, occupancyMin(bookingDuration(b)))
    );
  });
}

export function slotAvailability(input: AvailabilityInput): SlotAvailability[] {
  const { category, date, settings, bookings, now = Date.now(), excludeBookingId } = input;
  const cap = settings.slotCapacity[category];
  const dayBlocked = settings.blocked.includes(`${date}|*`);
  return allSlots().map((slot) => {
    if (!isWithinBookingWindow(date, slot, now)) return { slot, available: 0, reason: "past" as const };
    if (!fitsBeforeClose(slot, input.durationMin)) return { slot, available: 0, reason: "late" as const };
    if (dayBlocked || settings.blocked.includes(`${date}|${slot}`)) return { slot, available: 0, reason: "blocked" as const };
    const free = freeProviders(input, slot).length;
    const startingHere = bookings.filter(
      (b) => b.id !== excludeBookingId && b.category === category && b.date === date && b.slot === slot && b.status !== "cancelled"
    ).length;
    const unassigned = bookings.filter(
      (b) => b.id !== excludeBookingId && b.category === category && b.date === date && b.slot === slot && b.status !== "cancelled" && !b.providerId
    ).length;
    let available = free - unassigned;
    if (cap && cap > 0) available = Math.min(available, cap - startingHere);
    available = Math.max(0, available);
    return { slot, available, reason: available === 0 ? ("full" as const) : undefined };
  });
}

/** Least-loaded, highest-rated free provider. */
export function pickProvider(input: AvailabilityInput, slot: number): Provider | undefined {
  const free = freeProviders(input, slot);
  const load = (p: Provider) =>
    input.bookings.filter((b) => b.providerId === p.id && b.date === input.date && b.status !== "cancelled").length;
  return free.sort((a, b) => load(a) - load(b) || b.rating - a.rating)[0];
}

export function nextAvailable(
  base: Omit<AvailabilityInput, "date">,
  now = Date.now()
): { date: string; slot: number } | undefined {
  for (const date of bookableDates(now)) {
    const hit = slotAvailability({ ...base, date, now }).find((s) => s.available > 0);
    if (hit) return { date, slot: hit.slot };
  }
  return undefined;
}
