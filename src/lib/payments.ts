import "server-only";
import crypto from "node:crypto";
import { mutate, db, uid } from "./db";
import { BookingError } from "./bookings";

const KEY_ID = process.env.RAZORPAY_KEY_ID;
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
export const razorpayEnabled = () => Boolean(KEY_ID && KEY_SECRET);

/** Creates a Razorpay order (or a simulated one when keys are not configured). Amount in rupees. */
export async function createOrder(amount: number) {
  const paise = Math.round(amount * 100);
  if (razorpayEnabled()) {
    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Basic " + Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString("base64") },
      body: JSON.stringify({ amount: paise, currency: "INR", receipt: uid("rcpt_") }),
    });
    if (!res.ok) throw new BookingError("Payment gateway unavailable, please choose Pay After Service", 502);
    const order = (await res.json()) as { id: string };
    mutate((d) => void (d.orders[order.id] = { amount: paise, mock: false, createdAt: new Date().toISOString() }));
    return { orderId: order.id, amount: paise, keyId: KEY_ID, mock: false };
  }
  const orderId = uid("order_mock_");
  mutate((d) => void (d.orders[orderId] = { amount: paise, mock: true, createdAt: new Date().toISOString() }));
  return { orderId, amount: paise, mock: true };
}

/** Verify a completed payment against the order and the expected amount (does not consume it). */
export function verifyPayment(p: { orderId: string; paymentId: string; signature?: string }, expectedAmount: number) {
  const order = db().orders[p.orderId];
  if (!order) throw new BookingError("Payment order not found");
  if (order.usedBy) throw new BookingError("This payment has already been used");
  if (order.amount !== Math.round(expectedAmount * 100)) throw new BookingError("Payment amount doesn't match your cart. Please retry.");
  if (!order.mock) {
    const expected = crypto.createHmac("sha256", KEY_SECRET!).update(`${p.orderId}|${p.paymentId}`).digest("hex");
    if (!p.signature || p.signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(p.signature)))
      throw new BookingError("Payment verification failed");
  } else if (!p.paymentId.startsWith("pay_mock_")) {
    throw new BookingError("Payment verification failed");
  }
  return p.paymentId;
}

/** Mark an order as consumed by a booking so it can't be replayed. */
export function consumeOrder(orderId: string, bookingId: string) {
  mutate((d) => void (d.orders[orderId].usedBy = bookingId));
}
