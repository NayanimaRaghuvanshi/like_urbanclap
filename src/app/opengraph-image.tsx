import { ImageResponse } from "next/og";

export const alt = "HomeServ — home repairs & design at your doorstep";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, background: "linear-gradient(135deg,#0f172a 0%,#1e3a8a 60%,#2563EB 100%)", color: "white" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ width: 96, height: 96, borderRadius: 24, background: "#2563EB", border: "4px solid white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 60, fontWeight: 800 }}>H</div>
          <div style={{ display: "flex", fontSize: 80, fontWeight: 800 }}>Home<span style={{ color: "#F59E0B" }}>Serv</span></div>
        </div>
        <div style={{ marginTop: 40, fontSize: 44, fontWeight: 700 }}>Home Repairs & Design — At Your Doorstep</div>
        <div style={{ marginTop: 20, fontSize: 30, color: "#cbd5e1" }}>Plumber • Electrician • PVC Panels • Wall Design • Carpenter • Furniture • Painting</div>
        <div style={{ marginTop: 40, fontSize: 28, color: "#F59E0B" }}>Verified pros · Fixed prices · Open 9 AM – 12:30 AM</div>
      </div>
    ),
    size
  );
}
