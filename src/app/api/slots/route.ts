import { handle, fail, ok } from "@/lib/api";
import { availabilityFor } from "@/lib/bookings";
import { categoryBySlug } from "@/lib/catalog";
import { bookableDates } from "@/lib/slots";
import type { CategorySlug } from "@/lib/types";

export const dynamic = "force-dynamic";

export const GET = (req: Request) =>
  handle(() => {
    const u = new URL(req.url);
    const category = u.searchParams.get("category") as CategorySlug;
    const duration = Math.max(30, Number(u.searchParams.get("duration") || 30));
    const exclude = u.searchParams.get("exclude") || undefined;
    if (!categoryBySlug(category)) return fail("Unknown category");
    const dates = bookableDates();
    const date = u.searchParams.get("date") || dates[0];
    if (!dates.includes(date)) return fail("Date outside booking window");
    const { slots } = availabilityFor(category, date, duration, exclude);
    const days = dates.map((d) => ({ date: d, open: availabilityFor(category, d, duration, exclude).slots.filter((s) => s.available > 0).length }));
    return ok({ date, dates: days, slots });
  });
