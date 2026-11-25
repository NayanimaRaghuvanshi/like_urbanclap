"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { CategorySlug } from "@/lib/types";

export interface CartLine {
  serviceId: string;
  name: string;
  price: number;
  qty: number;
  durationMin: number;
  category: CategorySlug;
  isConsultation?: boolean;
}

export interface SavedLocation {
  lat: number;
  lng: number;
  label: string;
  serviceable: boolean;
  distanceM: number;
}

interface Store {
  cart: CartLine[];
  cartCategory?: CategorySlug;
  add: (l: Omit<CartLine, "qty">) => { replaced: boolean } | "conflict";
  replaceCartWith: (l: Omit<CartLine, "qty">) => void;
  setQty: (serviceId: string, qty: number) => void;
  clearCart: () => void;
  count: number;
  subtotal: number;
  location?: SavedLocation;
  setLocation: (l?: SavedLocation) => void;
  ready: boolean;
}

const Ctx = createContext<Store | null>(null);

function load<T>(k: string): T | undefined {
  try {
    const v = localStorage.getItem(k);
    return v ? (JSON.parse(v) as T) : undefined;
  } catch {
    return undefined;
  }
}
function save(k: string, v: unknown) {
  try {
    if (v === undefined) localStorage.removeItem(k);
    else localStorage.setItem(k, JSON.stringify(v));
  } catch {
    /* storage unavailable */
  }
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [location, setLoc] = useState<SavedLocation>();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setCart(load<CartLine[]>("hs_cart") ?? []);
    setLoc(load<SavedLocation>("hs_loc"));
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) save("hs_cart", cart);
  }, [cart, ready]);

  const add = useCallback<Store["add"]>(
    (l) => {
      if (cart.length && cart[0].category !== l.category) return "conflict";
      setCart((c) => {
        const ex = c.find((x) => x.serviceId === l.serviceId);
        if (ex && l.isConsultation) return c;
        if (ex) return c.map((x) => (x.serviceId === l.serviceId ? { ...x, qty: Math.min(10, x.qty + 1) } : x));
        return [...c, { ...l, qty: 1 }];
      });
      return { replaced: false };
    },
    [cart]
  );

  const value = useMemo<Store>(
    () => ({
      cart,
      cartCategory: cart[0]?.category,
      add,
      replaceCartWith: (l) => setCart([{ ...l, qty: 1 }]),
      setQty: (id, qty) => setCart((c) => (qty <= 0 ? c.filter((x) => x.serviceId !== id) : c.map((x) => (x.serviceId === id ? { ...x, qty: Math.min(10, qty) } : x)))),
      clearCart: () => setCart([]),
      count: cart.reduce((s, x) => s + x.qty, 0),
      subtotal: cart.reduce((s, x) => s + x.qty * x.price, 0),
      location,
      setLocation: (l) => {
        setLoc(l);
        save("hs_loc", l);
      },
      ready,
    }),
    [cart, add, location, ready]
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore outside StoreProvider");
  return s;
}

/* Tiny toast system */
type Toast = { id: number; text: string; tone?: "ok" | "err" | "info" };
const ToastCtx = createContext<(text: string, tone?: Toast["tone"]) => void>(() => {});
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((text: string, tone: Toast["tone"] = "info") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [{ id, text, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2800);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-20 z-[100] flex flex-col items-center gap-2 px-4" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto max-w-md rounded-xl px-4 py-3 text-sm font-medium shadow-lg ${
              t.tone === "err" ? "bg-danger text-white" : t.tone === "ok" ? "bg-success text-white" : "bg-ink text-white"
            }`}
          >
            {t.text}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
export const useToast = () => useContext(ToastCtx);

export async function api<T = unknown>(url: string, init?: RequestInit & { json?: unknown }): Promise<T> {
  const res = await fetch(url, {
    ...init,
    method: init?.method ?? (init?.json !== undefined ? "POST" : "GET"),
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    body: init?.json !== undefined ? JSON.stringify(init.json) : init?.body,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error || `Request failed (${res.status})`);
  return data as T;
}
