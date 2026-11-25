import { CATEGORIES, SEED_SERVICES } from "./catalog.ts";
import type { CategorySlug, Provider, Review, Settings } from "./types.ts";

const P = (p: Omit<Provider, "isActive" | "leaveDates"> & Partial<Provider>): Provider => ({
  isActive: true,
  leaveDates: [],
  ...p,
});

export const SEED_PROVIDERS: Provider[] = [
  P({ id: "rajesh-kumar", name: "Rajesh Kumar", phone: "+919800000001", pin: "1111", categories: ["plumber"], speciality: "Plumbing & Pipe Fitting Specialist", experienceYears: 5, joined: "2025-01", rating: 4.8, totalJobs: 320, aadhaarVerified: true, policeVerified: true, servicesOffered: ["Tap & Faucet Repair", "Leak Detection", "Pipeline Installation", "Bathroom Fittings", "Water Purifier Install", "Drainage Cleaning"], certifications: ["ITI Diploma in Plumbing", "Certified in CPVC/PPR Pipe Fitting", "Water Heater Installation Trained"], gallery: ["bathroom", "kitchen", "bathroom", "kitchen"], avatarHue: 210 }),
  P({ id: "mohammed-irfan", name: "Mohammed Irfan", phone: "+919800000002", pin: "2222", categories: ["plumber"], speciality: "Bathroom & Sanitary Fittings", experienceYears: 8, joined: "2025-03", rating: 4.7, totalJobs: 410, aadhaarVerified: true, policeVerified: true, servicesOffered: ["Toilet Installation", "Flush Repair", "Water Tank Cleaning", "Mixer Installation"], certifications: ["ITI Diploma in Plumbing"], gallery: ["bathroom", "bathroom", "kitchen"], avatarHue: 160 }),
  P({ id: "suresh-babu", name: "Suresh Babu", phone: "+919800000003", pin: "3333", categories: ["electrician"], speciality: "Residential Electrician", experienceYears: 7, joined: "2025-02", rating: 4.8, totalJobs: 380, aadhaarVerified: true, policeVerified: true, servicesOffered: ["Fan Installation", "Switchboard Repair", "Wiring", "MCB & Fuse", "Geyser Installation"], certifications: ["ITI Electrician", "Wireman Licence (KA)"], gallery: ["ceiling", "tv-unit", "kitchen"], avatarHue: 40 }),
  P({ id: "venkatesh-r", name: "Venkatesh R", phone: "+919800000004", pin: "4444", categories: ["electrician"], speciality: "Lighting & Appliance Installation", experienceYears: 4, joined: "2025-06", rating: 4.6, totalJobs: 190, aadhaarVerified: true, policeVerified: true, servicesOffered: ["Light Installation", "Chandelier", "TV Mounting", "Inverter Installation"], certifications: ["ITI Electrician"], gallery: ["ceiling", "tv-unit"], avatarHue: 280 }),
  P({ id: "anil-shetty", name: "Anil Shetty", phone: "+919800000005", pin: "5555", categories: ["pvc-panels", "wall-designer"], speciality: "PVC & WPC Panel Installer", experienceYears: 6, joined: "2025-01", rating: 4.9, totalJobs: 260, aadhaarVerified: true, policeVerified: true, servicesOffered: ["PVC Panels", "WPC Panels", "Fluted Panels", "Charcoal Panels", "TV Backdrops", "False Ceiling"], certifications: ["Manufacturer-trained PVC/WPC installer", "False ceiling (gypsum & PVC)"], gallery: ["fluted", "charcoal", "wpc", "ceiling"], avatarHue: 20 }),
  P({ id: "deepak-yadav", name: "Deepak Yadav", phone: "+919800000006", pin: "6666", categories: ["pvc-panels"], speciality: "Panel & False Ceiling Installer", experienceYears: 3, joined: "2025-08", rating: 4.7, totalJobs: 120, aadhaarVerified: true, policeVerified: true, servicesOffered: ["PVC Panels", "False Ceiling", "Mandir Walls"], certifications: ["Manufacturer-trained PVC installer"], gallery: ["ceiling", "fluted", "mandir"], avatarHue: 120 }),
  P({ id: "kavya-nair", name: "Kavya Nair", phone: "+919800000007", pin: "7777", categories: ["wall-designer", "painting"], speciality: "Wall Designer & Texture Artist", experienceYears: 6, joined: "2025-02", rating: 4.9, totalJobs: 210, aadhaarVerified: true, policeVerified: true, servicesOffered: ["Wall Texture", "Stencil Art", "Kids Room Walls", "Wallpaper", "Accent Walls"], certifications: ["Diploma in Interior Design", "Asian Paints texture applicator training"], gallery: ["texture", "stencil", "mandir", "paint"], avatarHue: 330 }),
  P({ id: "ramesh-gowda", name: "Ramesh Gowda", phone: "+919800000008", pin: "8888", categories: ["carpenter", "furniture"], speciality: "Carpenter & Furniture Maker", experienceYears: 12, joined: "2025-01", rating: 4.8, totalJobs: 450, aadhaarVerified: true, policeVerified: true, servicesOffered: ["Door & Lock", "Furniture Repair", "Assembly", "TV Units", "Wardrobes"], certifications: ["15+ years modular furniture", "Hettich hardware trained"], gallery: ["wardrobe", "tv-unit", "kitchen", "bathroom"], avatarHue: 30 }),
  P({ id: "sunil-sharma", name: "Sunil Sharma", phone: "+919800000009", pin: "9999", categories: ["carpenter"], speciality: "Repairs & Installations", experienceYears: 5, joined: "2025-04", rating: 4.6, totalJobs: 230, aadhaarVerified: true, policeVerified: true, servicesOffered: ["Hinges & Channels", "Curtain Rods", "Shelves", "Assembly"], certifications: [], gallery: ["kitchen", "wardrobe"], avatarHue: 200 }),
  P({ id: "imran-khan", name: "Imran Khan", phone: "+919800000010", pin: "1010", categories: ["furniture"], speciality: "Modular Kitchen & Wardrobe Designer", experienceYears: 9, joined: "2025-03", rating: 4.9, totalJobs: 140, aadhaarVerified: true, policeVerified: true, servicesOffered: ["Modular Kitchen", "Wardrobes", "TV Units", "Crockery Units"], certifications: ["Diploma in Furniture Design"], gallery: ["kitchen", "wardrobe", "tv-unit"], avatarHue: 260 }),
  P({ id: "manjunath-s", name: "Manjunath S", phone: "+919800000011", pin: "1212", categories: ["painting"], speciality: "Painter & Waterproofing", experienceYears: 10, joined: "2025-02", rating: 4.7, totalJobs: 300, aadhaarVerified: true, policeVerified: true, servicesOffered: ["Room Painting", "Full Home Painting", "Waterproofing", "Wood Polish"], certifications: ["Asian Paints certified painter"], gallery: ["paint", "texture", "paint"], avatarHue: 90 }),
];

const NAMES = ["Priya R.", "Amit K.", "Sneha M.", "Rahul M.", "Divya S.", "Karthik N.", "Ananya P.", "Vikram J.", "Meera T.", "Arjun B.", "Pooja G.", "Rohan D.", "Lakshmi V.", "Nikhil A.", "Shreya H.", "Farhan Q."];

const TEXTS: Record<number, string[]> = {
  5: [
    "Excellent service! Arrived on time and fixed everything quickly.",
    "Very professional. Explained the issue and cleaned up after the job.",
    "Work was stunning — exactly like the design shown on the tablet.",
    "Quick and reliable. Will book again.",
    "Polite, skilled and the price was exactly what the app showed.",
  ],
  4: [
    "Good work but arrived 20 mins late.",
    "Job done well. Had to buy one spare part separately, which took time.",
    "Neat finish. Took a little longer than estimated.",
  ],
  3: ["Okay service. The issue is fixed but the pro seemed in a hurry.", "Average experience — needed a reminder call before he arrived."],
  2: ["Had to call twice for the same issue.", "Finish around the edges could have been better; support arranged a revisit."],
  1: ["Leak came back the next day. Support scheduled a free revisit but it was a hassle."],
};

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

export function seedReviews(now = Date.now()): Review[] {
  const rand = rng(42);
  const reviews: Review[] = [];
  let n = 0;
  for (const cat of CATEGORIES) {
    const services = SEED_SERVICES.filter((s) => s.category === cat.slug);
    const providers = SEED_PROVIDERS.filter((p) => p.categories.includes(cat.slug));
    // Distribution deliberately includes low ratings — we show them.
    const ratings = [5, 5, 5, 4, 5, 3, 5, 4, 5, 2, 5, 1];
    ratings.forEach((rating, i) => {
      const svc = services[i % services.length];
      const prov = providers[i % providers.length];
      const texts = TEXTS[rating];
      reviews.push({
        id: `r-seed-${++n}`,
        customerName: NAMES[Math.floor(rand() * NAMES.length)],
        providerId: prov?.id,
        serviceId: svc.id,
        category: cat.slug as CategorySlug,
        serviceName: svc.name.replace(/^PACKAGE: /, ""),
        rating,
        text: texts[Math.floor(rand() * texts.length)],
        createdAt: new Date(now - Math.floor((i * 3 + rand() * 3 + 1) * 86400000)).toISOString(),
        adminReply: rating <= 2 ? "Sorry about this — we've arranged a free revisit and shared feedback with the professional. — Team HomeServ" : undefined,
      });
    });
  }
  return reviews;
}

export const DEFAULT_SETTINGS: Settings = { slotCapacity: {}, blocked: [] };
