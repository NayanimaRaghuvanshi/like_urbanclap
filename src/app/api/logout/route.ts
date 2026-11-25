import { handle, ok } from "@/lib/api";
import { logout } from "@/lib/session";

export const POST = () => handle(() => (logout(), ok({ ok: true })));
