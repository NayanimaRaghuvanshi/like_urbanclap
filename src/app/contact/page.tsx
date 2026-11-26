import type { Metadata } from "next";
import { ContactForm } from "./ContactForm";
import { BASE, SUPPORT_EMAIL, SUPPORT_PHONE, WHATSAPP_NUMBER } from "@/lib/config";

export const metadata: Metadata = { title: "Contact Us" };

export default function Contact() {
  return (
    <div className="container-x grid max-w-5xl gap-8 py-10 md:grid-cols-2">
      <div>
        <h1 className="section-title">Contact Us</h1>
        <p className="mt-2 text-ink-muted">We usually reply within 15 minutes during operating hours (9 AM – 12:30 AM).</p>
        <ul className="mt-6 space-y-3">
          <li><a className="btn-outline w-full justify-start" href={`tel:${SUPPORT_PHONE}`}>📞 {SUPPORT_PHONE}</a></li>
          <li><a className="btn-outline w-full justify-start" href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer">💬 WhatsApp us</a></li>
          <li><a className="btn-outline w-full justify-start" href={`mailto:${SUPPORT_EMAIL}`}>📧 {SUPPORT_EMAIL}</a></li>
          <li className="rounded-xl bg-slate-100 p-4 text-sm">📍 Based in {BASE.name}<br />Interested in joining as a professional? Send us a message with your trade and experience.</li>
        </ul>
      </div>
      <div className="card p-6"><ContactForm /></div>
    </div>
  );
}
