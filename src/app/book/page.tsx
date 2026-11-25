import type { Metadata } from "next";
import { BookingFlow } from "./BookingFlow";

export const metadata: Metadata = { title: "Book a Service", robots: { index: false } };

export default function BookPage() {
  return <BookingFlow />;
}
