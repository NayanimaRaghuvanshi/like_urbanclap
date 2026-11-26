import type { Category, CategorySlug, Faq, Service } from "./types.ts";

const commonFaqs = (extra: Faq[] = []): Faq[] => [
  ...extra,
  {
    q: "Do I pay upfront or after service?",
    a: "Your choice. 'Pay After Service' is the default — pay by UPI or cash once the job is done and you've shared the end-of-job OTP. You can also pay online at booking via Razorpay (UPI, cards, net banking, wallets).",
  },
  {
    q: "Can I reschedule or cancel?",
    a: "Yes. Reschedule or cancel free of charge up to 2 hours before your slot. Cancellations within 2 hours carry a ₹50 fee to cover the professional's travel.",
  },
];

export const CATEGORIES: Category[] = [
  {
    slug: "plumber",
    name: "Plumber Services",
    shortName: "Plumber",
    icon: "🔧",
    tagline: "Leaks, taps, toilets & tanks — fixed today",
    description: "Background-verified plumbers for repairs, installations and full bathroom checks. Same-day service available.",
    startingLabel: "Starts ₹99",
    mode: "instant",
    warranty: "30-day service guarantee",
    subcategories: ["Tap & Faucet", "Leak Repair", "Basin & Sink", "Toilet", "Water Tank", "Pipeline", "Drainage", "Water Purifier", "Bathroom Fittings"],
    faqs: commonFaqs([
      { q: "What's included in the starting price?", a: "Inspection, labour and minor repair for the listed job. Spare parts, if needed, are charged extra at MRP — the plumber shows you the part and price before fitting it." },
      { q: "What if spare parts are needed?", a: "Our pro carries common parts (washers, spindles, connection pipes). Anything else is bought at MRP with your approval and added to the bill with a receipt." },
      { q: "What warranty do I get?", a: "A 30-day guarantee on workmanship. If the same issue recurs, we fix it again at no labour charge." },
    ]),
  },
  {
    slug: "electrician",
    name: "Electrician Services",
    shortName: "Electrician",
    icon: "⚡",
    tagline: "Fans, switches, wiring & lights — safely done",
    description: "Trained electricians for installations, repairs and safety checks. Available till 12:30 AM.",
    startingLabel: "Starts ₹129",
    mode: "instant",
    warranty: "30-day service guarantee",
    subcategories: ["Fan", "Switch & Socket", "Lights", "Wiring", "MCB & Fuse", "Appliance Install", "Inverter", "Doorbell"],
    faqs: commonFaqs([
      { q: "What's included in the starting price?", a: "Labour for the listed job and a basic safety check of the circuit. Switches, wires and fittings are charged at MRP if you don't have them." },
      { q: "Do you handle wiring for a full flat?", a: "Yes — book an inspection visit and the electrician will quote for concealed or open wiring after checking the load and layout." },
      { q: "What warranty do I get?", a: "A 30-day guarantee on workmanship for all electrical jobs." },
    ]),
  },
  {
    slug: "wall-designer",
    name: "Wall Design & Texture",
    shortName: "Wall Designer",
    icon: "🎨",
    tagline: "Textures, stencils & accent walls",
    description: "Designer accent walls, texture finishes and stencil art. Pick from a catalogue during a ₹199 design consultation, adjustable against your order.",
    startingLabel: "Starts ₹499",
    mode: "consultation",
    consultationFee: 199,
    warranty: "1-year workmanship warranty",
    subcategories: ["Wall Texture", "Stencil Art", "Accent Walls", "Kids Room", "Mandir/Pooja Wall", "Wallpaper"],
    accent: true,
    faqs: commonFaqs([
      { q: "How is custom wall design priced?", a: "Simple textures are fixed-price per wall. Custom murals and stencil combinations are quoted after a ₹199 consultation, and the fee is adjusted against your final order." },
      { q: "How long does a texture wall take?", a: "Most single walls take 1–2 days including drying time." },
      { q: "What warranty do I get?", a: "1-year workmanship warranty against peeling and cracking under normal use." },
    ]),
  },
  {
    slug: "pvc-panels",
    name: "PVC Panel & Wall Design",
    shortName: "PVC Panels",
    icon: "🏗️",
    tagline: "300+ panel designs, installed in a day",
    description: "PVC, WPC, fluted and charcoal panels — measured, designed and installed by our own team. Book a ₹49 measurement visit to start.",
    startingLabel: "Starts ₹880",
    mode: "consultation",
    consultationFee: 49,
    warranty: "5-year warranty on materials & installation",
    subcategories: ["PVC Panels", "WPC Panels", "PVC Fluted", "Charcoal Panels", "False Ceiling", "TV Unit Backdrop", "Mandir/Pooja Wall", "Accent Walls"],
    accent: true,
    faqs: commonFaqs([
      { q: "How does PVC panel booking work?", a: "Book a ₹49 measurement visit. Our expert measures the wall, shows 300+ designs on a tablet and gives an instant digital quote. Pay 50% advance for materials; installation happens in 1–2 days and you pay the balance after you're satisfied. The ₹49 is adjusted against your order." },
      { q: "Are the panels safe?", a: "We use Grade A, fire-resistant, recyclable panels. Charcoal and WPC ranges are moisture resistant and suitable for bathrooms' dry walls." },
      { q: "What warranty do I get?", a: "Up to 5 years on panels and installation, as stated on your quote for the chosen panel range." },
    ]),
  },
  {
    slug: "carpenter",
    name: "Carpenter Services",
    shortName: "Carpenter",
    icon: "🪚",
    tagline: "Locks, hinges, repairs & assembly",
    description: "Door, drawer, bed and cabinet repairs, lock installation and flat-pack furniture assembly.",
    startingLabel: "Starts ₹149",
    mode: "instant",
    warranty: "30-day service guarantee",
    subcategories: ["Door & Lock", "Hinges & Channels", "Furniture Repair", "Assembly", "Curtain & Blinds", "Shelves"],
    faqs: commonFaqs([
      { q: "Do you bring the lock or hardware?", a: "You can provide your own, or our carpenter brings branded hardware at MRP with a receipt." },
      { q: "Can you assemble furniture bought online?", a: "Yes, any flat-pack furniture — beds, wardrobes, tables and study units." },
      { q: "What warranty do I get?", a: "30-day guarantee on workmanship." },
    ]),
  },
  {
    slug: "furniture",
    name: "Custom Furniture Making",
    shortName: "Furniture",
    icon: "🪑",
    tagline: "TV units, wardrobes & modular kitchens",
    description: "Made-to-measure furniture built by our carpenters. Start with a ₹99 consultation — design, material samples and a fixed quote at your home.",
    startingLabel: "Consult ₹99",
    mode: "consultation",
    consultationFee: 99,
    warranty: "1-year workmanship warranty",
    subcategories: ["TV Unit", "Wardrobe", "Modular Kitchen", "Bed", "Study Table", "Shoe Rack", "Crockery Unit"],
    accent: true,
    faqs: commonFaqs([
      { q: "How is custom furniture priced?", a: "After a ₹99 consultation, you get a fixed quote based on size, material (ply, MDF, HDHMR) and finish (laminate, acrylic, veneer). The ₹99 is adjusted against your order." },
      { q: "How long does it take?", a: "Most TV units take 3–5 days; wardrobes and kitchens 7–15 days depending on size." },
      { q: "What warranty do I get?", a: "1-year workmanship warranty, plus manufacturer warranty on hardware." },
    ]),
  },
  {
    slug: "painting",
    name: "Painting & Texture",
    shortName: "Painting",
    icon: "🖌️",
    tagline: "Room & full-home painting, no mess",
    description: "Interior painting with masking, furniture covering and clean-up included. Premium emulsions and texture finishes.",
    startingLabel: "Starts ₹999",
    mode: "instant",
    warranty: "1-year workmanship warranty",
    subcategories: ["Single Wall", "Room Painting", "Full Home", "Waterproofing", "Texture Finish", "Wood Polish"],
    faqs: commonFaqs([
      { q: "Is paint included?", a: "Yes, for fixed-price jobs we include tractor or premium emulsion as listed. You can upgrade the brand on the day and pay the difference." },
      { q: "Do you move furniture?", a: "We cover and shift furniture within the room and clean up after the job." },
      { q: "What warranty do I get?", a: "1-year workmanship warranty against peeling under normal use." },
    ]),
  },
];

export const categoryBySlug = (slug: string) => CATEGORIES.find((c) => c.slug === slug);

type S = Omit<Service, "isActive" | "category"> & { isActive?: boolean };
const svc = (category: CategorySlug, list: S[]): Service[] =>
  list.map((s) => ({ ...s, category, isActive: s.isActive ?? true }));

export const SEED_SERVICES: Service[] = [
  ...svc("plumber", [
    { id: "plb-tap", sub: "Tap & Faucet", name: "Tap Repair / Replacement", description: "Fix dripping or broken taps, or replace with a new one you provide.", price: 99, durationMin: 30, rating: 0, reviewCount: 0, inclusions: ["Includes inspection & minor repair", "Spare parts charged extra at MRP"] },
    { id: "plb-mixer", sub: "Tap & Faucet", name: "Mixer / Shower Installation", description: "Install wall mixer, hand shower or overhead shower.", price: 249, durationMin: 60, rating: 0, reviewCount: 0, inclusions: ["Fitting with teflon & sealant", "Leak test after installation"] },
    { id: "plb-leak", sub: "Leak Repair", name: "Leak Detection & Repair", description: "Find and fix pipe, joint or concealed leaks.", price: 149, durationMin: 45, rating: 0, reviewCount: 0, inclusions: ["Wall leak, pipe leak, joint leak", "Waterproofing solutions available"] },
    { id: "plb-basin", sub: "Basin & Sink", name: "Basin / Sink Blockage", description: "Clear blocked wash basins and kitchen sinks.", price: 179, durationMin: 45, rating: 0, reviewCount: 0, inclusions: ["Manual & machine de-clogging", "Waste pipe check"] },
    { id: "plb-toilet", sub: "Toilet", name: "Flush Tank Repair", description: "Repair running or weak flush in western or Indian toilets.", price: 199, durationMin: 45, rating: 0, reviewCount: 0, inclusions: ["Valve & float adjustment", "Spare parts at MRP"] },
    { id: "plb-commode", sub: "Toilet", name: "Western Toilet Installation", description: "Install a new floor- or wall-mounted western commode.", price: 699, durationMin: 120, rating: 0, reviewCount: 0, inclusions: ["Removal of old seat", "Sealing & leak test"] },
    { id: "plb-tank", sub: "Water Tank", name: "Water Tank Cleaning (up to 1000 L)", description: "Mechanised cleaning and disinfection of overhead or sump tanks.", price: 549, durationMin: 90, rating: 0, reviewCount: 0, inclusions: ["Sludge removal", "Anti-bacterial spray"] },
    { id: "plb-pipe", sub: "Pipeline", name: "CPVC Pipeline Work (per point)", description: "New point or replacement of damaged CPVC/PPR pipe.", price: 299, durationMin: 60, rating: 0, reviewCount: 0, inclusions: ["Up to 3 ft pipe & fittings", "Pressure test"] },
    { id: "plb-drain", sub: "Drainage", name: "Drain Cleaning", description: "Clear bathroom or balcony floor drains.", price: 199, durationMin: 45, rating: 0, reviewCount: 0, inclusions: ["Spring / machine cleaning", "Odour trap check"] },
    { id: "plb-ro", sub: "Water Purifier", name: "Water Purifier Installation", description: "Wall-mount and connect your RO / UV purifier.", price: 349, durationMin: 60, rating: 0, reviewCount: 0, inclusions: ["Inlet valve & connection", "Drain pipe routing"] },
    { id: "plb-fittings", sub: "Bathroom Fittings", name: "Bathroom Accessory Fitting (up to 4)", description: "Towel rods, soap dishes, mirror, shelves.", price: 249, durationMin: 60, rating: 0, reviewCount: 0, inclusions: ["Drilling & anchoring", "Up to 4 accessories"] },
    { id: "plb-pkg-bath", sub: "Bathroom Fittings", name: "PACKAGE: Complete Bathroom Plumbing Check", description: "Full inspection of every fixture with minor repairs included.", price: 499, mrp: 649, durationMin: 90, rating: 0, reviewCount: 0, isPackage: true, inclusions: ["Full inspection of all fixtures", "Minor repairs included", "Leak test + drainage check"] },
  ]),
  ...svc("electrician", [
    { id: "ele-fan", sub: "Fan", name: "Ceiling Fan Installation", description: "Install a new ceiling fan (with down-rod) or replace an old one.", price: 149, durationMin: 45, rating: 0, reviewCount: 0, inclusions: ["Fan assembly & mounting", "Regulator connection"] },
    { id: "ele-fan-rep", sub: "Fan", name: "Fan Repair", description: "Fix noise, wobble, slow speed or capacitor issues.", price: 179, durationMin: 45, rating: 0, reviewCount: 0, inclusions: ["Diagnosis & repair", "Capacitor at MRP if needed"] },
    { id: "ele-switch", sub: "Switch & Socket", name: "Switchboard Repair", description: "Repair or replace faulty switches, sockets and boards.", price: 129, durationMin: 30, rating: 0, reviewCount: 0, inclusions: ["Up to 3 switches/sockets", "Parts at MRP"] },
    { id: "ele-light", sub: "Lights", name: "Light / Tubelight Installation", description: "Install tubelight, batten, wall or ceiling lights.", price: 99, durationMin: 30, rating: 0, reviewCount: 0, inclusions: ["Per fixture", "Wiring up to 2 m"] },
    { id: "ele-chandelier", sub: "Lights", name: "Chandelier Installation", description: "Assemble and hang a chandelier securely.", price: 499, durationMin: 90, rating: 0, reviewCount: 0, inclusions: ["Hook & support check", "Assembly"] },
    { id: "ele-wiring", sub: "Wiring", name: "New Wiring Point", description: "Add a new switch, socket or light point (open wiring).", price: 249, durationMin: 60, rating: 0, reviewCount: 0, inclusions: ["Up to 5 m wire", "Casing included"] },
    { id: "ele-mcb", sub: "MCB & Fuse", name: "MCB / Fuse Replacement", description: "Replace tripping MCBs or blown fuses.", price: 199, durationMin: 30, rating: 0, reviewCount: 0, inclusions: ["Load check", "MCB at MRP"] },
    { id: "ele-geyser", sub: "Appliance Install", name: "Geyser Installation", description: "Wall-mount and connect a storage or instant geyser.", price: 399, durationMin: 60, rating: 0, reviewCount: 0, inclusions: ["Electrical + plumbing connections", "Safety valve check"] },
    { id: "ele-tv", sub: "Appliance Install", name: "TV Wall Mounting", description: "Mount TVs up to 65\" on a wall bracket.", price: 349, durationMin: 60, rating: 0, reviewCount: 0, inclusions: ["Drilling & bracket fixing", "Bracket not included"] },
    { id: "ele-inverter", sub: "Inverter", name: "Inverter Installation", description: "Install inverter & battery with changeover wiring.", price: 599, durationMin: 90, rating: 0, reviewCount: 0, inclusions: ["Up to 3 load points", "Battery terminal check"] },
    { id: "ele-bell", sub: "Doorbell", name: "Doorbell Installation", description: "Install wired or wireless doorbells.", price: 129, durationMin: 30, rating: 0, reviewCount: 0, inclusions: ["Wiring up to 3 m"] },
    { id: "ele-pkg-safety", sub: "Wiring", name: "PACKAGE: Home Electrical Safety Check", description: "Earthing, MCB, load and wiring health check for a 2–3 BHK.", price: 399, mrp: 549, durationMin: 90, rating: 0, reviewCount: 0, isPackage: true, inclusions: ["Earthing & leakage test", "MCB panel inspection", "Minor fixes included"] },
  ]),
  ...svc("wall-designer", [
    { id: "wd-consult", sub: "Accent Walls", name: "Wall Design Consultation", description: "Designer visit with catalogue, colour samples and a fixed quote.", price: 199, durationMin: 60, rating: 0, reviewCount: 0, isConsultation: true, inclusions: ["₹199 adjustable against your order", "Digital mock-up for one wall"] },
    { id: "wd-texture", sub: "Wall Texture", name: "Wall Texture Design (per wall)", description: "Roller or trowel texture on one wall up to 120 sq ft.", price: 499, unit: "/wall", durationMin: 240, rating: 0, reviewCount: 0, inclusions: ["Primer + texture coat", "Choice of 40 textures"] },
    { id: "wd-stencil", sub: "Stencil Art", name: "Stencil Art Wall", description: "Single-colour stencil pattern on a painted wall.", price: 1499, unit: "/wall", durationMin: 240, rating: 0, reviewCount: 0, inclusions: ["Stencil & paint included", "Up to 120 sq ft"] },
    { id: "wd-kids", sub: "Kids Room", name: "Kids Room Theme Wall", description: "Hand-painted theme wall — jungle, space, ocean and more.", price: 3999, unit: "/wall", durationMin: 240, rating: 0, reviewCount: 0, inclusions: ["Design preview", "Washable paint"] },
    { id: "wd-wallpaper", sub: "Wallpaper", name: "Wallpaper Installation", description: "Install wallpaper rolls you choose from our catalogue.", price: 45, unit: "/sq ft", durationMin: 120, rating: 0, reviewCount: 0, inclusions: ["Wall prep & adhesive", "Material included"] },
  ]),
  ...svc("pvc-panels", [
    { id: "pvc-measure", sub: "PVC Panels", name: "PVC Panel Measurement Visit", description: "Expert measures the wall, shows 300+ designs on a tablet and gives an instant quote.", price: 49, durationMin: 60, rating: 0, reviewCount: 0, isConsultation: true, inclusions: ["₹49 adjustable against your order", "Instant digital quote"] },
    { id: "pvc-full-wall", sub: "PVC Panels", name: "Full Wall PVC Sheet (up to 120 sq ft)", description: "Plain-finish PVC sheet cladding for one wall.", price: 6000, durationMin: 210, rating: 0, reviewCount: 0, inclusions: ["Materials, trims & installation", "3–4 hours"] },
    { id: "pvc-ceiling", sub: "False Ceiling", name: "PVC False Ceiling Consultation", description: "Measurement and design for PVC / gypsum false ceilings with lighting plan.", price: 49, durationMin: 60, rating: 0, reviewCount: 0, isConsultation: true, inclusions: ["Cove-light layout", "Adjustable against order"] },
    { id: "pvc-tv", sub: "TV Unit Backdrop", name: "TV Backdrop Panel Consultation", description: "Fluted / charcoal TV backdrop design with LED profile options.", price: 49, durationMin: 60, rating: 0, reviewCount: 0, isConsultation: true, inclusions: ["3D layout on tablet", "Adjustable against order"] },
  ]),
  ...svc("carpenter", [
    { id: "car-lock", sub: "Door & Lock", name: "Door Lock Installation", description: "Install main-door, bedroom or digital locks.", price: 199, durationMin: 60, rating: 0, reviewCount: 0, inclusions: ["Drilling & alignment", "Lock not included"] },
    { id: "car-door", sub: "Door & Lock", name: "Door Repair / Alignment", description: "Fix doors that stick, sag or don't close.", price: 249, durationMin: 60, rating: 0, reviewCount: 0, inclusions: ["Hinge tightening & planing"] },
    { id: "car-hinge", sub: "Hinges & Channels", name: "Hinge / Drawer Channel Replacement", description: "Replace cabinet hinges or drawer channels.", price: 149, durationMin: 30, rating: 0, reviewCount: 0, inclusions: ["Up to 2 hinges/channels", "Parts at MRP"] },
    { id: "car-bed", sub: "Furniture Repair", name: "Bed / Sofa Repair", description: "Fix loose joints, broken slats or wobbly frames.", price: 349, durationMin: 90, rating: 0, reviewCount: 0, inclusions: ["Joint fixing & reinforcement"] },
    { id: "car-assembly", sub: "Assembly", name: "Furniture Assembly", description: "Assemble flat-pack beds, wardrobes, tables and units.", price: 299, durationMin: 90, rating: 0, reviewCount: 0, inclusions: ["Per item", "Packaging disposal"] },
    { id: "car-curtain", sub: "Curtain & Blinds", name: "Curtain Rod / Blinds Installation", description: "Install curtain rods, tracks or blinds per window.", price: 149, durationMin: 30, rating: 0, reviewCount: 0, inclusions: ["Drilling & brackets"] },
    { id: "car-shelf", sub: "Shelves", name: "Wall Shelf Installation", description: "Mount floating or bracket shelves.", price: 149, durationMin: 30, rating: 0, reviewCount: 0, inclusions: ["Up to 2 shelves"] },
  ]),
  ...svc("furniture", [
    { id: "fur-consult", sub: "TV Unit", name: "Custom Furniture Consultation", description: "Carpenter-designer visit with measurements, material samples and a fixed quote.", price: 99, durationMin: 60, rating: 0, reviewCount: 0, isConsultation: true, inclusions: ["₹99 adjustable against your order", "Material & finish samples"] },
    { id: "fur-tv", sub: "TV Unit", name: "Custom TV Unit (consultation)", description: "Wall-mounted or floor TV unit with storage — from ₹8,000. Quote finalised at visit.", price: 99, durationMin: 60, rating: 0, reviewCount: 0, isConsultation: true, inclusions: ["From ₹8,000 · 3–5 days", "Fee adjustable against order"] },
    { id: "fur-wardrobe", sub: "Wardrobe", name: "Custom Wardrobe (consultation)", description: "Sliding or hinged wardrobes in ply / HDHMR — from ₹1,200/sq ft.", price: 99, durationMin: 60, rating: 0, reviewCount: 0, isConsultation: true, inclusions: ["From ₹1,200/sq ft · 7–10 days", "Fee adjustable against order"] },
    { id: "fur-kitchen", sub: "Modular Kitchen", name: "Modular Kitchen (consultation)", description: "L, U or parallel modular kitchens with soft-close hardware.", price: 99, durationMin: 90, rating: 0, reviewCount: 0, isConsultation: true, inclusions: ["3D design", "Fee adjustable against order"] },
  ]),
  ...svc("painting", [
    { id: "pnt-wall", sub: "Single Wall", name: "Single Wall Painting", description: "Repaint one wall up to 120 sq ft with premium emulsion.", price: 999, durationMin: 240, rating: 0, reviewCount: 0, inclusions: ["Masking & clean-up", "Paint included"] },
    { id: "pnt-room", sub: "Room Painting", name: "Room Painting (up to 12×12 ft)", description: "Walls + ceiling of one room, two coats.", price: 3999, durationMin: 240, rating: 0, reviewCount: 0, inclusions: ["Putty touch-up", "Furniture covering"] },
    { id: "pnt-texture", sub: "Texture Finish", name: "Texture Finish Wall", description: "Royale Play-style texture on one wall.", price: 2499, unit: "/wall", durationMin: 240, rating: 0, reviewCount: 0, inclusions: ["Primer + texture", "Up to 120 sq ft"] },
    { id: "pnt-inspect", sub: "Full Home", name: "Full Home Painting Inspection", description: "Free-of-guesswork quote for full-home painting after a site visit.", price: 49, durationMin: 60, rating: 0, reviewCount: 0, isConsultation: true, inclusions: ["Moisture & crack check", "Adjustable against order"] },
    { id: "pnt-water", sub: "Waterproofing", name: "Terrace / Wall Waterproofing (per 100 sq ft)", description: "Crack filling and waterproof coating.", price: 2999, durationMin: 240, rating: 0, reviewCount: 0, inclusions: ["2 coats", "1-year warranty"] },
    { id: "pnt-polish", sub: "Wood Polish", name: "Wood Polish (per door)", description: "Melamine polish for doors and frames.", price: 1299, durationMin: 240, rating: 0, reviewCount: 0, inclusions: ["Sanding & 2 coats"] },
  ]),
];

/* ---------- PVC / WPC panel catalogue ---------- */
export interface Panel {
  id: string;
  name: string;
  type: "PVC" | "WPC" | "PVC Fluted" | "Charcoal";
  pattern: "wood" | "floral" | "stone" | "geometric" | "ceramic" | "fluted" | "charcoal" | "marble";
  color: "Brown" | "White" | "Grey" | "Black" | "Beige";
  size: string;
  coverageSqft: number;
  price: number;
}

export const PANELS: Panel[] = [
  { id: "p-wood", name: "Plain Wood", type: "PVC", pattern: "wood", color: "Brown", size: "9.5 ft × 16 in", coverageSqft: 12.6, price: 880 },
  { id: "p-floral", name: "Floral", type: "PVC", pattern: "floral", color: "Beige", size: "9.5 ft × 16 in", coverageSqft: 12.6, price: 880 },
  { id: "p-stone", name: "Stone", type: "PVC", pattern: "stone", color: "Grey", size: "9.5 ft × 16 in", coverageSqft: 12.6, price: 880 },
  { id: "p-geo", name: "Geometric", type: "PVC", pattern: "geometric", color: "White", size: "9.5 ft × 16 in", coverageSqft: 12.6, price: 880 },
  { id: "p-marble", name: "Statuario Marble", type: "PVC", pattern: "marble", color: "White", size: "8 ft × 4 ft sheet", coverageSqft: 32, price: 2650 },
  { id: "w-ceramic", name: "WPC Ceramic", type: "WPC", pattern: "ceramic", color: "Beige", size: "9.5 ft × 16 in", coverageSqft: 12.6, price: 1350 },
  { id: "w-teak", name: "WPC Teak Grain", type: "WPC", pattern: "wood", color: "Brown", size: "9.5 ft × 16 in", coverageSqft: 12.6, price: 1350 },
  { id: "f-fluted", name: "PVC Fluted", type: "PVC Fluted", pattern: "fluted", color: "Beige", size: "9.5 ft × 6 in", coverageSqft: 4.75, price: 1440 },
  { id: "f-walnut", name: "Fluted Walnut", type: "PVC Fluted", pattern: "fluted", color: "Brown", size: "9.5 ft × 6 in", coverageSqft: 4.75, price: 1440 },
  { id: "c-charcoal", name: "Charcoal Louver", type: "Charcoal", pattern: "charcoal", color: "Black", size: "8 ft × 4 ft sheet", coverageSqft: 32, price: 3800 },
];
export const TRIM_PRICE = 90;
export const TRIM_LENGTH_FT = 9.5;

/** Estimate panels + trims for a wall. Panel prices include delivery & installation. */
export function estimateWall(widthFt: number, heightFt: number, panel: Panel) {
  const area = Math.max(0, widthFt) * Math.max(0, heightFt);
  if (!area) return { area: 0, panels: 0, trims: 0, panelCost: 0, trimCost: 0, total: 0 };
  const panels = Math.ceil((area * 1.05) / panel.coverageSqft); // 5% wastage
  const trims = Math.ceil((2 * (widthFt + heightFt)) / TRIM_LENGTH_FT);
  const panelCost = panels * panel.price;
  const trimCost = trims * TRIM_PRICE;
  return { area, panels, trims, panelCost, trimCost, total: panelCost + trimCost };
}

/* ---------- Gallery ---------- */
export type ArtVariant =
  | "fluted" | "wpc" | "texture" | "tv-unit" | "ceiling" | "paint" | "wardrobe" | "charcoal" | "mandir" | "stencil" | "kitchen" | "bathroom";

/** Design ideas (illustrated) with typical duration and cost — not photos of specific customer jobs. */
export interface GalleryItem {
  id: string;
  title: string;
  category: CategorySlug;
  filter: "PVC Panels" | "Wall Design" | "Furniture" | "Carpentry" | "Painting";
  duration: string;
  cost: number;
  after: ArtVariant;
}

export const GALLERY: GalleryItem[] = [
  { id: "g1", title: "Fluted PVC Living Room", category: "pvc-panels", filter: "PVC Panels", duration: "2 days", cost: 12000, after: "fluted" },
  { id: "g2", title: "TV Unit Design", category: "furniture", filter: "Furniture", duration: "3 days", cost: 18000, after: "tv-unit" },
  { id: "g3", title: "False Ceiling with Cove Lights", category: "pvc-panels", filter: "PVC Panels", duration: "1 day", cost: 8000, after: "ceiling" },
  { id: "g4", title: "WPC Bedroom Accent Wall", category: "pvc-panels", filter: "PVC Panels", duration: "1 day", cost: 9500, after: "wpc" },
  { id: "g5", title: "Trowel Texture Feature Wall", category: "wall-designer", filter: "Wall Design", duration: "2 days", cost: 4500, after: "texture" },
  { id: "g6", title: "Charcoal TV Backdrop", category: "pvc-panels", filter: "PVC Panels", duration: "1 day", cost: 14500, after: "charcoal" },
  { id: "g7", title: "Sliding Wardrobe", category: "furniture", filter: "Furniture", duration: "8 days", cost: 62000, after: "wardrobe" },
  { id: "g8", title: "Pooja Wall with Jali Panel", category: "wall-designer", filter: "Wall Design", duration: "2 days", cost: 11000, after: "mandir" },
  { id: "g9", title: "Living Room Repaint", category: "painting", filter: "Painting", duration: "2 days", cost: 7800, after: "paint" },
  { id: "g10", title: "Stencil Art Dining Wall", category: "wall-designer", filter: "Wall Design", duration: "1 day", cost: 2400, after: "stencil" },
  { id: "g11", title: "Kitchen Shelves & Shutters", category: "carpenter", filter: "Carpentry", duration: "1 day", cost: 5200, after: "kitchen" },
  { id: "g12", title: "Bathroom Vanity & Mirror Cabinet", category: "carpenter", filter: "Carpentry", duration: "1 day", cost: 6900, after: "bathroom" },
];

/* ---------- Localities (for search & SEO pages; filtered to the service radius at runtime) ---------- */
export interface Locality {
  slug: string;
  name: string;
  pin: string;
  lat: number;
  lng: number;
}

export const LOCALITIES: Locality[] = [
  { slug: "hsr-layout", name: "HSR Layout", pin: "560102", lat: 12.9116, lng: 77.6389 },
  { slug: "hsr-layout-sector-1", name: "HSR Layout Sector 1", pin: "560102", lat: 12.92, lng: 77.648 },
  { slug: "hsr-layout-sector-2", name: "HSR Layout Sector 2", pin: "560102", lat: 12.913, lng: 77.645 },
  { slug: "hsr-layout-sector-3", name: "HSR Layout Sector 3", pin: "560102", lat: 12.909, lng: 77.642 },
  { slug: "hsr-layout-sector-6", name: "HSR Layout Sector 6", pin: "560102", lat: 12.906, lng: 77.633 },
  { slug: "hsr-layout-sector-7", name: "HSR Layout Sector 7", pin: "560102", lat: 12.912, lng: 77.631 },
  { slug: "agara", name: "Agara", pin: "560102", lat: 12.923, lng: 77.641 },
  { slug: "parangi-palya", name: "Parangi Palya", pin: "560102", lat: 12.915, lng: 77.626 },
  { slug: "somasundarapalya", name: "Somasundarapalya", pin: "560102", lat: 12.903, lng: 77.646 },
  { slug: "mangammanapalya", name: "Mangammanapalya", pin: "560068", lat: 12.902, lng: 77.629 },
  { slug: "koramangala-1st-block", name: "Koramangala 1st Block", pin: "560034", lat: 12.925, lng: 77.629 },
  // Further from base — only excluded if a service radius is configured.
  { slug: "indiranagar", name: "Indiranagar", pin: "560038", lat: 12.9784, lng: 77.6408 },
  { slug: "whitefield", name: "Whitefield", pin: "560066", lat: 12.9698, lng: 77.75 },
  { slug: "jayanagar", name: "Jayanagar", pin: "560041", lat: 12.925, lng: 77.5938 },
];
