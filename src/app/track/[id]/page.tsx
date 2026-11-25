import type { Metadata } from "next";
import { TrackView } from "./TrackView";

export const metadata: Metadata = { title: "Track Booking", robots: { index: false } };

export default function TrackPage({ params, searchParams }: { params: { id: string }; searchParams: { new?: string } }) {
  return <TrackView id={decodeURIComponent(params.id)} isNew={searchParams.new === "1"} />;
}
