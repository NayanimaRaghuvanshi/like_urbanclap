"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CATEGORIES } from "@/lib/catalog";
import { SUPPORT_PHONE } from "@/lib/config";
import { useStore } from "./store";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [svcOpen, setSvcOpen] = useState(false);
  const { count, location, ready } = useStore();
  const path = usePathname();
  useEffect(() => {
    setOpen(false);
    setSvcOpen(false);
  }, [path]);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <nav className="container-x flex h-16 items-center gap-3" aria-label="Main">
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold text-primary">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-lg text-white">H</span>
          <span>Home<span className="text-secondary">Serv</span></span>
        </Link>
        <div className="ml-6 hidden items-center gap-1 lg:flex">
          <div className="relative" onMouseLeave={() => setSvcOpen(false)}>
            <button className="btn-ghost btn-sm text-ink" onMouseEnter={() => setSvcOpen(true)} onClick={() => setSvcOpen((v) => !v)} aria-expanded={svcOpen}>
              Services ▾
            </button>
            {svcOpen && (
              <div className="absolute left-0 top-full w-72 pt-2">
                <div className="card grid gap-1 p-2">
                  {CATEGORIES.map((c) => (
                    <Link key={c.slug} href={`/services/${c.slug}`} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-slate-50">
                      <span className="text-lg">{c.icon}</span>
                      <span className="flex-1 font-medium">{c.shortName}</span>
                      <span className="text-xs text-ink-muted">{c.startingLabel}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
          <Link href="/gallery" className="btn-ghost btn-sm text-ink">Gallery</Link>
          <Link href="/about" className="btn-ghost btn-sm text-ink">About</Link>
          <Link href="/my-bookings" className="btn-ghost btn-sm text-ink">Track Booking</Link>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {ready && location && (
            <span className={`hidden max-w-[180px] truncate rounded-full px-3 py-1 text-xs font-medium md:inline-block ${location.serviceable ? "bg-success-50 text-emerald-700" : "bg-danger-50 text-red-700"}`} title={location.label}>
              📍 {location.label}
            </span>
          )}
          <a href={`tel:${SUPPORT_PHONE}`} className="btn-outline btn-sm hidden sm:inline-flex">☎ Call Now</a>
          <Link href="/book" className="btn-outline btn-sm relative" aria-label={`Cart, ${count} items`}>
            🛒<span className="hidden sm:inline">Cart</span>
            {count > 0 && <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-secondary px-1 text-[11px] font-bold text-ink">{count}</span>}
          </Link>
          <Link href="/my-bookings" className="btn-primary btn-sm hidden sm:inline-flex">My Bookings</Link>
          <button className="btn-outline btn-sm lg:hidden" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-label="Menu">
            {open ? "✕" : "☰"}
          </button>
        </div>
      </nav>
      {open && (
        <div className="border-t border-slate-200 bg-white lg:hidden">
          <div className="container-x grid gap-1 py-3">
            <p className="px-3 pt-1 text-xs font-semibold uppercase tracking-wide text-ink-muted">Services</p>
            <div className="grid grid-cols-2 gap-1">
              {CATEGORIES.map((c) => (
                <Link key={c.slug} href={`/services/${c.slug}`} className="flex min-h-[44px] items-center gap-2 rounded-lg px-3 text-sm hover:bg-slate-50">
                  {c.icon} {c.shortName}
                </Link>
              ))}
            </div>
            <hr className="my-2" />
            {[["/gallery", "Gallery"], ["/my-bookings", "My Bookings / Track"], ["/about", "About Us"], ["/faqs", "FAQs"], ["/contact", "Contact"]].map(([h, l]) => (
              <Link key={h} href={h} className="flex min-h-[44px] items-center rounded-lg px-3 text-sm font-medium hover:bg-slate-50">{l}</Link>
            ))}
            <a href={`tel:${SUPPORT_PHONE}`} className="btn-primary mt-2">☎ Call Now</a>
          </div>
        </div>
      )}
    </header>
  );
}
