import { CATEGORIES } from "./catalog.ts";
import { dateLabel, inr, slotLabel } from "./format.ts";
import { istMinutes } from "./slots.ts";
import type { Booking, Provider, Service } from "./types.ts";

/**
 * WhatsApp auto-reply brain. Pure function: give it the incoming message and data, get the reply text.
 * Menu: 1–7 = service categories, 8 = track booking, 9 = talk to a person.
 */
export interface BotInput {
  text: string;
  /** WhatsApp message type: text, image, audio, location, button, interactive … */
  type: string;
  /** Sender as +91XXXXXXXXXX */
  phone: string;
  name?: string;
  now?: number;
}

export interface BotData {
  siteUrl: string;
  supportPhone: string;
  services: Service[];
  bookings: Booking[];
  providers: Provider[];
}

export interface BotReply {
  text: string;
  /** Customer asked for a person — pause auto-replies for a while. */
  handoff?: boolean;
}

const KEYWORDS: Record<string, string[]> = {
  plumber: ["plumb", "tap", "leak", "pipe", "toilet", "flush", "drain", "tank", "basin", "sink", "geyser water", "nal"],
  electrician: ["electric", "fan", "switch", "light", "wiring", "mcb", "fuse", "inverter", "bijli", "geyser", "tv mount"],
  "wall-designer": ["wall design", "texture", "stencil", "wallpaper", "accent"],
  "pvc-panels": ["pvc", "wpc", "panel", "fluted", "charcoal", "false ceiling", "ceiling"],
  carpenter: ["carpent", "lock", "door", "hinge", "drawer", "assembl", "curtain", "shelf"],
  furniture: ["furniture", "wardrobe", "kitchen", "tv unit", "bed", "almirah"],
  painting: ["paint", "waterproof", "polish"],
};

const fmtPhone = (p: string) => p.replace(/^\+91(\d{5})(\d{5})$/, "+91 $1 $2");

export function isOpen(now = Date.now()) {
  const m = istMinutes(now);
  return m >= 9 * 60 || m < 30; // 9:00 AM – 12:30 AM
}

function menu(d: BotData) {
  return [
    "Reply with a number:",
    ...CATEGORIES.map((c, i) => `${i + 1}️⃣ ${c.icon} ${c.shortName}`),
    "8️⃣ 📦 Track my booking",
    "9️⃣ 🙋 Talk to our team",
    "",
    `📅 Book online in 2 minutes: ${d.siteUrl}/services`,
  ].join("\n");
}

function categoryReply(slug: string, d: BotData) {
  const c = CATEGORIES.find((x) => x.slug === slug)!;
  const list = d.services.filter((s) => s.category === slug && s.isActive);
  const consult = list.find((s) => s.isConsultation);
  const top = list.filter((s) => !s.isConsultation).sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 4);
  const lines = [`${c.icon} *${c.name}*`, c.tagline, ""];
  if (c.mode === "consultation" && consult)
    lines.push(`Start with a *${consult.name}* — ${inr(consult.price)} (adjusted against your order).`, "");
  if (top.length) lines.push("Popular:", ...top.map((s) => `• ${s.name.replace(/^PACKAGE: /, "📦 ")} — ${inr(s.price)}${s.unit ?? ""}`), "");
  lines.push(`🛡️ ${c.warranty}`, `👉 See all & book: ${d.siteUrl}/services/${slug}`, "", "Reply *0* for the main menu.");
  return lines.join("\n");
}

const STATUS: Record<string, string> = {
  confirmed: "✅ Confirmed — we're assigning a professional",
  assigned: "👷 Professional assigned",
  on_way: "🚗 Professional is on the way",
  started: "🔨 Job in progress",
  completed: "🎉 Completed",
  cancelled: "❌ Cancelled",
};

function bookingLine(b: Booking, d: BotData) {
  const pro = b.providerId ? d.providers.find((p) => p.id === b.providerId) : undefined;
  return [
    `*${b.id}* — ${b.items.map((i) => i.name).join(", ")}`,
    `📅 ${dateLabel(b.date)}, ${slotLabel(b.slot)}`,
    `Status: ${STATUS[b.status]}`,
    ...(pro && b.status !== "cancelled" ? [`Pro: ${pro.name}${pro.rating > 0 ? ` ⭐ ${pro.rating}` : ""}`] : []),
    `Track: ${d.siteUrl}/track/${b.id}`,
  ].join("\n");
}

function trackReply(input: BotInput, d: BotData, id?: string) {
  if (id) {
    const b = d.bookings.find((x) => x.id === id);
    // Only reveal details to the number that made the booking.
    if (!b || b.customerPhone !== input.phone)
      return `I couldn't find booking *${id}* for this WhatsApp number. Open ${d.siteUrl}/my-bookings and log in with the number you booked with.`;
    return bookingLine(b, d);
  }
  const mine = d.bookings.filter((b) => b.customerPhone === input.phone && !["completed", "cancelled"].includes(b.status));
  if (!mine.length)
    return `You have no upcoming bookings from this number.\n\nBooked with a different number? Send the booking ID (like HS-2026-1125-0001) or open ${d.siteUrl}/my-bookings\n\nReply *0* for the menu.`;
  return ["Your upcoming bookings:", "", ...mine.slice(0, 3).map((b) => bookingLine(b, d))].join("\n\n");
}

export function botReply(input: BotInput, d: BotData): BotReply {
  const now = input.now ?? Date.now();
  const raw = (input.text || "").trim();
  const t = raw.toLowerCase();
  const first = input.name?.split(" ")[0];
  const hello = `Namaste${first ? " " + first : ""} 🙏 Welcome to *HomeServ*!\nPlumber • Electrician • PVC Panels • Wall Design • Carpenter • Furniture • Painting`;
  const closed = isOpen(now) ? "" : "\n\n🌙 We're closed right now (open 9 AM – 12:30 AM). You can still book online and our team will reply in the morning.";

  if (input.type !== "text" && input.type !== "button" && input.type !== "interactive") {
    const what = { image: "photo", video: "video", audio: "voice note", document: "document", location: "location" }[input.type] ?? "message";
    return { text: `Thanks for the ${what}! 👍 Our team will take a look.${closed}\n\n${menu(d)}` };
  }

  const id = raw.toUpperCase().match(/HS-\d{4}-\d{4}-\d{4}/)?.[0];
  if (id) return { text: trackReply(input, d, id) };

  const num = t.match(/^\s*(\d)\s*[.)️⃣]*\s*$/)?.[1];
  if (num === "0") return { text: `${hello}\n\n${menu(d)}` };
  if (num && Number(num) >= 1 && Number(num) <= CATEGORIES.length) return { text: categoryReply(CATEGORIES[Number(num) - 1].slug, d) };
  if (num === "8" || /\b(track|status|my booking|order)\b/.test(t)) return { text: trackReply(input, d) };
  if (num === "9" || /\b(agent|human|person|team|talk|call me|executive|support|complain)/.test(t))
    return {
      handoff: true,
      text: `🙋 Sure — a team member will reply here shortly${isOpen(now) ? "" : " when we open at 9 AM"}.\nFor anything urgent, call ${fmtPhone(d.supportPhone)}.`,
    };
  if (/\b(price|rate|cost|charge|kitna|kitne)/.test(t)) return { text: `💰 Full rate card: ${d.siteUrl}/services#rate-card\n\n${menu(d)}` };
  if (/\b(time|timing|open|hours|close)\b/.test(t)) return { text: `🕐 We're open *9 AM – 12:30 AM*, 7 days a week. Same-day slots are usually available.\n\n${menu(d)}` };
  if (/\b(book|booking|appointment|slot)\b/.test(t)) return { text: `📅 Book in 2 minutes: ${d.siteUrl}/services\nPick a service, choose a slot, and pay after the job.\n\n${menu(d)}` };
  if (/\b(thank|thanks|thx|ok|okay|great|👍)/.test(t) && t.length < 25) return { text: "You're welcome! 😊 Reply *0* any time for the menu." };

  for (const [slug, words] of Object.entries(KEYWORDS)) if (words.some((w) => t.includes(w))) return { text: categoryReply(slug, d) };

  return { text: `${hello}${closed}\n\n${menu(d)}` };
}
