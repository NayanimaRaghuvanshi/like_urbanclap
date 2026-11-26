import { test } from "node:test";
import assert from "node:assert/strict";
import { botReply, isOpen, type BotData } from "../src/lib/whatsappBot.ts";
import { SEED_SERVICES } from "../src/lib/catalog.ts";
import { TEST_PROVIDERS } from "./fixtures.ts";
import type { Booking } from "../src/lib/types.ts";

const booking = {
  id: "HS-2026-1126-0007", customerPhone: "+919876543210", category: "plumber", date: "2026-11-26", slot: 1020,
  status: "assigned", providerId: "pro-a", items: [{ serviceId: "plb-tap", name: "Tap Repair / Replacement", price: 99, qty: 1, durationMin: 30 }],
} as unknown as Booking;
const d: BotData = { siteUrl: "https://example.com", supportPhone: "+916394014604", services: SEED_SERVICES, bookings: [booking], providers: TEST_PROVIDERS };
const noon = Date.UTC(2026, 10, 26, 6, 30); // 12:00 IST
const at = (text: string, phone = "+919876543210", type = "text") => botReply({ text, type, phone, name: "Priya Sharma", now: noon }, d);

test("greets with menu on hello / unknown text", () => {
  const r = at("hi");
  assert.match(r.text, /Namaste Priya/);
  assert.match(r.text, /1️⃣ 🔧 Plumber/);
  assert.match(r.text, /9️⃣ 🙋 Talk to our team/);
  assert.match(r.text, /https:\/\/example.com\/services/);
  assert.match(at("asdfgh").text, /Reply with a number/);
});

test("numbers and keywords open a category with prices and link", () => {
  assert.match(at("1").text, /Plumber Services[\s\S]*₹[\s\S]*example.com\/services\/plumber/);
  assert.match(at("4").text, /PVC Panel[\s\S]*Measurement Visit[\s\S]*₹49/);
  assert.match(at("my ceiling fan is not working").text, /Electrician/);
  assert.match(at("need pvc panels for bedroom").text, /PVC Panel/);
  assert.match(at("kitchen tap leaking").text, /Plumber/);
});

test("tracking only reveals the sender's own bookings", () => {
  assert.match(at("8").text, /HS-2026-1126-0007[\s\S]*Test Plumber A[\s\S]*track\/HS-2026-1126-0007/);
  assert.match(at("status of hs-2026-1126-0007?").text, /Professional assigned/);
  assert.match(at("HS-2026-1126-0007", "+919999999999").text, /couldn't find/);
  assert.match(at("track", "+919999999999").text, /no upcoming bookings/);
});

test("handoff, hours, non-text and night message", () => {
  const h = at("9");
  assert.equal(h.handoff, true);
  assert.match(h.text, /\+91 63940 14604/);
  assert.match(at("", "+91", "image").text, /Thanks for the photo/);
  assert.equal(isOpen(Date.UTC(2026, 10, 26, 21, 0)), false); // 2:30 AM IST
  assert.equal(isOpen(Date.UTC(2026, 10, 26, 18, 45)), true); // 12:15 AM IST
  const night = botReply({ text: "hello", type: "text", phone: "+91", now: Date.UTC(2026, 10, 26, 21, 0) }, d);
  assert.match(night.text, /closed right now/);
});
