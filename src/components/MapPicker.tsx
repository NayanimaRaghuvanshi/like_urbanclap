"use client";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useRef } from "react";
import { AREA_LIMITED, BASE, SERVICE_RADIUS_M } from "@/lib/config";

/** OpenStreetMap + Leaflet map with a draggable pin (and the service circle if a radius is configured). */
export default function MapPicker({ value, onChange }: { value?: { lat: number; lng: number }; onChange: (p: { lat: number; lng: number }) => void }) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map>();
  const marker = useRef<L.Marker>();
  const cb = useRef(onChange);
  cb.current = onChange;

  useEffect(() => {
    if (!el.current || map.current) return;
    const m = L.map(el.current, { scrollWheelZoom: false }).setView([BASE.lat, BASE.lng], 14);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "© OpenStreetMap" }).addTo(m);
    if (AREA_LIMITED) L.circle([BASE.lat, BASE.lng], { radius: SERVICE_RADIUS_M, color: "#2563EB", weight: 2, fillOpacity: 0.08 }).addTo(m);
    L.circleMarker([BASE.lat, BASE.lng], { radius: 6, color: "#fff", weight: 2, fillColor: "#F59E0B", fillOpacity: 1 }).addTo(m).bindTooltip("HomeServ base");
    const icon = L.divIcon({ className: "", html: '<div style="font-size:34px;line-height:34px;transform:translate(-6px,-30px)">📍</div>', iconSize: [24, 24] });
    const start = value ?? { lat: BASE.lat, lng: BASE.lng };
    marker.current = L.marker([start.lat, start.lng], { draggable: true, icon, keyboard: true, title: "Drag to your exact location" }).addTo(m);
    marker.current.on("dragend", () => {
      const p = marker.current!.getLatLng();
      cb.current({ lat: p.lat, lng: p.lng });
    });
    m.on("click", (e: L.LeafletMouseEvent) => {
      marker.current!.setLatLng(e.latlng);
      cb.current({ lat: e.latlng.lat, lng: e.latlng.lng });
    });
    map.current = m;
    return () => {
      m.remove();
      map.current = undefined;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!value || !marker.current || !map.current) return;
    const cur = marker.current.getLatLng();
    if (Math.abs(cur.lat - value.lat) > 1e-6 || Math.abs(cur.lng - value.lng) > 1e-6) {
      marker.current.setLatLng([value.lat, value.lng]);
      map.current.panTo([value.lat, value.lng]);
    }
  }, [value]);

  return <div ref={el} className="h-72 w-full overflow-hidden rounded-2xl ring-1 ring-slate-200" aria-label="Map — tap or drag the pin to set your location" />;
}
