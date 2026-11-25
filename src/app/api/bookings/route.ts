import { z } from "zod";
import { body, fail, handle, ok } from "@/lib/api";
import { bookingView, createBooking, quoteFor } from "@/lib/bookings";
import { db } from "@/lib/db";
import { consumeOrder, verifyPayment } from "@/lib/payments";
import { currentPhone } from "@/lib/session";

export const dynamic = "force-dynamic";

const Photo = z.string().max(1_500_000).regex(/^data:image\/(jpeg|png|webp);base64,/, "Photos must be JPEG, PNG or WebP");

const S = z.object({
  name: z.string().trim().min(2, "Please enter your full name").max(100),
  email: z.string().trim().email("Enter a valid email").optional().or(z.literal("")),
  items: z.array(z.object({ serviceId: z.string(), qty: z.number().int().min(1).max(10) })).min(1, "Your cart is empty").max(20),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  slot: z.number().int(),
  address: z.object({
    line1: z.string().trim().min(1, "Flat / house number is required").max(200),
    building: z.string().trim().min(2, "Building / society name is required").max(200),
    landmark: z.string().trim().max(200).optional(),
    locality: z.string().trim().min(2, "Area / locality is required").max(200),
    pin: z.string().regex(/^\d{6}$/, "PIN code must be 6 digits"),
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),
  notes: z.string().trim().min(5, "Please describe your requirement").max(250, "Notes can be up to 250 characters"),
  photos: z.array(Photo).max(3, "Up to 3 photos").default([]),
  paymentMethod: z.enum(["after_service", "online"]),
  payment: z.object({ orderId: z.string(), paymentId: z.string(), signature: z.string().optional() }).optional(),
  promoCode: z.string().max(20).optional(),
  acceptTerms: z.literal(true, { errorMap: () => ({ message: "Please accept the Terms & Conditions" }) }),
});

export const POST = (req: Request) =>
  handle(async () => {
    const phone = currentPhone();
    if (!phone) return fail("Please verify your mobile number with OTP", 401);
    const b = await body(req, S);
    let paymentRef: string | undefined;
    if (b.paymentMethod === "online") {
      if (!b.payment) return fail("Payment not completed");
      const { quote } = quoteFor(b.items, b.promoCode || undefined);
      paymentRef = verifyPayment(b.payment, quote.total);
    }
    // NOTE: if this throws after a real online payment (e.g. slot taken meanwhile), issue a refund via Razorpay.
    const booking = createBooking({ ...b, phone, email: b.email || undefined, paymentRef, promoCode: b.promoCode || undefined });
    if (b.payment) consumeOrder(b.payment.orderId, booking.id);
    return ok({ booking: bookingView(booking, "customer") }, 201);
  });

export const GET = () =>
  handle(() => {
    const phone = currentPhone();
    if (!phone) return fail("Not logged in", 401);
    return ok({ bookings: db().bookings.filter((b) => b.customerPhone === phone).map((b) => bookingView(b, "customer")) });
  });
