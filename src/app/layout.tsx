import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { DemoBanner, WhatsAppFab } from "@/components/Floating";
import { StoreProvider, ToastProvider } from "@/components/store";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const poppins = Poppins({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-poppins", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: { default: "HomeServ — Home Repairs & Design at Your Doorstep", template: "%s | HomeServ" },
  description: "PVC panels, wall design, plumbers, electricians, carpenters and custom furniture — verified pros at your doorstep. Open 9 AM – 12:30 AM.",
  openGraph: { type: "website", siteName: "HomeServ", locale: "en_IN" },
};

export const viewport: Viewport = { themeColor: "#2563EB", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${inter.variable} ${poppins.variable}`}>
      <body className="min-h-screen font-sans">
        <ToastProvider>
          <StoreProvider>
            <DemoBanner />
            <Navbar />
            <main>{children}</main>
            <Footer />
            <WhatsAppFab />
          </StoreProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
