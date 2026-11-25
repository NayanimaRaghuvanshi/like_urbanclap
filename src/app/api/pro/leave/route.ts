import { z } from "zod";
import { body, fail, handle, ok } from "@/lib/api";
import { mutate } from "@/lib/db";
import { currentProId } from "@/lib/session";

const S = z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) });

/** Toggle a leave day for the logged-in provider. */
export const POST = (req: Request) =>
  handle(async () => {
    const providerId = currentProId();
    if (!providerId) return fail("Please log in", 401);
    const { date } = await body(req, S);
    mutate((d) => {
      const p = d.providers.find((x) => x.id === providerId)!;
      p.leaveDates = p.leaveDates.includes(date) ? p.leaveDates.filter((x) => x !== date) : [...p.leaveDates, date];
    });
    return ok({ ok: true });
  });
