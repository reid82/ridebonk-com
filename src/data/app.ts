// The live App Store listing. Ride Bonk shipped 2026-08-06.
//
// storeUrl deliberately omits the storefront segment (/au/). Apple
// geo-redirects apps.apple.com/app/id<n> to the visitor's own
// storefront; hardcoding /au/ sends everyone else through a redirect.
export const APP = {
  id: "6762967904",
  name: "Ride Bonk",
  storeUrl: "https://apps.apple.com/app/id6762967904",
  price: "0",
  currency: "AUD",
  minimumOs: "15.0",
  category: "HealthApplication",
  released: "2026-08-06",
} as const;
