import { handle, ok } from "@/lib/api";
import { db } from "@/lib/db";
import { currentPhone } from "@/lib/session";

export const dynamic = "force-dynamic";

export const GET = () =>
  handle(() => {
    const phone = currentPhone();
    const c = phone ? db().customers.find((x) => x.phone === phone) : undefined;
    return ok({ phone: phone ?? null, name: c?.name ?? null, email: c?.email ?? null });
  });
