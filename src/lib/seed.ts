import type { Provider, Review, Settings } from "./types.ts";

/** No sample professionals: add your real team in Admin → Providers. */
export const SEED_PROVIDERS: Provider[] = [];

/** IDs/phones of the demo professionals shipped in early builds — removed from existing data on load. */
export const LEGACY_DEMO_PROVIDER_IDS = ["rajesh-kumar", "mohammed-irfan", "suresh-babu", "venkatesh-r", "anil-shetty", "deepak-yadav", "kavya-nair", "ramesh-gowda", "sunil-sharma", "imran-khan", "manjunath-s"];

/** No sample reviews: only real customers' reviews are shown. */
export function seedReviews(): Review[] {
  return [];
}

export const DEFAULT_SETTINGS: Settings = { slotCapacity: {}, blocked: [] };
