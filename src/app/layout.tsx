import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { DemoBanner, WhatsAppFab } from "@/components/Floating";
import { StoreProvider, ToastProvider } from "@/components/store";
import { BASE, SITE_URL } from "@/lib/config";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const poppins = Poppins({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-poppins", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `HomeServ — Plumber, Electrician, PVC Panels & Wall Design in ${BASE.cityName}`, template: "%s | HomeServ" },
  description: `HomeServ: book verified plumbers, electricians, carpenters, PVC panel installers, wall designers and furniture makers in ${BASE.cityName}. Fixed prices, same-day slots, open 9 AM – 12:30 AM.`,
  applicationName: "HomeServ",
  keywords: ["HomeServ", "Home Serv", "home services", "plumber", "electrician", "PVC panels", "wall design", "carpenter", "furniture", BASE.cityName, "HSR Layout"],
  openGraph: { type: "website", siteName: "HomeServ", locale: "en_IN", url: "/" },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
  // Google Search Console "HTML tag" verification — paste only the content="..." value into Vercel.
  verification: process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : undefined,
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
