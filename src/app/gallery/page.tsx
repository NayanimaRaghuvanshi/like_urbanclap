import Link from "next/link";
import type { Metadata } from "next";
import { GalleryGrid } from "@/components/GalleryGrid";
import { GALLERY } from "@/lib/catalog";

export const metadata: Metadata = { title: "Before & After Gallery", description: "PVC panels, wall designs, furniture, carpentry and painting transformations near you." };

export default function Gallery() {
  return (
    <div className="container-x py-10">
      <h1 className="section-title">Before & After Gallery</h1>
      <p className="mb-8 mt-2 text-ink-muted">Real projects in your neighbourhood. Drag each slider to compare.</p>
      <GalleryGrid items={GALLERY} />
      <div className="mt-12 rounded-3xl bg-primary p-8 text-center text-white">
        <h2 className="text-2xl font-bold">Like what you see?</h2>
        <p className="mt-2 text-white/80">Book a ₹49 measurement visit — our expert brings 300+ designs to your home.</p>
        <Link href="/services/pvc-panels" className="btn-amber mt-5">Explore PVC Panels</Link>
      </div>
    </div>
  );
}
