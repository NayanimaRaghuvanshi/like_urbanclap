import { NextResponse } from "next/server";
import { SUPPORT_PHONE } from "@/lib/config";
import { db, flush, mutate, syncDb } from "@/lib/db";
import { notify } from "@/lib/notify";
import { parseWebhook, sendWhatsAppText, validSignature, waConfigured } from "@/lib/whatsapp";
import { botReply } from "@/lib/whatsappBot";

export const dynamic = "force-dynamic";

const HANDOFF_PAUSE_MS = 6 * 60 * 60 * 1000; // after "talk to a person", stay quiet for 6 hours

/** Meta calls this once when you save the webhook URL in the App dashboard. */
export function GET(req: Request) {
  const u = new URL(req.url);
  const ok = u.searchParams.get("hub.mode") === "subscribe" && !!process.env.WHATSAPP_VERIFY_TOKEN && u.searchParams.get("hub.verify_token") === process.env.WHATSAPP_VERIFY_TOKEN;
  return ok ? new Response(u.searchParams.get("hub.challenge") ?? "", { status: 200 }) : new Response("Forbidden", { status: 403 });
}

/** Incoming WhatsApp messages → instant auto-reply. Always answers 200 so Meta doesn't retry endlessly. */
export async function POST(req: Request) {
  const raw = await req.text();
  if (!validSignature(raw, req.headers.get("x-hub-signature-256"))) return new Response("Bad signature", { status: 401 });
  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: true });
  }
  const messages = parseWebhook(payload);
  if (!messages.length) return NextResponse.json({ ok: true });
  if (!waConfigured()) {
    console.warn("[whatsapp] message received but WHATSAPP_ACCESS_TOKEN / WHATSAPP_PHONE_NUMBER_ID are not set");
    return NextResponse.json({ ok: true });
  }

  try {
    await syncDb();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;
    for (const m of messages) {
      const d = db();
      if (!m.id || d.waSeen?.includes(m.id)) continue; // duplicate delivery
      mutate((x) => void (x.waSeen = [m.id, ...(x.waSeen ?? [])].slice(0, 300)));
      const phone = "+" + m.from.replace(/\D/g, "");
      notify([{ to: "HomeServ", channel: "whatsapp", audience: "customer", message: `⬅️ ${m.name ?? phone} (${phone}): ${m.text || `[${m.type}]`}` }]);

      const muted = (d.waMuted?.[phone] ?? 0) > Date.now();
      if (muted && !/^\s*0\s*$/.test(m.text)) continue; // a person is handling this chat; "0" brings the bot back
      if (muted) mutate((x) => void delete x.waMuted?.[phone]);

      const reply = botReply({ text: m.text, type: m.type, phone, name: m.name }, { siteUrl, supportPhone: SUPPORT_PHONE, services: d.services, bookings: d.bookings, providers: d.providers });
      try {
        await sendWhatsAppText(m.from, reply.text);
        notify([{ to: phone, channel: "whatsapp", audience: "customer", message: `🤖 ${reply.text.split("\n")[0]}` }]);
      } catch (e) {
        console.error("[whatsapp]", (e as Error).message);
      }
      if (reply.handoff) {
        mutate((x) => void ((x.waMuted ??= {})[phone] = Date.now() + HANDOFF_PAUSE_MS));
        notify([{ to: "HomeServ team", channel: "whatsapp", audience: "provider", message: `🙋 ${m.name ?? phone} (${phone}) wants to talk to a person on WhatsApp` }]);
      }
    }
    await flush();
  } catch (e) {
    console.error("[whatsapp] webhook error", e);
  }
  return NextResponse.json({ ok: true });
}
