"use client";
import { useEffect, useState } from "react";
import { WHATSAPP_NUMBER } from "@/lib/config";

export function WhatsAppFab() {
  return (
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi HomeServ, I'd like to book a service.")}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-24 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105 sm:bottom-6"
      aria-label="Chat on WhatsApp"
    >
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor" aria-hidden>
        <path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.4-1.5-.9-.8-1.5-1.8-1.6-2.1-.2-.3 0-.4.1-.6l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.3zM12 21.8c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4A9.8 9.8 0 1 1 12 21.8zm0-21.6A11.8 11.8 0 0 0 1.9 18l-1.7 6 6.2-1.6A11.8 11.8 0 1 0 12 .2z" />
      </svg>
    </a>
  );
}

export function DemoBanner() {
  const [hidden, setHidden] = useState(true);
  useEffect(() => {
    try {
      setHidden(sessionStorage.getItem("hs_demo_hidden") === "1");
    } catch {
      setHidden(false);
    }
  }, []);
  if (hidden || process.env.NEXT_PUBLIC_DEMO_MODE === "false") return null;
  return (
    <div className="bg-accent text-white">
      <div className="container-x flex items-center gap-3 py-2 text-xs sm:text-sm">
        <p className="flex-1">
          Demo build — ratings, reviews and professionals are sample data. OTPs are shown on screen; online payments are simulated.
        </p>
        <button
          className="rounded-md px-2 py-1 hover:bg-white/20"
          onClick={() => {
            setHidden(true);
            try { sessionStorage.setItem("hs_demo_hidden", "1"); } catch {}
          }}
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
