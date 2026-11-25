import { z } from "zod";
import { body, fail, handle, normalizePhone, ok } from "@/lib/api";
import { advanceBooking, assignProvider, cancelBooking } from "@/lib/bookings";
import { mutate, resetDb } from "@/lib/db";
import { isAdmin } from "@/lib/session";

const cat = z.enum(["plumber", "electrician", "wall-designer", "pvc-panels", "carpenter", "furniture", "painting"]);

const Op = z.discriminatedUnion("op", [
  z.object({ op: z.literal("assign"), bookingId: z.string(), providerId: z.string() }),
  z.object({ op: z.literal("cancel"), bookingId: z.string() }),
  z.object({ op: z.literal("advance"), bookingId: z.string(), action: z.enum(["on_way", "start", "complete", "mark_paid"]), otp: z.string().optional() }),
  z.object({
    op: z.literal("upsertService"),
    service: z.object({
      id: z.string().regex(/^[a-z0-9-]{3,40}$/, "ID: lowercase letters, numbers, dashes"),
      category: cat,
      sub: z.string().min(1).max(60),
      name: z.string().min(2).max(120),
      description: z.string().max(400).default(""),
      price: z.number().min(0).max(1_000_000),
      mrp: z.number().min(0).optional(),
      unit: z.string().max(20).optional(),
      durationMin: z.number().int().min(15).max(1440),
      rating: z.number().min(0).max(5).default(0),
      reviewCount: z.number().int().min(0).default(0),
      inclusions: z.array(z.string().max(120)).max(8).default([]),
      isPackage: z.boolean().optional(),
      isConsultation: z.boolean().optional(),
      isActive: z.boolean(),
    }),
  }),
  z.object({ op: z.literal("deleteService"), id: z.string() }),
  z.object({
    op: z.literal("upsertProvider"),
    provider: z.object({
      id: z.string().regex(/^[a-z0-9-]{3,40}$/),
      name: z.string().min(2).max(80),
      phone: z.string(),
      pin: z.string().regex(/^\d{4}$/),
      categories: z.array(cat).min(1),
      speciality: z.string().max(100),
      experienceYears: z.number().int().min(0).max(60),
      aadhaarVerified: z.boolean(),
      policeVerified: z.boolean(),
      isActive: z.boolean(),
    }),
  }),
  z.object({ op: z.literal("capacity"), category: cat, value: z.number().int().min(0).max(50) }),
  z.object({ op: z.literal("toggleBlock"), key: z.string().regex(/^\d{4}-\d{2}-\d{2}\|(\*|\d+)$/) }),
  z.object({ op: z.literal("review"), id: z.string(), hidden: z.boolean().optional(), flagged: z.boolean().optional(), adminReply: z.string().max(400).optional() }),
  z.object({ op: z.literal("upsertPromo"), promo: z.object({ code: z.string().regex(/^[A-Z0-9]{3,20}$/, "Code: 3–20 uppercase letters/numbers"), percent: z.number().min(1).max(90), maxOff: z.number().min(1), minOrder: z.number().min(0), active: z.boolean() }) }),
  z.object({ op: z.literal("deletePromo"), code: z.string() }),
  z.object({ op: z.literal("reset") }),
]);

export const POST = (req: Request) =>
  handle(async () => {
    if (!isAdmin()) return fail("Admin login required", 401);
    const o = await body(req, Op);
    switch (o.op) {
      case "assign":
        assignProvider(o.bookingId, o.providerId);
        break;
      case "cancel":
        cancelBooking(o.bookingId, "admin");
        break;
      case "advance":
        advanceBooking(o.bookingId, o.action, { otp: o.otp, admin: true });
        break;
      case "upsertService":
        mutate((d) => {
          const i = d.services.findIndex((s) => s.id === o.service.id);
          if (i >= 0) d.services[i] = { ...d.services[i], ...o.service };
          else d.services.push(o.service);
        });
        break;
      case "deleteService":
        mutate((d) => void (d.services = d.services.filter((s) => s.id !== o.id)));
        break;
      case "upsertProvider": {
        const phone = normalizePhone(o.provider.phone);
        if (!phone) return fail("Invalid provider phone", 422);
        mutate((d) => {
          const i = d.providers.findIndex((p) => p.id === o.provider.id);
          if (i >= 0) d.providers[i] = { ...d.providers[i], ...o.provider, phone };
          else
            d.providers.push({
              ...o.provider, phone, joined: new Date().toISOString().slice(0, 7), rating: 0, totalJobs: 0,
              servicesOffered: [], certifications: [], gallery: [], leaveDates: [], avatarHue: Math.floor(Math.random() * 360),
            });
        });
        break;
      }
      case "capacity":
        mutate((d) => void (d.settings.slotCapacity[o.category] = o.value || undefined));
        break;
      case "toggleBlock":
        mutate((d) => {
          const b = d.settings.blocked;
          d.settings.blocked = b.includes(o.key) ? b.filter((k) => k !== o.key) : [...b, o.key];
        });
        break;
      case "review":
        mutate((d) => {
          const r = d.reviews.find((x) => x.id === o.id);
          if (!r) return;
          if (o.hidden !== undefined) r.hidden = o.hidden;
          if (o.flagged !== undefined) r.flagged = o.flagged;
          if (o.adminReply !== undefined) r.adminReply = o.adminReply || undefined;
        });
        break;
      case "upsertPromo":
        mutate((d) => {
          const i = d.promos.findIndex((p) => p.code === o.promo.code);
          if (i >= 0) d.promos[i] = o.promo;
          else d.promos.push(o.promo);
        });
        break;
      case "deletePromo":
        mutate((d) => void (d.promos = d.promos.filter((p) => p.code !== o.code)));
        break;
      case "reset":
        resetDb();
        break;
    }
    return ok({ ok: true });
  });
