# ridebonk.com

One-pager for Ride Bonk. Astro + Tailwind v4 + Resend.
Deploys to Cloudflare Workers.

## Develop

    npm install
    npm run dev

## Test

    npm test

## Build

    npm run build

## Icons

The master icon is `src/assets/banana.png`. To regenerate the favicon
variants and apple-touch-icon:

    npm run icons

## Social image

`public/og.png` is generated, not hand-drawn. Edit the strap and
tagline in `scripts/make-og.mjs`, then:

    node scripts/make-og.mjs

Keep the strap short — past roughly 50 characters at 20px it collides
with the banana panel.

## App Store listing

Listing facts (app ID, store URL, price, minimum iOS) live in
`src/data/app.ts` and are covered by `tests/data/app.test.ts`. The
store URL is deliberately storefront-neutral
(`apps.apple.com/app/id<id>`, no `/au/`) so Apple geo-redirects
visitors to their own storefront.

## Environment

Copy `.env.example` to `.env` and fill in `RESEND_API_KEY`. The
`NOTIFY_EMAIL` is where new signups get sent.

## Deploy

A Cloudflare Worker named `ridebonk-com` (see `wrangler.jsonc`), served
on the ridebonk.com apex. There is no push-to-deploy — deploys are
manual, from a machine authenticated to the Cloudflare account that
owns the ridebonk.com zone:

    npx wrangler login
    npm run deploy

`RESEND_API_KEY`, `NOTIFY_EMAIL`, and `FROM_EMAIL` are Worker secrets
(`npx wrangler secret put <NAME>`), not `.env` values, in production.
