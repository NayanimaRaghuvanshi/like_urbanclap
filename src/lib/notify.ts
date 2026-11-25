import "server-only";
import { mutate, uid } from "./db";
import type { NotificationLog } from "./types";

/**
 * Notification adapter. Messages are logged (visible in Admin → Notifications).
 * Plug a WhatsApp BSP (Gupshup / Interakt) and SMS provider (MSG91 / Twilio) in `deliver`.
 */
async function deliver(n: NotificationLog) {
  if (process.env.NODE_ENV !== "production") console.log(`[notify:${n.channel}] → ${n.to}: ${n.message}`);
}

export function notify(entries: Omit<NotificationLog, "id" | "at">[]) {
  const logs = entries.map((e) => ({ ...e, id: uid("n_"), at: new Date().toISOString() }));
  mutate((d) => {
    d.notifications.unshift(...logs);
    d.notifications = d.notifications.slice(0, 500);
  });
  logs.forEach((l) => void deliver(l));
}
