import { z } from "zod";
import { body, handle, ok } from "@/lib/api";
import { checkServiceable } from "@/lib/geo";

const S = z.object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) });

export const POST = (req: Request) => handle(async () => ok(checkServiceable(await body(req, S))));
