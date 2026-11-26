import { BASE, SERVICE_RADIUS_M } from "./config.ts";

export interface LatLng {
  lat: number;
  lng: number;
}

/** Great-circle distance in metres (haversine). Mirrors PostGIS ST_Distance on geography. */
export function distanceM(a: LatLng, b: LatLng): number {
  const R = 6371008.8;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function checkServiceable(p: LatLng, radius = SERVICE_RADIUS_M) {
  const d = distanceM(p, BASE);
  return { serviceable: radius <= 0 || d <= radius, distanceM: Math.round(d) };
}

export function isValidLatLng(p: Partial<LatLng>): p is LatLng {
  return (
    typeof p.lat === "number" &&
    typeof p.lng === "number" &&
    Number.isFinite(p.lat) &&
    Number.isFinite(p.lng) &&
    Math.abs(p.lat) <= 90 &&
    Math.abs(p.lng) <= 180
  );
}
