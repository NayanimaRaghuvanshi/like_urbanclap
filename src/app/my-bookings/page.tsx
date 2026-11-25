import type { Metadata } from "next";
import { MyBookings } from "./MyBookings";

export const metadata: Metadata = { title: "My Bookings", robots: { index: false } };
export default function Page() {
  return <MyBookings />;
}
