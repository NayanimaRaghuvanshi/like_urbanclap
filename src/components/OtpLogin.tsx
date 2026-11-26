"use client";
import { useEffect, useState } from "react";
import { api, useToast } from "./store";

export interface Me { phone: string | null; name: string | null; email: string | null; otpMode?: "sms" | "dev" | "none"; deviceBookings?: number }

export function useMe() {
  const [me, setMe] = useState<Me>();
  const refresh = () => api<Me>("/api/me").then(setMe).catch(() => setMe({ phone: null, name: null, email: null, otpMode: "none" }));
  useEffect(() => {
    refresh();
  }, []);
  return { me, setMe, refresh };
}

export function OtpLogin({ onVerified }: { onVerified: (me: Me) => void }) {
  const toast = useToast();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [dev, setDev] = useState<string>();
  const [cool, setCool] = useState(0);

  useEffect(() => {
    if (!cool) return;
    const t = setTimeout(() => setCool((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cool]);

  async function send() {
    setErr("");
    if (!/^[6-9]\d{9}$/.test(phone)) return setErr("Enter a valid 10-digit mobile number");
    setBusy(true);
    try {
      const r = await api<{ devCode?: string }>("/api/otp/send", { json: { phone } });
      setSent(true);
      setDev(r.devCode);
      setCool(30);
      toast("OTP sent via SMS", "ok");
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function verify() {
    setErr("");
    setBusy(true);
    try {
      const r = await api<{ phone: string; name?: string; email?: string }>("/api/otp/verify", { json: { phone, code } });
      onVerified({ phone: r.phone, name: r.name ?? null, email: r.email ?? null, otpMode: "sms" });
      toast("Mobile number verified ✓", "ok");
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <label className="label" htmlFor="otp-phone">Mobile Number *</label>
      <div className="flex gap-2">
        <span className="input flex w-16 shrink-0 items-center justify-center text-ink-muted">+91</span>
        <input id="otp-phone" className="input" inputMode="numeric" autoComplete="tel-national" placeholder="98765 43210" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} disabled={sent && busy} />
        <button className="btn-outline shrink-0" onClick={send} disabled={busy || cool > 0} type="button">{sent ? (cool ? `Resend ${cool}s` : "Resend") : "Send OTP"}</button>
      </div>
      {sent && (
        <>
          <label className="label" htmlFor="otp-code">OTP *</label>
          <div className="flex gap-2">
            <input id="otp-code" className="input tracking-[0.5em]" inputMode="numeric" autoComplete="one-time-code" placeholder="····" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 4))} />
            <button className="btn-primary shrink-0" onClick={verify} disabled={busy || code.length !== 4} type="button">Verify ✓</button>
          </div>
          {dev && <p className="rounded-lg bg-accent-50 px-3 py-2 text-xs text-violet-700">Demo mode: your OTP is <b className="tracking-widest">{dev}</b> (in production it's sent by SMS/WhatsApp).</p>}
        </>
      )}
      {err && <p className="text-sm text-danger">{err}</p>}
    </div>
  );
}
