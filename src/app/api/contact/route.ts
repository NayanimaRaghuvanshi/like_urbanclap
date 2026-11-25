import { z } from "zod";
import { body, handle, ok } from "@/lib/api";
import { mutate } from "@/lib/db";

const S = z.object({ name: z.string().trim().min(2, "Enter your name").max(80), phone: z.string().trim().min(10, "Enter a valid phone").max(15), message: z.string().trim().min(5, "Tell us a little more").max(1000) });

export const POST = (req: Request) =>
  handle(async () => {
    const b = await body(req, S);
    mutate((d) => void d.contacts.unshift({ ...b, at: new Date().toISOString() }));
    return ok({ ok: true });
  });
