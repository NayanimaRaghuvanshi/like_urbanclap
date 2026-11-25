# HomeServ — Hyperlocal Home Services (2 km radius)

A working implementation of the HomeServ PRD: a managed, fixed-price home-services marketplace with
instant bookings (plumber, electrician, carpenter, painting) and consultation-first bookings
(PVC/WPC panels, wall design, custom furniture), served only within **2 km** of the business base,
**9:00 AM – 12:30 AM**, 7 days a week.

Built with **Next.js 14 (App Router) + TypeScript + Tailwind CSS**, Zod validation and Leaflet/OpenStreetMap.

## Quick start

```bash
npm install
cp .env.example .env.local   # optional – defaults work out of the box
npm run dev                  # http://localhost:3000
```

```bash
npm test          # unit tests: slots, IST time, availability, 2 km check, pricing, SEO routes
npm run build     # production build + type check
```

### Demo logins

| Who | Where | Credentials |
|---|---|---|
| Customer | `/book`, `/my-bookings` | any Indian mobile number — OTP is shown on screen while `OTP_DEV_MODE=true` |
| Provider (plumber) | `/pro` | `9800000001` / PIN `1111` (Rajesh) · `9800000002` / `2222` (Irfan) |
| Provider (panels) | `/pro` | `9800000005` / PIN `5555` (Anil) |
| Admin | `/admin` | password `admin123` (`ADMIN_PASSWORD`) |

All 11 seeded providers have phones `98000000NN`; see `src/lib/seed.ts`.

### End-to-end flow to try

1. Home → enter "Agara" → ✅ serviceable (try "Indiranagar" for the waitlist modal).
2. Plumber → add *Tap Repair* + *Leak Detection* → View Cart.
3. Pick a slot → address (map pin + 2 km circle) → OTP → notes → Review → **Confirm**.
4. Tracking page shows the assigned pro, the **start OTP** and the status timeline.
5. Log in at `/pro` as the assigned pro → *On the way* → enter start OTP → customer's page reveals the
   **end OTP** → *Complete job* → *Mark collected*.
6. Customer rates the job, downloads the GST invoice. Admin sees it all, including the notification log.

## What's implemented (PRD mapping)

| PRD area | Where |
|---|---|
| Homepage: hero + serviceability check + live next slot, category grid, how-it-works, before/after gallery, rate card, histogram + reviews (incl. negative), trust section, footer | `src/app/page.tsx` |
| Category pages: sub-category chips, service cards, package "SAVE ₹X", details bottom-sheet, sticky cart bar, histogram, 1★ reviews, FAQ accordion + JSON-LD | `src/app/services/[slug]` |
| PVC flow: 6-step how-it-works, ₹49 measurement visit, filterable panel catalogue, price calculator | `src/components/PanelCatalog.tsx` |
| Booking flow (5 steps): cart & offers & promo → date/slot grid → address + Leaflet map + 2 km check + waitlist → phone OTP, name, email, mandatory notes (250 chars), up to 3 compressed photos → review with GST, pay-after-service / pay-now, T&C | `src/app/book/BookingFlow.tsx` |
| Confirmation & tracking: "Meet your pro" card, status timeline, start/end OTPs, reschedule, cancel (₹50 late fee), review, invoice | `src/app/track/[id]` |
| My Bookings: Upcoming / Completed / Cancelled tabs, rebook, invoice, review | `src/app/my-bookings` |
| Provider profiles (+ all reviews) | `src/app/providers` |
| Provider dashboard: jobs, OTP collection, on-the-way, collect payment, leave days, earnings, reviews | `src/app/pro` |
| Admin: bookings (assign/reassign/advance/cancel), providers CRUD + verification flags, services & pricing CRUD, slot capacity + blocked slots, review moderation & public replies, promos, customers, analytics (category, popular services, localities, demand heatmap), waitlist/contact/notification inbox | `src/app/admin` |
| Locality SEO pages `/bangalore-<service>-<locality>` with LocalBusiness/Service/FAQ JSON-LD, sitemap, robots | `src/app/[seo]`, `src/app/sitemap.ts` |
| Gallery, About, Contact, FAQs, Terms, Privacy, 404 | `src/app/*` |

### Business rules (single source: `src/lib/config.ts`)

- **Slots**: 30-minute starts, 9:00 AM → 12:00 AM (31 slots; last job ends 12:30 AM). A job must be able to
  finish by 12:30 AM, so a 60-min consultation's last start is 11:30 PM.
- **Booking window**: ≥ 1 hour ahead, ≤ 7 days. All times are IST.
- **Availability**: a slot is open when an active, non-on-leave pro in that category is free for the job's
  full duration (capped at 4 h/day per booking), minus unassigned bookings, limited by admin capacity and
  blocked slots. Bookings auto-assign the least-loaded, highest-rated free pro.
- **Pricing**: ₹49 visiting charge under ₹499 (waived at ₹499+; not applied to consultations);
  10% off above ₹500, max ₹200 (a promo code replaces it if better); GST 18%. Prices are always
  recomputed server-side.
- **Cancellation**: free up to 2 h before the slot, ₹50 after; reschedule allowed up to 2 h before.
- **Serviceability**: haversine distance ≤ 2,000 m from `NEXT_PUBLIC_BASE_LAT/LNG`
  (mirrors PostGIS `ST_DWithin` in `db/schema.sql`).

## What is simulated (swap before launch)

| Concern | Current | Production swap |
|---|---|---|
| Database | JSON file in `.data/db.json` via `src/lib/db.ts` (auto-seeded) | PostgreSQL + PostGIS — schema in `db/schema.sql` |
| SMS / WhatsApp / email | Logged to Admin → Inbox (`src/lib/notify.ts`) | MSG91/Twilio + Gupshup/Interakt + Resend/SES in `deliver()` |
| OTP delivery | Code returned to the browser when `OTP_DEV_MODE=true` | Set `OTP_DEV_MODE=false` + SMS provider |
| Payments | Simulated checkout when Razorpay keys are absent | Set `RAZORPAY_KEY_ID/SECRET` — real orders + signature verification are already wired (`src/lib/payments.ts`). Add refunds for paid-then-cancelled bookings. |
| Maps | Leaflet + OpenStreetMap tiles, locality list for autocomplete | Google Places / Ola Maps autocomplete if desired |
| Images | Illustrated SVG before/after scenes and panel swatches | Real project photos (WebP) |
| Reviews, ratings, providers | Sample data, flagged by the purple demo banner (`NEXT_PUBLIC_DEMO_MODE=false` hides it) | Real data only — the PRD's "we only claim what we verify" |
| Admin auth | Single shared password | Proper staff accounts / SSO |

The JSON store is single-process; deploy on one Node instance (e.g. Railway/Render with a volume) or
move to Postgres before running on serverless (Vercel).

## Project layout

```
src/
  app/                 pages + API route handlers (app/api/*)
  components/          UI (client components) – store, slot picker, map, gallery, OTP login …
  lib/
    config.ts          business constants (radius, hours, GST, fees)
    slots.ts geo.ts pricing.ts   pure logic (unit-tested)
    catalog.ts seed.ts categories, services, panels, gallery, localities, demo providers/reviews
    db.ts bookings.ts payments.ts session.ts notify.ts   server-side services
db/schema.sql          production Postgres/PostGIS schema
tests/                 node:test unit tests
```
