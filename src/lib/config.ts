const env = (k: string, d: string) => (typeof process !== "undefined" && process.env[k]) || d;

export const BASE = {
  lat: Number(env("NEXT_PUBLIC_BASE_LAT", "12.9116")),
  lng: Number(env("NEXT_PUBLIC_BASE_LNG", "77.6389")),
  name: env("NEXT_PUBLIC_BASE_NAME", "HSR Layout, Bengaluru"),
  city: "bangalore",
  cityName: "Bengaluru",
};

export const SERVICE_RADIUS_M = Number(env("NEXT_PUBLIC_SERVICE_RADIUS_M", "2000"));
export const SUPPORT_PHONE = env("NEXT_PUBLIC_SUPPORT_PHONE", "+919876543210");
export const WHATSAPP_NUMBER = env("NEXT_PUBLIC_WHATSAPP_NUMBER", "919876543210");
export const SUPPORT_EMAIL = "hello@homeserv.in";

/** Operating window: 9:00 AM → 12:30 AM next day. Slots are 30-minute starts. */
export const OPEN_MIN = 9 * 60; // 9:00 AM
export const CLOSE_MIN = 24 * 60 + 30; // 12:30 AM (next day)
export const SLOT_MIN = 30;
export const MIN_ADVANCE_MIN = 60;
export const MAX_ADVANCE_DAYS = 7;
export const FREE_CANCEL_BEFORE_MIN = 120;
export const LATE_CANCEL_FEE = 50;
/** A single booking never blocks a provider for more than this many minutes of the day. */
export const MAX_OCCUPANCY_MIN = 240;

export const GST_RATE = 0.18;
export const VISITING_CHARGE = 49;
export const VISITING_WAIVER_MIN = 499;
export const AUTO_DISCOUNT = { minOrder: 500, percent: 10, maxOff: 200 };

export const TZ = "Asia/Kolkata";
