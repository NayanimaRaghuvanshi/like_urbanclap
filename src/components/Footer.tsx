import Link from "next/link";
import { CATEGORIES } from "@/lib/catalog";
import { BASE, SUPPORT_EMAIL, SUPPORT_PHONE, WHATSAPP_NUMBER } from "@/lib/config";

export function Footer() {
  return (
    <footer className="mt-16 bg-ink pb-24 pt-12 text-slate-300 sm:pb-12">
      <div className="container-x grid gap-10 md:grid-cols-4">
        <div>
          <p className="font-display text-xl font-bold text-white">Home<span className="text-secondary">Serv</span></p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>📍 Serviceable within 2 km of {BASE.name}</li>
            <li>🕐 Open: 9 AM – 12:30 AM, 7 days</li>
            <li>📞 <a href={`tel:${SUPPORT_PHONE}`} className="hover:text-white">{SUPPORT_PHONE.replace(/^\+91(\d{5})(\d{5})$/, "+91 $1 $2")}</a></li>
            <li>📧 <a href={`mailto:${SUPPORT_EMAIL}`} className="hover:text-white">{SUPPORT_EMAIL}</a></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-white">Services</p>
          <ul className="mt-4 space-y-2 text-sm">
            {CATEGORIES.map((c) => (
              <li key={c.slug}><Link className="hover:text-white" href={`/services/${c.slug}`}>{c.shortName}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-semibold text-white">Company</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link className="hover:text-white" href="/about">About Us</Link></li>
            <li><Link className="hover:text-white" href="/gallery">Gallery</Link></li>
            <li><Link className="hover:text-white" href="/providers">Our Professionals</Link></li>
            <li><Link className="hover:text-white" href="/contact">Careers</Link></li>
            <li><Link className="hover:text-white" href="/pro">Partner Login</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-white">Support</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link className="hover:text-white" href="/faqs">FAQs</Link></li>
            <li><Link className="hover:text-white" href="/contact">Contact Us</Link></li>
            <li><Link className="hover:text-white" href="/terms">Terms</Link></li>
            <li><Link className="hover:text-white" href="/privacy">Privacy</Link></li>
          </ul>
          <div className="mt-5 flex flex-wrap gap-2 text-sm">
            <a className="rounded-lg bg-white/10 px-3 py-2 hover:bg-white/20" href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
            <a className="rounded-lg bg-white/10 px-3 py-2 hover:bg-white/20" href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
            <a className="rounded-lg bg-white/10 px-3 py-2 hover:bg-white/20" href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a>
            <a className="rounded-lg bg-white/10 px-3 py-2 hover:bg-white/20" href={`https://www.google.com/maps?q=${BASE.lat},${BASE.lng}`} target="_blank" rel="noopener noreferrer">Google Maps</a>
          </div>
        </div>
      </div>
      <div className="container-x mt-10 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-slate-400 sm:flex-row sm:justify-between">
        <p>© 2026 HomeServ. All rights reserved.</p>
        <p>Payments powered by Razorpay 🔒</p>
      </div>
    </footer>
  );
}
