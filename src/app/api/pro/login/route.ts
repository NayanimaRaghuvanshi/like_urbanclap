import { z } from "zod";
import { body, fail, handle, normalizePhone, ok } from "@/lib/api";
import { db } from "@/lib/db";
import { proLogin } from "@/lib/session";

const S = z.object({ phone: z.string(), pin: z.string().regex(/^\d{4}$/) });

export const POST = (req: Request) =>
  handle(async () => {
    const b = await body(req, S);
    const phone = normalizePhone(b.phone);
    const p = db().providers.find((x) => x.phone === phone && x.pin === b.pin && x.isActive);
    if (!p) return fail("Invalid phone or PIN", 401);
    proLogin(p.id);
    return ok({ ok: true });
  });
