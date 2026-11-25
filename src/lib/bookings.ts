import "server-only";
import { categoryBySlug } from "./catalog";
import { FREE_CANCEL_BEFORE_MIN, LATE_CANCEL_FEE } from "./config";
import { db, mutate, otp4 } from "./db";
import { slotLabel, dateLabel, inr } from "./format";
import { checkServiceable } from "./geo";
import { notify } from "./notify";
import { computeQuote } from "./pricing";
import { bookingDuration, pickProvider, slotAvailability, slotEpoch, type AvailabilityInput } from "./slots";
import type { Address, Booking, BookingStatus, CategorySlug, Review } from "./types";

export class BookingError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

export function availabilityFor(category: CategorySlug, date: string, durationMin: number, excludeBookingId?: string) {
  const d = db();
  const input: AvailabilityInput = { category, date, durationMin, providers: d.providers, bookings: d.bookings, settings: d.settings, excludeBookingId };
  return { input, slots: slotAvailability(input) };
}

function nextBookingNumber(date: string): string {
  const [y, m, dd] = date.split("-");
  const key = `${y}${m}${dd}`;
  const n = mutate((d) => (d.counters[key] = (d.counters[key] || 0) + 1));
  return `HS-${y}-${m}${dd}-${String(n).padStart(4, "0")}`;
}

export interface CreateBookingInput {
  phone: string;
  name: string;
  email?: string;
  items: { serviceId: string; qty: number }[];
  date: string;
  slot: number;
  address: Address;
  notes: string;
  photos: string[];
  paymentMethod: "after_service" | "online";
  paymentRef?: string;
  promoCode?: string;
}

export function quoteFor(items: { serviceId: string; qty: number }[], promoCode?: string) {
  const d = db();
  const lines = items.map((i) => {
    const s = d.services.find((x) => x.id === i.serviceId && x.isActive);
    if (!s) throw new BookingError(`Service ${i.serviceId} is no longer available`);
    return { serviceId: s.id, name: s.name, price: s.price, qty: Math.max(1, Math.min(10, Math.floor(i.qty))), durationMin: s.durationMin, category: s.category, isConsultation: !!s.isConsultation };
  });
  if (!lines.length) throw new BookingError("Your cart is empty");
  const cats = new Set(lines.map((l) => l.category));
  if (cats.size > 1) throw new BookingError("Please book one service category at a time");
  const promo = promoCode ? d.promos.find((p) => p.code.toUpperCase() === promoCode.trim().toUpperCase()) : null;
  if (promoCode && !promo) throw new BookingError("Invalid promo code");
  const quote = computeQuote(lines, { consultationOnly: lines.every((l) => l.isConsultation), promo });
  return { lines, quote, category: lines[0].category as CategorySlug, promo };
}

export function createBooking(input: CreateBookingInput): Booking {
  const { lines, quote, category } = quoteFor(input.items, input.promoCode);
  const geo = checkServiceable(input.address);
  if (!geo.serviceable) throw new BookingError(`This address is ${(geo.distanceM / 1000).toFixed(1)} km away — outside our 2 km service area.`);

  const items = lines.map(({ serviceId, name, price, qty, durationMin }) => ({ serviceId, name, price, qty, durationMin }));
  const duration = bookingDuration({ items });
  const { input: avInput, slots } = availabilityFor(category, input.date, duration);
  const slot = slots.find((s) => s.slot === input.slot);
  if (!slot || slot.available <= 0) throw new BookingError("Sorry, that slot was just taken. Please pick another.", 409);
  const provider = pickProvider(avInput, input.slot);

  const id = nextBookingNumber(input.date);
  const now = new Date().toISOString();
  const booking: Booking = {
    id,
    customerPhone: input.phone,
    customerName: input.name,
    customerEmail: input.email || undefined,
    category,
    items,
    quote,
    date: input.date,
    slot: input.slot,
    address: input.address,
    distanceM: geo.distanceM,
    notes: input.notes,
    photos: input.photos,
    providerId: provider?.id,
    status: provider ? "assigned" : "confirmed",
    timeline: [{ status: "confirmed", at: now }, ...(provider ? [{ status: "assigned" as const, at: now, note: provider.name }] : [])],
    paymentMethod: input.paymentMethod,
    paymentStatus: input.paymentMethod === "online" && input.paymentRef ? "paid" : "pending",
    paymentRef: input.paymentRef,
    startOtp: otp4(),
    endOtp: otp4(),
    rescheduleCount: 0,
    createdAt: now,
  };

  mutate((d) => {
    d.bookings.unshift(booking);
    const c = d.customers.find((x) => x.phone === input.phone);
    if (c) {
      c.name = input.name;
      if (input.email) c.email = input.email;
    } else d.customers.push({ phone: input.phone, name: input.name, email: input.email, createdAt: now });
  });

  const when = `${dateLabel(booking.date)}, ${slotLabel(booking.slot)}`;
  notify([
    { to: booking.customerPhone, channel: "whatsapp", audience: "customer", bookingId: id, message: `✅ Booking ${id} confirmed for ${when}. Total ${inr(quote.total)}.${provider ? ` Your pro: ${provider.name}.` : ""}` },
    { to: booking.customerPhone, channel: "sms", audience: "customer", bookingId: id, message: `HomeServ: Booking ${id} confirmed for ${when}.` },
    ...(provider ? [{ to: provider.phone, channel: "whatsapp" as const, audience: "provider" as const, bookingId: id, message: `New job ${id}: ${items.map((i) => i.name).join(", ")} at ${booking.address.building}, ${booking.address.locality} — ${when}.` }] : []),
  ]);
  return booking;
}

export function getBooking(id: string) {
  return db().bookings.find((b) => b.id === id);
}

/** Public view of a booking: hides the end OTP until the job has started, and never exposes provider PINs. */
export function bookingView(b: Booking, viewer: "customer" | "provider" | "admin") {
  const d = db();
  const p = b.providerId ? d.providers.find((x) => x.id === b.providerId) : undefined;
  const provider = p && {
    id: p.id, name: p.name, speciality: p.speciality, rating: p.rating, totalJobs: p.totalJobs,
    experienceYears: p.experienceYears, aadhaarVerified: p.aadhaarVerified, policeVerified: p.policeVerified, avatarHue: p.avatarHue,
  };
  const review = b.reviewId ? d.reviews.find((r) => r.id === b.reviewId) : undefined;
  const { startOtp, endOtp, ...rest } = b;
  return {
    ...rest,
    provider,
    review,
    categoryName: categoryBySlug(b.category)?.shortName ?? b.category,
    startOtp: viewer === "provider" ? undefined : startOtp,
    endOtp: viewer === "provider" ? undefined : viewer === "admin" || b.status === "started" || b.status === "completed" ? endOtp : undefined,
  };
}
export type BookingView = ReturnType<typeof bookingView>;

const FLOW: BookingStatus[] = ["confirmed", "assigned", "on_way", "started", "completed"];

function pushStatus(b: Booking, status: BookingStatus, note?: string) {
  b.status = status;
  b.timeline.push({ status, at: new Date().toISOString(), note });
}

export function cancelBooking(id: string, by: "customer" | "admin", now = Date.now()) {
  return mutate((d) => {
    const b = d.bookings.find((x) => x.id === id);
    if (!b) throw new BookingError("Booking not found", 404);
    if (!["confirmed", "assigned", "on_way"].includes(b.status)) throw new BookingError("This booking can no longer be cancelled");
    const minsBefore = (slotEpoch(b.date, b.slot) - now) / 60000;
    const fee = by === "customer" && minsBefore < FREE_CANCEL_BEFORE_MIN ? LATE_CANCEL_FEE : 0;
    b.cancelFee = fee;
    if (b.paymentStatus === "paid") b.paymentStatus = "refunded";
    pushStatus(b, "cancelled", by === "admin" ? "Cancelled by HomeServ" : fee ? `Late cancellation fee ${inr(fee)}` : "Cancelled by customer");
    return b;
  });
}

export function rescheduleBooking(id: string, date: string, slot: number, now = Date.now()) {
  const b = getBooking(id);
  if (!b) throw new BookingError("Booking not found", 404);
  if (!["confirmed", "assigned"].includes(b.status)) throw new BookingError("This booking can no longer be rescheduled");
  if ((slotEpoch(b.date, b.slot) - now) / 60000 < FREE_CANCEL_BEFORE_MIN)
    throw new BookingError("Rescheduling closes 2 hours before the slot. Please contact support.");
  const { input, slots } = availabilityFor(b.category, date, bookingDuration(b), b.id);
  if (!slots.find((s) => s.slot === slot && s.available > 0)) throw new BookingError("That slot isn't available", 409);
  // Keep the same pro if they're free at the new time.
  const same = b.providerId ? pickProvider({ ...input, providers: input.providers.filter((p) => p.id === b.providerId) }, slot) : undefined;
  const provider = same || pickProvider(input, slot);
  return mutate((d) => {
    const x = d.bookings.find((y) => y.id === id)!;
    x.date = date;
    x.slot = slot;
    x.rescheduleCount++;
    x.providerId = provider?.id;
    x.status = provider ? "assigned" : "confirmed";
    x.timeline.push({ status: x.status, at: new Date().toISOString(), note: `Rescheduled to ${dateLabel(date)} ${slotLabel(slot)}` });
    return x;
  });
}

export function assignProvider(id: string, providerId: string) {
  return mutate((d) => {
    const b = d.bookings.find((x) => x.id === id);
    const p = d.providers.find((x) => x.id === providerId);
    if (!b || !p) throw new BookingError("Not found", 404);
    if (!["confirmed", "assigned"].includes(b.status)) throw new BookingError("Can only assign before the pro is on the way");
    b.providerId = p.id;
    pushStatus(b, "assigned", p.name);
    notify([
      { to: b.customerPhone, channel: "whatsapp", audience: "customer", bookingId: b.id, message: `👷 Meet your pro for ${b.id}: ${p.name} (⭐ ${p.rating}, ${p.experienceYears} yrs).` },
      { to: p.phone, channel: "whatsapp", audience: "provider", bookingId: b.id, message: `New job ${b.id} on ${dateLabel(b.date)} at ${slotLabel(b.slot)} — ${b.address.locality}.` },
    ]);
    return b;
  });
}

/** Provider-driven transitions. OTPs are required to start and to complete. */
export function advanceBooking(id: string, action: "on_way" | "start" | "complete" | "mark_paid", opts: { otp?: string; providerId?: string; admin?: boolean } = {}) {
  return mutate((d) => {
    const b = d.bookings.find((x) => x.id === id);
    if (!b) throw new BookingError("Booking not found", 404);
    if (!opts.admin && b.providerId !== opts.providerId) throw new BookingError("Not your job", 403);
    const p = d.providers.find((x) => x.id === b.providerId);
    switch (action) {
      case "on_way":
        if (b.status !== "assigned") throw new BookingError("Job must be assigned first");
        pushStatus(b, "on_way", "ETA ~15 mins");
        notify([{ to: b.customerPhone, channel: "whatsapp", audience: "customer", bookingId: id, message: `🚗 ${p?.name ?? "Your pro"} is on the way for ${id}. Keep your start OTP ready.` }]);
        break;
      case "start":
        if (b.status !== "on_way" && b.status !== "assigned") throw new BookingError("Job can't be started now");
        if (opts.otp !== b.startOtp) throw new BookingError("Incorrect start OTP");
        pushStatus(b, "started", "Start OTP verified");
        notify([{ to: b.customerPhone, channel: "whatsapp", audience: "customer", bookingId: id, message: `🔨 Job ${id} started. Share the end OTP only once you're satisfied.` }]);
        break;
      case "complete":
        if (b.status !== "started") throw new BookingError("Job hasn't started");
        if (opts.otp !== b.endOtp) throw new BookingError("Incorrect end OTP");
        pushStatus(b, "completed", "End OTP verified");
        if (p) p.totalJobs++;
        notify([
          { to: b.customerPhone, channel: "whatsapp", audience: "customer", bookingId: id, message: `🎉 Job ${id} completed. ${b.paymentStatus === "paid" ? "Already paid online." : `Pay ${inr(b.quote.total)} via UPI link.`} Please rate your experience.` },
          ...(b.customerEmail ? [{ to: b.customerEmail, channel: "email" as const, audience: "customer" as const, bookingId: id, message: `Invoice for ${id}: ${inr(b.quote.total)}` }] : []),
        ]);
        break;
      case "mark_paid":
        if (b.status !== "completed") throw new BookingError("Collect payment after completion");
        b.paymentStatus = "paid";
        b.paymentRef = b.paymentRef || "CASH/UPI-" + Date.now().toString(36).toUpperCase();
        if (p) notify([{ to: p.phone, channel: "whatsapp", audience: "provider", bookingId: id, message: `💰 Payment recorded for ${id}.` }]);
        break;
    }
    return b;
  });
}

export function addReview(bookingId: string, phone: string, rating: number, text: string): Review {
  return mutate((d) => {
    const b = d.bookings.find((x) => x.id === bookingId);
    if (!b || b.customerPhone !== phone) throw new BookingError("Booking not found", 404);
    if (b.status !== "completed") throw new BookingError("You can review after the job is completed");
    if (b.reviewId) throw new BookingError("You've already reviewed this booking");
    const r: Review = {
      id: "r-" + b.id,
      bookingId: b.id,
      customerName: b.customerName.split(" ")[0] + (b.customerName.split(" ")[1] ? ` ${b.customerName.split(" ")[1][0]}.` : ""),
      providerId: b.providerId,
      serviceId: b.items[0]?.serviceId,
      category: b.category,
      serviceName: b.items.map((i) => i.name.replace(/^PACKAGE: /, "")).join(" + "),
      rating: Math.max(1, Math.min(5, Math.round(rating))),
      text: text.trim().slice(0, 600),
      createdAt: new Date().toISOString(),
    };
    d.reviews.unshift(r);
    b.reviewId = r.id;
    const p = d.providers.find((x) => x.id === b.providerId);
    if (p) {
      // Blend into the running average (seeded rating represents past jobs).
      p.rating = Math.round(((p.rating * p.totalJobs + r.rating) / (p.totalJobs + 1)) * 10) / 10;
      notify([{ to: p.phone, channel: "whatsapp", audience: "provider", bookingId: b.id, message: `⭐ New ${r.rating}-star review for ${b.id}.` }]);
    }
    return r;
  });
}
