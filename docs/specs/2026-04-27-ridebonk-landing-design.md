---
title: ridebonk.com landing page
date: 2026-04-27
status: design (pre-implementation)
owner: reid
---

# ridebonk.com landing page

A one-page placeholder website for the Bonk app, intended to live at the URL
that appears in Bonk-generated Strava activity descriptions. It exists to
explain what the app is to a curious cyclist who clicked through, in a voice
that makes it clear this is a vanity project Reid built to scratch his own
itch, and to capture an email address from anyone who wants to be a tester.

## 1. Intent

Anyone landing on ridebonk.com should, in under thirty seconds, understand:

1. What Bonk is, in one sentence.
2. That it was built by one person, for himself, and is in development.
3. The three concrete itches it scratches.
4. That they can sign up to test it if they want to.

It is not a product marketing page. It is not selling. There are no
testimonials, no pricing, no "as seen in," no feature matrix. The voice is
first-person Reid: dry, self-deprecating, cycling-literate, not whiny.

## 2. Goals and non-goals

**In scope**

- Single static page at the apex domain.
- Tester-signup email capture that notifies Reid when someone signs up.
- App icon (the sad banana) used as the mark for masthead and favicon.
- Clean Open Graph image so links shared in Strava and chat unfurl nicely.
- Cloudflare Pages deployment with a custom domain.

**Out of scope**

- Newsletter or drip email program.
- Analytics or tracking.
- Multi-page IA, blog, or changelog.
- Sign-in, account flows, or any link into the actual app.
- Press kit, brand assets download, or any "for partners" surface.

## 3. Stack and hosting

- **Framework:** Astro 5, single page (`src/pages/index.astro`).
- **Styling:** Tailwind v4 via the official Vite plugin. No design framework
  beyond utility classes plus a small `global.css` for typography.
- **Interactivity:** one React island for the email subscribe card, hydrated
  only when it enters the viewport. Everything else ships as static HTML.
- **Email send:** Resend SDK called from a server-side Astro endpoint.
- **Hosting:** Cloudflare Pages with the `@astrojs/cloudflare` adapter, which
  also runs the subscribe endpoint as a Cloudflare Worker.
- **Custom domain:** `ridebonk.com` apex, plus `www` redirect.
- **Env vars** (Cloudflare dashboard, mirrored in `.env.example`):
  - `RESEND_API_KEY`
  - `NOTIFY_EMAIL` (where the subscribe notifications go)
  - `FROM_EMAIL` (verified Resend sender; until ridebonk.com is verified on
    Resend, use `onboarding@resend.dev` as a stopgap)

This is a separate project from the bonk monorepo and has its own git repo.

## 4. Page anatomy

Single column, top to bottom. All sections share the cream paper background.

1. **Masthead.** Wordmark "BONK" set very large in a serif at the top.
   Underneath, a small monospace strap: `Vol. 0 / In Development /
   Somewhere in Australia`. The sad banana icon sits to one side of the
   wordmark, small.
2. **Lede.** Single paragraph with a drop cap on the first letter. States
   what Bonk is and that Reid built it for himself.
3. **The three itches.** Numbered editorial section. Oversized mustard
   numerals. Each itch has a single-line headline and a short paragraph.
   Two captioned screenshot slots are interleaved (after itch 1 and itch 2);
   for now they render as labeled empty rectangles with the caption set,
   ready for Reid to drop real PNGs into `src/assets/screenshots/` later.
4. **What it isn't.** Five short bullet points. Resets expectations and
   carries the dry voice through the middle of the page.
5. **Tester signup card.** Magazine-subscription styling: dashed black
   rule, headline, two-sentence body, single email input, single submit
   button. Three states: idle, submitting, thanks.
6. **Colophon.** Small monospace block at the bottom: signature plus a
   one-line credit. Signed `reid, somewhere in australia`.

A wobbly hand-drawn horizontal rule separates each section, rendered as
inline SVG (one path that's slightly imperfect, reused with random rotation
of plus or minus 0.5 degrees per instance for organic variation).

## 5. Drafted copy

This is the canonical copy. Implementation should ship it verbatim unless
Reid changes it on review. Note: no em dashes anywhere, per house style.

**Masthead strap**

> Vol. 0 / In Development / Somewhere in Australia

**Lede**

> I built a workout app for myself. It's not done. It does what I wanted
> nothing else to do, in roughly the order I wanted to do it. If you ride
> bikes and have opinions about software, you might want a turn.

**Itch 1**

> 1. I wanted an AI coach that wasn't forty bucks a month.
>
> TrainHero is genuinely good. It's also pre-baked and pricey. I wanted
> something that watched my actual rides, knew my actual fitness, and let
> me say "give me ninety minutes that won't ruin tomorrow's gravel" and
> wrote me a workout. So I built that.

**Itch 2**

> 2. I wanted to ride a real climb without leaving Australia.
>
> I wanted to load up the Stelvio, or Alpe d'Huez, or my own driveway, on
> the trainer and ride it. Not a fake race against ghosts. Just the
> gradient profile of a real climb, slotted into whatever I was already
> doing. So I built that too.

**Itch 3**

> 3. I wanted it to not be boring.
>
> Most cycling apps have the personality of a printer driver. This one
> doesn't. There are a handful of coach personalities. You pick one. The
> post-ride writeups try to be at least slightly interesting. Sometimes
> they're at your expense. That's fine.

**What it isn't**

> - Not finished. The App Store does not know about it yet.
> - Not free of bugs. There are several. Some of them are charming.
> - Not for everyone. Probably not for most people.
> - Not a startup. Not raising. Not hiring. Just me.
> - Not a replacement for TrainerRoad or Zwift. They're great. This is mine.

**Tester signup**

> ### Want to try it?
>
> Drop your email. If something is ready to test I'll send you a link. No
> newsletter, no drip campaign, no "we're sorry to see you go" email if
> you change your mind.

States:

- Idle: input + button labeled `Subscribe`.
- Submitting: button shows `Sending...` and is disabled.
- Thanks: card swaps to `Got it. I'll be in touch.` (no exclamation).
- Error: red helper text under input; button re-enables.

**Colophon**

> reid, somewhere in australia
>
> Built in Kitty + Claude Code. No analytics. No tracking. No newsletter
> unless you ask for one.

## 6. Visual system

**Palette**

| Token       | Hex       | Use                                   |
| ----------- | --------- | ------------------------------------- |
| `paper`     | `#f5efe2` | Background everywhere.                |
| `ink`       | `#1b1b1b` | All body and headline text, rules.    |
| `mustard`   | `#d4a017` | Drop cap, oversized numerals, button. |
| `navy`      | `#1a3a5c` | Pull-quote, secondary accent rule.    |

**Typography**

- **Display / headlines:** Source Serif 4, weight 700, tight tracking.
  Loaded from Google Fonts via `<link rel="preconnect">` plus `<link
  rel="stylesheet">` in `head`. One subset, latin, woff2.
- **Body:** system serif stack, `Iowan Old Style, Charter, Georgia, serif`.
  No webfont, no flash of unstyled text.
- **Mono:** JetBrains Mono via Google Fonts, used for the masthead strap,
  screenshot captions, and the colophon.

**Layout**

- Single column, max width `36rem` (about 68 characters of body text).
- Generous side margins on desktop, `clamp(1.5rem, 6vw, 4rem)` horizontal
  page padding.
- Sections separated by 4rem of vertical space and a wobbly SVG rule.
- Drop cap on the lede: 4em tall, mustard, with a slight overlap into the
  paragraph (`float: left; margin: 0.1em 0.3em 0 0`).
- Numbered itches: numerals set in mustard at about 6rem, lined up to the
  left margin, with the itch headline and body indented in the column.

**Components**

- `Masthead.astro`
- `Lede.astro`
- `Itch.astro` (props: number, headline, body slot, optional screenshot
  slot)
- `WhatItIsnt.astro`
- `SubscribeCard.tsx` (React island)
- `Colophon.astro`
- `WobblyRule.astro` (inline SVG, random rotation per instance)

## 7. Icon system

The icon is the riso-style sad banana (`assets/icon-explorations/
banana-04-riso-v2.png`, regenerated from the spec at higher resolution
during build).

Files derived from the master 1024x1024 PNG:

- `public/apple-touch-icon.png` (180 x 180)
- `public/favicon-32.png`
- `public/favicon-16.png`
- `public/icon-512.png` (web manifest)
- `public/og.png` (1200 x 630, banana plus the wordmark plus the strap;
  built once and committed)

Source PNG also lives in `src/assets/banana.png` so it can be inlined into
the masthead and footer at the right responsive size.

Future work, out of scope for this spec: hand-drawn SVG vector trace of the
banana so the mark scales cleanly at any size. The PNG is fine for v1.

## 8. Email capture

**Endpoint:** `POST /api/subscribe`

**Request body:**

```json
{ "email": "string", "hp": "string (honeypot)" }
```

**Validation**

- If `hp` is non-empty, return `{ ok: true }` without sending. This is the
  only spam protection. Volume is expected to be tiny.
- Validate `email` with a simple regex and length cap (max 254 chars).
- Reject obviously malformed input with `400` and a generic error.

**Action**

- Call Resend `emails.send` with:
  - `from`: `FROM_EMAIL`
  - `to`: `NOTIFY_EMAIL`
  - `subject`: `ridebonk: someone wants in`
  - `text`: `Email: <email>\nUser-Agent: <ua>\nAt: <iso timestamp>`
- Return `{ ok: true }` on success, `{ ok: false }` on Resend failure.
- Do not store the email anywhere on disk or in any database. The notify
  email is the source of truth.

**Frontend**

- React island posts JSON, handles three states, never reloads the page.
- No client-side analytics fired on submit.
- Honeypot field is a `<input type="text" name="hp" tabindex="-1"
  autocomplete="off">` styled `position:absolute; left:-9999px`.

## 9. Project structure

```
/Users/reidbates/dev/ridebonk.com/
├── README.md
├── package.json
├── astro.config.mjs
├── tsconfig.json
├── .env.example
├── .gitignore
├── docs/specs/2026-04-27-ridebonk-landing-design.md
├── public/
│   ├── apple-touch-icon.png
│   ├── favicon-32.png
│   ├── favicon-16.png
│   ├── icon-512.png
│   ├── og.png
│   └── robots.txt
├── src/
│   ├── pages/
│   │   ├── index.astro
│   │   └── api/subscribe.ts
│   ├── components/
│   │   ├── Masthead.astro
│   │   ├── Lede.astro
│   │   ├── Itch.astro
│   │   ├── WhatItIsnt.astro
│   │   ├── SubscribeCard.tsx
│   │   ├── Colophon.astro
│   │   └── WobblyRule.astro
│   ├── styles/global.css
│   ├── assets/
│   │   ├── banana.png
│   │   └── screenshots/.gitkeep
│   └── env.d.ts
└── assets/icon-explorations/
    ├── banana-01-flat-sticker.png
    ├── banana-02-helmet.png
    ├── banana-03-riso.png
    └── banana-04-riso-v2.png
```

## 10. Open questions

- Is `ridebonk.com` already registered, and if so, where does its DNS live?
  Cloudflare Pages prefers Cloudflare DNS for the apex.
- Resend sender domain: ship v1 with `onboarding@resend.dev` and verify
  `ridebonk.com` later, or verify on day one?
- Do we want a tiny "press CMD+K to view source" easter egg in the
  colophon? Tracks with the dev voice but is cheap to skip.

These do not block writing the implementation plan. They become decisions
during build.
