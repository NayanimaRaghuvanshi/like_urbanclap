import "server-only";

/**
 * OTP delivery.
 *  - "sms":  TWOFACTOR_API_KEY set → real SMS via 2Factor.in (India, DLT handled by 2Factor).
 *  - "dev":  OTP_DEV_MODE=true → code returned to the browser. Local testing only — never on a public site.
 *  - "none": no provider → customers book without OTP; bookings are visible only on the device that made them.
 */
export type OtpMode = "sms" | "dev" | "none";

export function otpMode(): OtpMode {
  if (process.env.TWOFACTOR_API_KEY) return "sms";
  if (process.env.OTP_DEV_MODE === "true") return "dev";
  return "none";
}

export async function sendOtpSms(phone: string, code: string) {
  const key = process.env.TWOFACTOR_API_KEY!;
  const base = process.env.TWOFACTOR_API_BASE || "https://2factor.in/API/V1";
  const template = process.env.TWOFACTOR_TEMPLATE ? `/${encodeURIComponent(process.env.TWOFACTOR_TEMPLATE)}` : "";
  const res = await fetch(`${base}/${encodeURIComponent(key)}/SMS/${phone.replace(/\D/g, "")}/${code}${template}`, { cache: "no-store" });
  const json = (await res.json().catch(() => ({}))) as { Status?: string; Details?: string };
  if (!res.ok || json.Status !== "Success") throw new Error(`SMS failed: ${json.Details ?? res.status}`);
}
