export type CategorySlug =
  | "plumber"
  | "electrician"
  | "wall-designer"
  | "pvc-panels"
  | "carpenter"
  | "furniture"
  | "painting";

export type BookingMode = "instant" | "consultation";

export interface Faq {
  q: string;
  a: string;
}

export interface Category {
  slug: CategorySlug;
  name: string;
  shortName: string;
  icon: string;
  tagline: string;
  description: string;
  startingLabel: string;
  mode: BookingMode;
  consultationFee?: number;
  warranty: string;
  bookingsLabel: string;
  subcategories: string[];
  /** Seeded aggregate rating histogram [5★,4★,3★,2★,1★] for demo data */
  histogram: [number, number, number, number, number];
  faqs: Faq[];
  accent?: boolean;
}

export interface Service {
  id: string;
  category: CategorySlug;
  sub: string;
  name: string;
  description: string;
  price: number;
  /** Price before package discount (packages only) */
  mrp?: number;
  unit?: string;
  durationMin: number;
  rating: number;
  reviewCount: number;
  inclusions: string[];
  exclusions?: string[];
  isPackage?: boolean;
  isConsultation?: boolean;
  isActive: boolean;
}

export interface Provider {
  id: string;
  name: string;
  phone: string;
  /** 4-digit PIN for the provider dashboard (demo auth) */
  pin: string;
  categories: CategorySlug[];
  speciality: string;
  experienceYears: number;
  joined: string; // YYYY-MM
  rating: number;
  totalJobs: number;
  aadhaarVerified: boolean;
  policeVerified: boolean;
  isActive: boolean;
  servicesOffered: string[];
  certifications: string[];
  gallery: string[]; // WallArt variants
  leaveDates: string[]; // YYYY-MM-DD
  avatarHue: number;
}

export type BookingStatus =
  | "confirmed"
  | "assigned"
  | "on_way"
  | "started"
  | "completed"
  | "cancelled";

export interface BookingItem {
  serviceId: string;
  name: string;
  price: number;
  qty: number;
  durationMin: number;
}

export interface Quote {
  subtotal: number;
  visitingCharge: number;
  visitingWaived: boolean;
  discount: number;
  discountLabel?: string;
  taxable: number;
  gst: number;
  total: number;
}

export interface Address {
  line1: string; // flat / house
  building: string;
  landmark?: string;
  locality: string;
  pin: string;
  lat: number;
  lng: number;
}

export interface StatusEvent {
  status: BookingStatus;
  at: string; // ISO
  note?: string;
}

export interface Booking {
  id: string; // booking number e.g. HS-2026-1125-0042
  customerPhone: string;
  customerName: string;
  customerEmail?: string;
  category: CategorySlug;
  items: BookingItem[];
  quote: Quote;
  date: string; // YYYY-MM-DD (operating day)
  slot: number; // minutes from operating-day midnight (540..1440)
  address: Address;
  distanceM: number;
  notes: string;
  photos: string[]; // data URLs (compressed)
  providerId?: string;
  status: BookingStatus;
  timeline: StatusEvent[];
  paymentMethod: "after_service" | "online";
  paymentStatus: "pending" | "paid" | "refunded";
  paymentRef?: string;
  startOtp: string;
  endOtp: string;
  reviewId?: string;
  cancelFee?: number;
  rescheduleCount: number;
  createdAt: string;
}

export interface Review {
  id: string;
  bookingId?: string;
  customerName: string;
  providerId?: string;
  serviceId?: string;
  category: CategorySlug;
  serviceName: string;
  rating: number;
  text: string;
  createdAt: string;
  hidden?: boolean;
  adminReply?: string;
  flagged?: boolean;
}

export interface Customer {
  phone: string;
  name: string;
  email?: string;
  createdAt: string;
}

export interface Promo {
  code: string;
  percent: number;
  maxOff: number;
  minOrder: number;
  active: boolean;
}

export interface Settings {
  /** Max bookings per slot per category; 0/undefined = number of active providers */
  slotCapacity: Partial<Record<CategorySlug, number>>;
  /** Blocked slots: key `${date}|${slot}` or `${date}|*` for the whole day */
  blocked: string[];
}

export interface NotificationLog {
  id: string;
  at: string;
  to: string;
  channel: "sms" | "whatsapp" | "email";
  audience: "customer" | "provider";
  bookingId?: string;
  message: string;
}
