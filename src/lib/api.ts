import "server-only";
import { NextResponse } from "next/server";
import { ZodError, type ZodType, type ZodTypeDef } from "zod";
import { BookingError } from "./bookings";

export const ok = (data: unknown, status = 200) => NextResponse.json(data, { status });
export const fail = (error: string, status = 400) => NextResponse.json({ error }, { status });

export async function handle(fn: () => Promise<Response> | Response): Promise<Response> {
  try {
    return await fn();
  } catch (e) {
    if (e instanceof ZodError) return fail(e.issues[0]?.message || "Invalid input", 422);
    if (e instanceof BookingError) return fail(e.message, e.status);
    console.error(e);
    return fail("Something went wrong. Please try again.", 500);
  }
}

export async function body<T>(req: Request, schema: ZodType<T, ZodTypeDef, unknown>): Promise<T> {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    throw new BookingError("Invalid JSON body");
  }
  return schema.parse(json);
}

export const normalizePhone = (p: string) => {
  const digits = p.replace(/\D/g, "").replace(/^(91|0)(?=\d{10}$)/, "");
  return /^[6-9]\d{9}$/.test(digits) ? "+91" + digits : null;
};
