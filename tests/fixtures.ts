import type { Provider } from "../src/lib/types.ts";

const P = (id: string, name: string, categories: Provider["categories"], rating = 4.5): Provider => ({
  id, name, phone: "+91900000" + id.length.toString().padStart(4, "0"), pin: "1234", categories, speciality: "", experienceYears: 3,
  joined: "2026-01", rating, totalJobs: 10, aadhaarVerified: true, policeVerified: true, isActive: true,
  servicesOffered: [], certifications: [], gallery: [], leaveDates: [], avatarHue: 200,
});

export const TEST_PROVIDERS: Provider[] = [P("pro-a", "Test Plumber A", ["plumber"], 4.8), P("pro-b", "Test Plumber B", ["plumber"], 4.6), P("pro-c", "Test Electrician", ["electrician"])];
