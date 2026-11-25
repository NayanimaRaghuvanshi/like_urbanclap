export const inr = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");

export function slotLabel(min: number): string {
  const m = ((min % 1440) + 1440) % 1440;
  let h = Math.floor(m / 60);
  const mm = m % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${mm.toString().padStart(2, "0")} ${ampm}`;
}

export function slotShort(min: number): string {
  const m = ((min % 1440) + 1440) % 1440;
  let h = Math.floor(m / 60);
  const mm = m % 60;
  h = h % 12 || 12;
  return `${h}:${mm.toString().padStart(2, "0")}${min >= 1440 ? " AM" : ""}`;
}

export function dateLabel(date: string, opts: Intl.DateTimeFormatOptions = { weekday: "short", day: "numeric", month: "short", year: "numeric" }) {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-IN", { ...opts, timeZone: "UTC" });
}

export function relTime(iso: string, now = Date.now()): string {
  const diff = Math.max(0, now - new Date(iso).getTime());
  const day = 86400000;
  if (diff < 3600000) return `${Math.max(1, Math.round(diff / 60000))} mins ago`;
  if (diff < day) return `${Math.round(diff / 3600000)} hrs ago`;
  const d = Math.round(diff / day);
  if (d < 7) return d === 1 ? "1 day ago" : `${d} days ago`;
  if (d < 30) return Math.round(d / 7) === 1 ? "1 week ago" : `${Math.round(d / 7)} weeks ago`;
  return new Date(iso).toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}

export function durationLabel(min: number): string {
  if (min < 60) return `${min} mins`;
  const h = min / 60;
  if (h >= 24) return `${Math.round(h / 24)} days`;
  return Number.isInteger(h) ? `${h} hr${h > 1 ? "s" : ""}` : `${h.toFixed(1)} hrs`;
}

export function shortName(full: string): string {
  const parts = full.trim().split(/\s+/);
  return parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1][0]}.` : parts[0];
}
