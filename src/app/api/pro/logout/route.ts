import { handle, ok } from "@/lib/api";
import { proLogout } from "@/lib/session";

export const POST = () => handle(() => (proLogout(), ok({ ok: true })));
