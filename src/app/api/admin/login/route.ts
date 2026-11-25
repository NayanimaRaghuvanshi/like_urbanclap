import { z } from "zod";
import { body, fail, handle, ok } from "@/lib/api";
import { adminLogin, adminLogout } from "@/lib/session";

export const POST = (req: Request) =>
  handle(async () => {
    const { password } = await body(req, z.object({ password: z.string().max(200) }));
    return adminLogin(password) ? ok({ ok: true }) : fail("Wrong password", 401);
  });

export const DELETE = () => handle(() => (adminLogout(), ok({ ok: true })));
