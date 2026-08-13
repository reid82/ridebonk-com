# ridebonk.com launch update — design

**Date:** 2026-08-13
**Status:** approved

## Context

Ride Bonk shipped to the App Store on 6 August 2026. The site still
describes a pre-release app: the CTA points at TestFlight, the masthead
reads `In Development`, and the OG image every share renders says
`it's not done`.

Live listing facts (from the iTunes lookup API, 2026-08-13):

| Field | Value |
| --- | --- |
| Store name | Ride Bonk |
| App ID | 6762967904 |
| Price | Free |
| Category | Health & Fitness (secondary: Sports) |
| Minimum iOS | 15.0 |
| Released | 2026-08-06 |
| Version | 1.0 |
| Seller | Alexell Media Pty Ltd |

## Scope

In scope: App Store CTA and badge, SEO/meta/OG for launch, and the two
lines of copy that are now factually false.

Out of scope: rewriting the lede, the seven itches, `What it isn't`, or
the Colophon. The self-deprecating voice is the site's personality and
remains true of a v1.0 built by one person.

## What changes

### 1. `src/data/app.ts` — single source of truth

New plain-TS module exporting the live listing facts:

```ts
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
```

`storeUrl` deliberately omits the `/au/` storefront segment. Apple
geo-redirects `apps.apple.com/app/id<n>` to the visitor's own
storefront; hardcoding `/au/` sends overseas visitors through a
redirect and can show them an unavailable-in-your-region interstitial.

`SubscribeCard.astro`, `index.astro`'s head, and the JSON-LD block all
import from here. It exists because `.astro` components are not
unit-testable in this repo's vitest setup, but a TS module is — this
puts the facts most likely to be wrong (the store URL, the app ID)
under test.

### 2. `SubscribeCard.astro` — App Store CTA

Replaces the TestFlight CTA entirely. The `testflightUrl` const is
removed; the Discord and email contact line is unchanged.

New structure: heading, one short true paragraph, the official Apple
**Download on the App Store** badge, then the contact line.

Badge handling per Apple's Marketing Resources and Identity
Guidelines:

- Apple's supplied SVG artwork, vendored into
  `public/download-on-the-app-store.svg`. Not redrawn, not recoloured.
- Minimum height 40px.
- Clear space on all sides of at least 10% of the badge height.
- Links to `APP.storeUrl`.

The badge is black on a cream zine layout and will read as a foreign
object. It sits on the existing hard-shadow treatment so it looks
placed rather than pasted; the artwork itself is untouched, which is
the part Apple's guidelines are strict about.

### 3. Head: SEO, meta, OG

In `index.astro`:

- `<title>` → `Ride Bonk | a workout app i made for myself`. The store
  name currently appears nowhere on the page; someone searching the
  name Apple lists finds nothing. The lowercase voice survives.
- `description` and `og:description` → present tense, no "it's not
  done".
- `<link rel="canonical">`.
- `og:site_name`, `og:image:width` (1200), `og:image:height` (630),
  `og:image:alt`.
- Full `twitter:title` / `twitter:description` / `twitter:image`
  (currently only `twitter:card` is set, so X falls back to the OG
  tags — explicit is better and costs nothing).
- `<meta name="apple-itunes-app" content="app-id=6762967904">` — iOS
  Safari renders a native smart banner straight to the listing.
- JSON-LD `SoftwareApplication`: name, `applicationCategory`
  `HealthApplication`, `operatingSystem` `iOS 15.0+`, `offers` at price
  0 AUD, `url` = store URL. Lets Google render an app result rather
  than a plain blue link.

In `LegalLayout.astro`: canonical and OG tags, which it has neither of.
It already takes a `url` prop, so canonical is a one-line addition.

### 4. Sitemap

`public/robots.txt` advertises `https://ridebonk.com/sitemap-index.xml`,
which 404s — nothing generates it. Install `@astrojs/sitemap` and add
it to `astro.config.mjs` integrations. `site` is already set to
`https://ridebonk.com`, which the integration requires.

Chosen over the alternative (delete the line from `robots.txt`) because
the site has three indexable pages and generating the file is a
two-line change.

### 5. OG image

`scripts/make-og.mjs` renders the strap and the tagline as literal
strings in an inline SVG. Update:

- `VOL. 0 / IN DEVELOPMENT / SOMEWHERE IN AUSTRALIA` → `VOL. 1 / ON THE
  APP STORE / SOMEWHERE IN AUSTRALIA`
- `it's not done.` → `it's out now.`

Regenerate `public/og.png`.

`sharp` is imported by the script but is not in `package.json` — it has
been run against an ambient install. Add it as a devDependency so
regenerating the OG image is reproducible.

### 6. Copy

Exactly two edits:

- `Masthead.astro` strap: `Vol. 0 / In Development / Somewhere in
  Australia` → `Vol. 1 / On the App Store / Somewhere in Australia`
- `Lede.astro`: `It's not done.` → `It's out now. It's still not done.`

Nothing else in the body copy is touched.

## Testing

The repo runs vitest with jsdom and testing-library. Existing coverage
is a smoke test and `CoachWidget.test.tsx`.

New `tests/data/app.test.ts`:

- store URL contains the app ID and is storefront-neutral (no `/au/`)
- app ID is the numeric ID Apple assigned
- price is free and the category is one Schema.org recognises

These assert the facts that break the CTA if wrong. The `.astro`
components are verified by building and inspecting `dist/index.html`
rather than by unit test — see below.

## Verification

1. `npm test` passes.
2. `npm run typecheck` passes (`astro check && tsc --noEmit`).
3. `npm run build` succeeds and `dist/` contains `sitemap-index.xml`.
4. `dist/index.html` contains: the store URL, `apple-itunes-app`, the
   canonical link, the JSON-LD block, and no occurrence of
   `testflight`.
5. `npm run dev` served on `0.0.0.0`, checked at desktop and 390px
   widths: badge renders at ≥40px with its clear space intact and the
   layout does not shift.
6. `public/og.png` visually inspected after regeneration.

## Deployment

Not performed as part of this work. `wrangler` has no stored
credentials on this machine and the repo deploys via Cloudflare Pages
on push. The change lands as a commit; publishing is a separate manual
step — either a push to `main`, or `npm run deploy` once wrangler is
authenticated.

## Notes

Two repos exist: `reid82/ridebonk-com` (public, May 2026) and
`reid82/ridebonk.com` (private, Apr 2026). This work targets
`ridebonk-com`, whose source matches the HTML currently served at
https://ridebonk.com.
