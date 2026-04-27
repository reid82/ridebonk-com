# ridebonk.com

Static one-pager for the Bonk app. Astro + Tailwind v4 + Resend.
Deploys to Cloudflare Pages.

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

## Environment

Copy `.env.example` to `.env` and fill in `RESEND_API_KEY`. The
`NOTIFY_EMAIL` is where new tester signups get sent.

## Deploy

Cloudflare Pages, framework preset `Astro`. Set env vars
`RESEND_API_KEY`, `NOTIFY_EMAIL`, `FROM_EMAIL` in the dashboard.
