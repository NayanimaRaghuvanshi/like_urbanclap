"use client";
import { useState } from "react";
import { api } from "@/components/store";

export function ContactForm() {
  const [f, setF] = useState({ name: "", phone: "", message: "" });
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [err, setErr] = useState("");
  if (state === "done") return <p className="rounded-xl bg-success-50 p-4 text-emerald-700">✅ Thanks! We'll get back to you shortly.</p>;
  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setState("busy");
        setErr("");
        try {
          await api("/api/contact", { json: f });
          setState("done");
        } catch (x) {
          setErr((x as Error).message);
          setState("idle");
        }
      }}
    >
      <label className="block"><span className="label">Name</span><input className="input" required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></label>
      <label className="block"><span className="label">Phone</span><input className="input" required inputMode="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></label>
      <label className="block"><span className="label">Message</span><textarea className="input min-h-[120px]" required value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} /></label>
      {err && <p className="text-sm text-danger">{err}</p>}
      <button className="btn-primary w-full" disabled={state === "busy"}>{state === "busy" ? "Sending…" : "Send Message"}</button>
    </form>
  );
}
