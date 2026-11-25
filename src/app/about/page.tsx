import Link from "next/link";
import type { Metadata } from "next";
import { BASE } from "@/lib/config";

export const metadata: Metadata = { title: "About Us" };

export default function About() {
  return (
    <div className="container-x max-w-3xl space-y-6 py-10">
      <h1 className="section-title">About HomeServ</h1>
      <p className="text-lg">HomeServ is a hyperlocal home services company serving homes within 2 km of {BASE.name}. We fix, build and beautify homes — from a dripping tap at 11 PM to a full fluted-panel living room.</p>
      <div className="grid gap-4 sm:grid-cols-3">
        {[["2 km", "Service radius so pros arrive fast"], ["9 AM – 12:30 AM", "Open 7 days, including nights"], ["100%", "Pros with Aadhaar KYC & police verification"]].map(([a, b]) => (
          <div key={a} className="card p-5"><p className="font-display text-2xl font-bold text-primary">{a}</p><p className="text-sm text-ink-muted">{b}</p></div>
        ))}
      </div>
      <h2 className="text-xl font-bold">How we're different</h2>
      <ul className="list-disc space-y-2 pl-5 text-ink-muted">
        <li><b className="text-ink">Managed, fixed-price.</b> We set the price, assign the pro and stand behind the work — no haggling.</li>
        <li><b className="text-ink">Consult first for custom work.</b> Panels, furniture and wall design start with a paid visit that's adjusted against your order.</li>
        <li><b className="text-ink">Honest reviews.</b> We show every rating, including the bad ones, and reply to each complaint.</li>
        <li><b className="text-ink">We only claim what we verify.</b> No invented badges or certifications.</li>
      </ul>
      <div className="flex gap-3"><Link className="btn-primary" href="/services">Book a Service</Link><Link className="btn-outline" href="/contact">Work with us</Link></div>
    </div>
  );
}
