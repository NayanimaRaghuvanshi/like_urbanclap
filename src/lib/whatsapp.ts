import "server-only";
import crypto from "node:crypto";

/**
 * WhatsApp Cloud API (Meta) client.
 * Env: WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_VERIFY_TOKEN, WHATSAPP_APP_SECRET (recommended).
 */
const API = process.env.WHATSAPP_API_BASE || "https://graph.facebook.com/v21.0";

export const waConfigured = () => Boolean(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);

export async function sendWhatsAppText(toWaId: string, body: string) {
  const res = await fetch(`${API}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ messaging_product: "whatsapp", recipient_type: "individual", to: toWaId, type: "text", text: { body: body.slice(0, 4096), preview_url: true } }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`WhatsApp send failed (${res.status}): ${(await res.text()).slice(0, 300)}`);
}

/** Verify Meta's X-Hub-Signature-256 header. Skipped (returns true) only if no app secret is configured. */
export function validSignature(rawBody: string, header: string | null): boolean {
  const secret = process.env.WHATSAPP_APP_SECRET;
  if (!secret) return true;
  if (!header?.startsWith("sha256=")) return false;
  const expected = "sha256=" + crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return header.length === expected.length && crypto.timingSafeEqual(Buffer.from(header), Buffer.from(expected));
}

export interface IncomingMessage {
  id: string;
  from: string; // wa_id, e.g. 919876543210
  type: string;
  text: string;
  name?: string;
}

/** Pull messages out of a Cloud API webhook payload (ignores delivery/read status callbacks). */
export function parseWebhook(payload: unknown): IncomingMessage[] {
  const out: IncomingMessage[] = [];
  const entries = (payload as { entry?: unknown[] })?.entry ?? [];
  for (const e of entries as { changes?: { value?: Record<string, unknown> }[] }[]) {
    for (const ch of e.changes ?? []) {
      const v = ch.value ?? {};
      const contacts = (v.contacts as { wa_id: string; profile?: { name?: string } }[]) ?? [];
      for (const m of (v.messages as Record<string, unknown>[]) ?? []) {
        const type = String(m.type ?? "unknown");
        const interactive = m.interactive as { button_reply?: { title?: string }; list_reply?: { title?: string } } | undefined;
        const text =
          (m.text as { body?: string })?.body ??
          (m.button as { text?: string })?.text ??
          interactive?.button_reply?.title ??
          interactive?.list_reply?.title ??
          (m.image as { caption?: string })?.caption ??
          "";
        const from = String(m.from ?? "");
        out.push({ id: String(m.id ?? ""), from, type, text, name: contacts.find((c) => c.wa_id === from)?.profile?.name });
      }
    }
  }
  return out;
}
