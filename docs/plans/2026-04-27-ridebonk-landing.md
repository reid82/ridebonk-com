# ridebonk.com Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy a single-page placeholder website for the Bonk app at `ridebonk.com`, matching the design spec at `docs/specs/2026-04-27-ridebonk-landing-design.md`.

**Architecture:** Static Astro 5 site with one React island for the email subscribe card. A single Astro endpoint at `/api/subscribe` runs as a Cloudflare Worker and forwards new signups to a notification email via Resend. No database, no analytics. Cream-paper zine aesthetic, riso-style sad banana as the icon.

**Tech Stack:** Astro 5, Tailwind v4 (Vite plugin), React 19, TypeScript, Resend SDK, Vitest + Testing Library, sharp (icon resize), Cloudflare Pages.

**Testing posture:** TDD for the parts with actual logic (the `/api/subscribe` endpoint and the `SubscribeCard` React island state machine). Static Astro components are verified by running the dev server and viewing the page.

**Project root for every path in this plan:** `/Users/reidbates/dev/ridebonk.com/`

---

## File Structure

| File                                      | Responsibility                                                       |
| ----------------------------------------- | -------------------------------------------------------------------- |
| `package.json`                            | npm metadata, scripts, deps                                          |
| `tsconfig.json`                           | TS config extending Astro's strict preset                            |
| `astro.config.mjs`                        | Astro config: integrations (React, Cloudflare adapter, Tailwind v4)  |
| `vitest.config.ts`                        | Vitest config (jsdom environment)                                    |
| `.gitignore`                              | node_modules, dist, .env                                             |
| `.env.example`                            | Documents required env vars                                          |
| `README.md`                               | Project overview, dev commands, deploy notes                         |
| `src/env.d.ts`                            | Astro/Cloudflare runtime type augmentation                           |
| `src/styles/global.css`                   | Tailwind import, design tokens, base typography, drop cap, fonts     |
| `src/pages/index.astro`                   | Composes the whole landing page                                      |
| `src/pages/api/subscribe.ts`              | POST handler that validates and forwards to Resend                   |
| `src/components/Masthead.astro`           | Wordmark + banana + monospace strap                                  |
| `src/components/Lede.astro`               | First paragraph with drop cap                                        |
| `src/components/Itch.astro`               | One numbered itch (props: number, headline, body, optional figure)   |
| `src/components/WhatItIsnt.astro`         | The five-bullet "what it isn't" list                                 |
| `src/components/SubscribeCard.tsx`        | React island: email form with idle/submitting/thanks/error states    |
| `src/components/Colophon.astro`           | Footer signature and credit                                          |
| `src/components/WobblyRule.astro`         | Inline SVG hand-drawn horizontal rule                                |
| `src/assets/banana.png`                   | Master icon (1024x1024)                                              |
| `src/assets/screenshots/.gitkeep`         | Placeholder dir for app screenshots                                  |
| `scripts/make-icons.mjs`                  | Resize banana into apple-touch-icon, 32, 16, 512                     |
| `public/apple-touch-icon.png`             | 180x180 home-screen icon                                             |
| `public/favicon-32.png`                   | 32x32 favicon                                                        |
| `public/favicon-16.png`                   | 16x16 favicon                                                        |
| `public/icon-512.png`                     | 512x512 (web manifest)                                               |
| `public/og.png`                           | 1200x630 social card                                                 |
| `public/robots.txt`                       | Allow all                                                            |
| `tests/api/subscribe.test.ts`             | Tests for the subscribe endpoint                                     |
| `tests/components/SubscribeCard.test.tsx` | Tests for the React island state machine                             |

---

## Task 0: Project bootstrap

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `.gitignore`
- Create: `.env.example`
- Create: `README.md`
- Create: `src/env.d.ts`
- Create: `src/assets/screenshots/.gitkeep`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "ridebonk.com",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "astro": "astro",
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "astro check && tsc --noEmit",
    "icons": "node scripts/make-icons.mjs"
  }
}
```

- [ ] **Step 2: Create `.gitignore`**

```
node_modules
dist
.astro
.wrangler
.env
.env.local
.DS_Store
*.log
```

- [ ] **Step 3: Create `.env.example`**

```
# Resend API key from https://resend.com/api-keys
RESEND_API_KEY=

# Where signup notifications are delivered
NOTIFY_EMAIL=reid1@reidbates.com

# Verified Resend sender. Use onboarding@resend.dev until ridebonk.com is verified.
FROM_EMAIL=onboarding@resend.dev
```

- [ ] **Step 4: Create `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"],
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "react"
  }
}
```

- [ ] **Step 5: Create `src/env.d.ts`**

```ts
/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  readonly RESEND_API_KEY: string;
  readonly NOTIFY_EMAIL: string;
  readonly FROM_EMAIL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

- [ ] **Step 6: Create `src/assets/screenshots/.gitkeep`**

Empty file. `touch src/assets/screenshots/.gitkeep`.

- [ ] **Step 7: Create `README.md`**

```markdown
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
```

- [ ] **Step 8: Commit**

```bash
git -C /Users/reidbates/dev/ridebonk.com add package.json tsconfig.json .gitignore .env.example README.md src/env.d.ts src/assets/screenshots/.gitkeep
git -C /Users/reidbates/dev/ridebonk.com commit -m "chore: project bootstrap"
```

---

## Task 1: Install dependencies and Astro config

**Files:**
- Modify: `package.json`
- Create: `astro.config.mjs`
- Create: `src/pages/index.astro` (placeholder, real composition later)

- [ ] **Step 1: Install runtime and dev dependencies**

Run from `/Users/reidbates/dev/ridebonk.com`:

```bash
npm install astro@^5.0.0 react@^19.0.0 react-dom@^19.0.0 resend@^4.0.0
npm install -D @astrojs/cloudflare @astrojs/react @astrojs/check @types/react @types/react-dom @tailwindcss/vite tailwindcss@^4.0.0 typescript vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event sharp
```

- [ ] **Step 2: Create `astro.config.mjs`**

```js
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import cloudflare from "@astrojs/cloudflare";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://ridebonk.com",
  output: "server",
  adapter: cloudflare({ platformProxy: { enabled: true } }),
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});
```

- [ ] **Step 3: Create a temporary `src/pages/index.astro`**

```astro
---
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>BONK</title>
  </head>
  <body>
    <h1>BONK (placeholder)</h1>
  </body>
</html>
```

- [ ] **Step 4: Verify dev server boots**

Run `npm run dev`. Browse to the URL it prints (default `http://localhost:4321`). Expected: page shows "BONK (placeholder)". Stop the server with Ctrl-C.

- [ ] **Step 5: Verify production build succeeds**

Run `npm run build`. Expected: completes without errors and emits `dist/`.

- [ ] **Step 6: Commit**

```bash
git -C /Users/reidbates/dev/ridebonk.com add package.json package-lock.json astro.config.mjs src/pages/index.astro
git -C /Users/reidbates/dev/ridebonk.com commit -m "chore: install astro stack and add placeholder page"
```

---

## Task 2: Test harness

**Files:**
- Create: `vitest.config.ts`
- Create: `tests/setup.ts`
- Modify: `package.json` (already has `test` script)

- [ ] **Step 1: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.{ts,tsx}"],
  },
});
```

- [ ] **Step 2: Install the React Vite plugin used only for tests**

```bash
npm install -D @vitejs/plugin-react
```

- [ ] **Step 3: Create `tests/setup.ts`**

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 4: Add a smoke test**

Create `tests/smoke.test.ts`:

```ts
import { describe, expect, it } from "vitest";

describe("smoke", () => {
  it("runs", () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 5: Run tests**

Run `npm test`. Expected: 1 test passes.

- [ ] **Step 6: Commit**

```bash
git -C /Users/reidbates/dev/ridebonk.com add vitest.config.ts tests/setup.ts tests/smoke.test.ts package.json package-lock.json
git -C /Users/reidbates/dev/ridebonk.com commit -m "test: add vitest with jsdom and a smoke test"
```

---

## Task 3: Design tokens and global styles

**Files:**
- Create: `src/styles/global.css`
- Modify: `src/pages/index.astro` (import the stylesheet)

- [ ] **Step 1: Create `src/styles/global.css`**

```css
@import "tailwindcss";

@theme {
  --color-paper: #f5efe2;
  --color-ink: #1b1b1b;
  --color-mustard: #d4a017;
  --color-navy: #1a3a5c;

  --font-display: "Source Serif 4", "Iowan Old Style", "Charter", Georgia, serif;
  --font-body: "Iowan Old Style", "Charter", Georgia, serif;
  --font-mono: "JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace;
}

html {
  background: var(--color-paper);
  color: var(--color-ink);
  font-family: var(--font-body);
  font-size: 18px;
  line-height: 1.55;
  -webkit-font-smoothing: antialiased;
}

body {
  margin: 0;
}

main {
  max-width: 36rem;
  margin: 0 auto;
  padding: clamp(2rem, 6vw, 4rem) clamp(1.25rem, 6vw, 2rem) 6rem;
}

h1, h2, h3 {
  font-family: var(--font-display);
  font-weight: 700;
  letter-spacing: -0.01em;
}

p {
  margin: 0 0 1.2em;
}

a {
  color: var(--color-ink);
  text-decoration-color: var(--color-mustard);
  text-decoration-thickness: 2px;
  text-underline-offset: 3px;
}

.dropcap::first-letter {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 4em;
  line-height: 0.85;
  float: left;
  margin: 0.05em 0.12em 0 -0.03em;
  color: var(--color-mustard);
}

.mono {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
```

- [ ] **Step 2: Add Google Fonts and stylesheet import to `src/pages/index.astro`**

Replace the file with:

```astro
---
import "../styles/global.css";
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>BONK</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@700&family=JetBrains+Mono:wght@400;500&display=swap"
    />
  </head>
  <body>
    <main>
      <h1>BONK</h1>
      <p class="mono">Vol. 0 / In Development / Somewhere in Australia</p>
      <p class="dropcap">Tokens loaded. The cream is on, the mustard is on, the fonts are on.</p>
    </main>
  </body>
</html>
```

- [ ] **Step 3: Verify dev server**

Run `npm run dev`. Open the page. Expected: cream background, large serif `BONK`, small monospace strap, body paragraph with a mustard drop cap on the first letter.

- [ ] **Step 4: Commit**

```bash
git -C /Users/reidbates/dev/ridebonk.com add src/styles/global.css src/pages/index.astro
git -C /Users/reidbates/dev/ridebonk.com commit -m "style: design tokens, fonts, and base typography"
```

---

## Task 4: WobblyRule component

**Files:**
- Create: `src/components/WobblyRule.astro`

- [ ] **Step 1: Create `src/components/WobblyRule.astro`**

```astro
---
const seed = Math.random();
const angle = (seed - 0.5) * 1.0;
const dy1 = (Math.random() - 0.5) * 4;
const dy2 = (Math.random() - 0.5) * 4;
const dy3 = (Math.random() - 0.5) * 4;
---
<svg
  role="presentation"
  aria-hidden="true"
  viewBox="0 0 600 12"
  preserveAspectRatio="none"
  width="100%"
  height="12"
  style={`display:block;margin:3rem 0;transform:rotate(${angle}deg);`}
>
  <path
    d={`M 4 6 Q 150 ${6 + dy1} 300 6 T ${500 + dy2} ${6 + dy3} T 596 6`}
    stroke="var(--color-ink)"
    stroke-width="1.6"
    fill="none"
    stroke-linecap="round"
  />
</svg>
```

- [ ] **Step 2: Render two of them on the page to verify**

Edit `src/pages/index.astro` and import + use:

```astro
---
import "../styles/global.css";
import WobblyRule from "../components/WobblyRule.astro";
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>BONK</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@700&family=JetBrains+Mono:wght@400;500&display=swap"
    />
  </head>
  <body>
    <main>
      <h1>BONK</h1>
      <WobblyRule />
      <p>Above and below this paragraph are two wobbly rules.</p>
      <WobblyRule />
    </main>
  </body>
</html>
```

- [ ] **Step 3: Verify visually**

Run `npm run dev`. Refresh once or twice. Expected: each rule is a slightly imperfect curved horizontal line, and they vary subtly between renders.

- [ ] **Step 4: Commit**

```bash
git -C /Users/reidbates/dev/ridebonk.com add src/components/WobblyRule.astro src/pages/index.astro
git -C /Users/reidbates/dev/ridebonk.com commit -m "feat: WobblyRule component"
```

---

## Task 5: Masthead component

**Files:**
- Create: `src/components/Masthead.astro`
- Copy: `src/assets/banana.png` from `assets/icon-explorations/banana-04-riso-v2.png`

- [ ] **Step 1: Copy the banana into `src/assets/`**

```bash
cp /Users/reidbates/dev/ridebonk.com/assets/icon-explorations/banana-04-riso-v2.png /Users/reidbates/dev/ridebonk.com/src/assets/banana.png
```

- [ ] **Step 2: Create `src/components/Masthead.astro`**

```astro
---
import { Image } from "astro:assets";
import banana from "../assets/banana.png";
---
<header class="masthead">
  <Image src={banana} alt="" width={120} height={120} class="banana" />
  <h1>BONK</h1>
  <p class="mono strap">Vol. 0 / In Development / Somewhere in Australia</p>
</header>

<style>
  .masthead {
    display: grid;
    grid-template-columns: auto 1fr;
    grid-template-rows: auto auto;
    align-items: end;
    column-gap: 1rem;
    margin: 0 0 2.5rem;
  }
  .banana {
    grid-row: 1 / span 2;
    width: 96px;
    height: 96px;
    align-self: center;
  }
  h1 {
    grid-column: 2;
    font-size: clamp(4rem, 14vw, 7rem);
    line-height: 0.9;
    margin: 0;
    letter-spacing: -0.04em;
  }
  .strap {
    grid-column: 2;
    margin: 0.5rem 0 0;
    color: var(--color-ink);
    opacity: 0.7;
  }
</style>
```

- [ ] **Step 3: Use it in `src/pages/index.astro`**

Replace the body inside `<main>` with just:

```astro
<Masthead />
```

and add `import Masthead from "../components/Masthead.astro";` at the top frontmatter.

- [ ] **Step 4: Verify visually**

Run `npm run dev`. Expected: large `BONK` wordmark with the sad banana to its left, monospace strap below.

- [ ] **Step 5: Commit**

```bash
git -C /Users/reidbates/dev/ridebonk.com add src/assets/banana.png src/components/Masthead.astro src/pages/index.astro
git -C /Users/reidbates/dev/ridebonk.com commit -m "feat: Masthead with wordmark, banana, and strap"
```

---

## Task 6: Lede component

**Files:**
- Create: `src/components/Lede.astro`

- [ ] **Step 1: Create `src/components/Lede.astro`**

```astro
---
---
<section class="lede">
  <p class="dropcap">
    I built a workout app for myself. It&apos;s not done. It does what I
    wanted nothing else to do, in roughly the order I wanted to do it. If
    you ride bikes and have opinions about software, you might want a turn.
  </p>
</section>

<style>
  .lede p {
    font-size: 1.15rem;
    line-height: 1.55;
  }
</style>
```

- [ ] **Step 2: Use it in `src/pages/index.astro`**

Add `import Lede from "../components/Lede.astro";` and place `<Lede />` after `<Masthead />` with a `<WobblyRule />` between them.

- [ ] **Step 3: Verify visually**

Run `npm run dev`. Expected: lede paragraph with a large mustard drop cap on the `I`. Apostrophes render as curly.

- [ ] **Step 4: Commit**

```bash
git -C /Users/reidbates/dev/ridebonk.com add src/components/Lede.astro src/pages/index.astro
git -C /Users/reidbates/dev/ridebonk.com commit -m "feat: Lede component"
```

---

## Task 7: Itch component

**Files:**
- Create: `src/components/Itch.astro`

- [ ] **Step 1: Create `src/components/Itch.astro`**

```astro
---
interface Props {
  number: number;
  headline: string;
}
const { number, headline } = Astro.props;
---
<article class="itch">
  <span class="num" aria-hidden="true">{number}.</span>
  <div class="body">
    <h2>{headline}</h2>
    <slot />
    <slot name="figure" />
  </div>
</article>

<style>
  .itch {
    display: grid;
    grid-template-columns: 4.5rem 1fr;
    align-items: start;
    gap: 0.5rem 1rem;
    margin: 2rem 0;
  }
  .num {
    font-family: var(--font-display);
    font-weight: 700;
    color: var(--color-mustard);
    font-size: 4.5rem;
    line-height: 0.85;
    text-align: right;
  }
  h2 {
    margin: 0.6rem 0 0.6rem;
    font-size: 1.4rem;
    line-height: 1.25;
  }
  @media (max-width: 30rem) {
    .itch {
      grid-template-columns: 3.2rem 1fr;
    }
    .num {
      font-size: 3.2rem;
    }
  }
</style>
```

- [ ] **Step 2: Use the three itches on the page**

In `src/pages/index.astro`, after `<Lede />` and a `<WobblyRule />`, add (with `import Itch from "../components/Itch.astro";`):

```astro
<Itch number={1} headline="I wanted an AI coach that wasn't forty bucks a month.">
  <p>
    TrainHero is genuinely good. It&apos;s also pre-baked and pricey. I
    wanted something that watched my actual rides, knew my actual fitness,
    and let me say "give me ninety minutes that won&apos;t ruin
    tomorrow&apos;s gravel" and wrote me a workout. So I built that.
  </p>
  <figure slot="figure" class="screenshot-slot">
    <div class="screenshot-frame">screenshot: a generated AI workout</div>
    <figcaption class="mono">fig. 1</figcaption>
  </figure>
</Itch>

<Itch number={2} headline="I wanted to ride a real climb without leaving Australia.">
  <p>
    I wanted to load up the Stelvio, or Alpe d&apos;Huez, or my own
    driveway, on the trainer and ride it. Not a fake race against ghosts.
    Just the gradient profile of a real climb, slotted into whatever I was
    already doing. So I built that too.
  </p>
  <figure slot="figure" class="screenshot-slot">
    <div class="screenshot-frame">screenshot: climb mode</div>
    <figcaption class="mono">fig. 2</figcaption>
  </figure>
</Itch>

<Itch number={3} headline="I wanted it to not be boring.">
  <p>
    Most cycling apps have the personality of a printer driver. This one
    doesn&apos;t. There are a handful of coach personalities. You pick
    one. The post-ride writeups try to be at least slightly interesting.
    Sometimes they&apos;re at your expense. That&apos;s fine.
  </p>
</Itch>

<style>
  .screenshot-slot { margin: 1.5rem 0 0; }
  .screenshot-frame {
    aspect-ratio: 9 / 16;
    max-width: 240px;
    background: #ffffff80;
    border: 1px dashed var(--color-ink);
    display: grid;
    place-items: center;
    text-align: center;
    padding: 1rem;
    color: var(--color-ink);
    opacity: 0.7;
    font-family: var(--font-mono);
    font-size: 0.78rem;
  }
  figcaption { margin-top: 0.5rem; opacity: 0.6; }
</style>
```

- [ ] **Step 3: Verify visually**

Run `npm run dev`. Expected: three numbered sections with oversized mustard numerals; itches 1 and 2 each have a tall dashed-border placeholder rectangle below their body text.

- [ ] **Step 4: Commit**

```bash
git -C /Users/reidbates/dev/ridebonk.com add src/components/Itch.astro src/pages/index.astro
git -C /Users/reidbates/dev/ridebonk.com commit -m "feat: Itch component and the three itches"
```

---

## Task 8: WhatItIsnt component

**Files:**
- Create: `src/components/WhatItIsnt.astro`

- [ ] **Step 1: Create `src/components/WhatItIsnt.astro`**

```astro
---
const items = [
  "Not finished. The App Store does not know about it yet.",
  "Not free of bugs. There are several. Some of them are charming.",
  "Not for everyone. Probably not for most people.",
  "Not a startup. Not raising. Not hiring. Just me.",
  "Not a replacement for TrainerRoad or Zwift. They're great. This is mine.",
];
---
<section class="not">
  <h2>What it isn&apos;t</h2>
  <ul>
    {items.map((item) => <li>{item}</li>)}
  </ul>
</section>

<style>
  h2 {
    font-size: 1.4rem;
    margin: 0 0 0.8rem;
  }
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  li {
    position: relative;
    padding: 0.4rem 0 0.4rem 1.6rem;
    border-bottom: 1px solid color-mix(in srgb, var(--color-ink) 12%, transparent);
  }
  li:first-child { border-top: 1px solid color-mix(in srgb, var(--color-ink) 12%, transparent); }
  li::before {
    content: "\00b7";
    position: absolute;
    left: 0.3rem;
    top: 0.4rem;
    color: var(--color-mustard);
    font-weight: 700;
    font-size: 1.4rem;
    line-height: 1;
  }
</style>
```

The bullet glyph is an interpunct (U+00B7), declared via the CSS escape `\00b7` so the source file contains zero unusual characters.

- [ ] **Step 2: Use it in `src/pages/index.astro`**

Add `import WhatItIsnt from "../components/WhatItIsnt.astro";`. After itch 3 and a `<WobblyRule />`, add `<WhatItIsnt />`.

- [ ] **Step 3: Verify visually**

Run `npm run dev`. Expected: `What it isn't` heading, five items with mustard interpunct bullets and faint hairline rules between them.

- [ ] **Step 4: Commit**

```bash
git -C /Users/reidbates/dev/ridebonk.com add src/components/WhatItIsnt.astro src/pages/index.astro
git -C /Users/reidbates/dev/ridebonk.com commit -m "feat: WhatItIsnt list"
```

---

## Task 9: SubscribeCard tests (failing first)

**Files:**
- Create: `tests/components/SubscribeCard.test.tsx`

- [ ] **Step 1: Write the failing tests**

```tsx
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SubscribeCard } from "../../src/components/SubscribeCard";

describe("SubscribeCard", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders the headline and an email input", () => {
    render(<SubscribeCard />);
    expect(screen.getByRole("heading", { name: /want to try it/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /subscribe/i })).toBeInTheDocument();
  });

  it("posts to /api/subscribe and shows the thanks state on success", async () => {
    const user = userEvent.setup();
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true }),
    });

    render(<SubscribeCard />);
    await user.type(screen.getByLabelText(/email/i), "rider@example.com");
    await user.click(screen.getByRole("button", { name: /subscribe/i }));

    await waitFor(() =>
      expect(screen.getByText(/got it\. i'll be in touch\./i)).toBeInTheDocument(),
    );

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "/api/subscribe",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }),
    );
    const body = JSON.parse(
      (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body,
    );
    expect(body.email).toBe("rider@example.com");
    expect(body.hp).toBe("");
  });

  it("disables the submit button while submitting", async () => {
    const user = userEvent.setup();
    let resolveFetch: (v: unknown) => void = () => {};
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockImplementationOnce(
      () => new Promise((resolve) => { resolveFetch = resolve; }),
    );

    render(<SubscribeCard />);
    await user.type(screen.getByLabelText(/email/i), "rider@example.com");
    await user.click(screen.getByRole("button", { name: /subscribe/i }));

    expect(screen.getByRole("button", { name: /sending/i })).toBeDisabled();

    resolveFetch({ ok: true, json: async () => ({ ok: true }) });
  });

  it("shows an error message when the request fails", async () => {
    const user = userEvent.setup();
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ ok: false }),
    });

    render(<SubscribeCard />);
    await user.type(screen.getByLabelText(/email/i), "rider@example.com");
    await user.click(screen.getByRole("button", { name: /subscribe/i }));

    await waitFor(() =>
      expect(screen.getByText(/something broke/i)).toBeInTheDocument(),
    );
    expect(screen.getByRole("button", { name: /subscribe/i })).not.toBeDisabled();
  });
});
```

- [ ] **Step 2: Run the tests to confirm they fail**

```bash
npm test
```

Expected: 4 test failures, all complaining that `SubscribeCard` cannot be imported (module does not exist).

- [ ] **Step 3: Commit the failing tests**

```bash
git -C /Users/reidbates/dev/ridebonk.com add tests/components/SubscribeCard.test.tsx
git -C /Users/reidbates/dev/ridebonk.com commit -m "test: SubscribeCard expectations (failing)"
```

---

## Task 10: SubscribeCard implementation

**Files:**
- Create: `src/components/SubscribeCard.tsx`

- [ ] **Step 1: Implement the component**

```tsx
import { useState, type FormEvent } from "react";

type Status = "idle" | "submitting" | "thanks" | "error";

export function SubscribeCard() {
  const [email, setEmail] = useState("");
  const [hp, setHp] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, hp }),
      });
      if (!res.ok) {
        setStatus("error");
        return;
      }
      const data = (await res.json()) as { ok?: boolean };
      setStatus(data.ok ? "thanks" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "thanks") {
    return (
      <aside className="subscribe-card subscribe-card--thanks">
        <p>Got it. I'll be in touch.</p>
      </aside>
    );
  }

  return (
    <aside className="subscribe-card">
      <h2>Want to try it?</h2>
      <p>
        Drop your email. If something is ready to test I'll send you a link.
        No newsletter, no drip campaign, no "we're sorry to see you go" email
        if you change your mind.
      </p>
      <form onSubmit={onSubmit} noValidate>
        <label className="visually-hidden" htmlFor="subscribe-email">
          Email
        </label>
        <input
          id="subscribe-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
        <input
          type="text"
          name="hp"
          tabIndex={-1}
          autoComplete="off"
          value={hp}
          onChange={(e) => setHp(e.target.value)}
          aria-hidden="true"
          className="hp"
        />
        <button type="submit" disabled={status === "submitting"}>
          {status === "submitting" ? "Sending..." : "Subscribe"}
        </button>
      </form>
      {status === "error" && (
        <p className="subscribe-card__error">
          Something broke on my end. Try again in a minute.
        </p>
      )}
    </aside>
  );
}
```

- [ ] **Step 2: Run the tests**

```bash
npm test
```

Expected: 5 tests pass (the 4 from this file plus the smoke test).

- [ ] **Step 3: Commit**

```bash
git -C /Users/reidbates/dev/ridebonk.com add src/components/SubscribeCard.tsx
git -C /Users/reidbates/dev/ridebonk.com commit -m "feat: SubscribeCard React island"
```

---

## Task 11: Subscribe card styling and use on the page

**Files:**
- Modify: `src/styles/global.css` (append form styles)
- Modify: `src/pages/index.astro` (mount the React island)

- [ ] **Step 1: Append the styles for the card to `src/styles/global.css`**

```css
.visually-hidden {
  position: absolute;
  width: 1px; height: 1px;
  padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0,0,0,0);
  white-space: nowrap; border: 0;
}

.subscribe-card {
  border: 1.5px dashed var(--color-ink);
  padding: 1.5rem 1.5rem 1.75rem;
  margin: 2rem 0;
  background: color-mix(in srgb, var(--color-paper) 50%, white 50%);
}

.subscribe-card h2 {
  font-size: 1.5rem;
  margin: 0 0 0.6rem;
}

.subscribe-card form {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.8rem;
  flex-wrap: wrap;
}

.subscribe-card input[type="email"] {
  flex: 1 1 14rem;
  font: inherit;
  padding: 0.6rem 0.75rem;
  border: 1.5px solid var(--color-ink);
  background: white;
  color: var(--color-ink);
  outline: none;
}

.subscribe-card input[type="email"]:focus {
  outline: 2px solid var(--color-mustard);
  outline-offset: 2px;
}

.subscribe-card .hp {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
}

.subscribe-card button {
  font: inherit;
  font-weight: 700;
  padding: 0.6rem 1.1rem;
  border: 1.5px solid var(--color-ink);
  background: var(--color-mustard);
  color: var(--color-ink);
  cursor: pointer;
}

.subscribe-card button[disabled] {
  opacity: 0.6;
  cursor: progress;
}

.subscribe-card__error {
  color: var(--color-navy);
  font-size: 0.95rem;
  margin: 0.6rem 0 0;
}

.subscribe-card--thanks p {
  font-family: var(--font-display);
  font-size: 1.4rem;
  margin: 0;
}
```

- [ ] **Step 2: Mount the island in the page**

In `src/pages/index.astro`, add:

```astro
import { SubscribeCard } from "../components/SubscribeCard";
```

(top frontmatter), then after `<WhatItIsnt />` and a `<WobblyRule />`:

```astro
<SubscribeCard client:visible />
```

- [ ] **Step 3: Verify visually**

Run `npm run dev`. Expected: dashed-border card with the headline, body, email input, and `Subscribe` button. The button is mustard. Tab order skips the honeypot.

- [ ] **Step 4: Commit**

```bash
git -C /Users/reidbates/dev/ridebonk.com add src/styles/global.css src/pages/index.astro
git -C /Users/reidbates/dev/ridebonk.com commit -m "feat: subscribe card styles, mounted on the page"
```

---

## Task 12: Colophon component and final page composition

**Files:**
- Create: `src/components/Colophon.astro`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Create `src/components/Colophon.astro`**

```astro
---
---
<footer class="colophon mono">
  <p>reid, somewhere in australia</p>
  <p>
    Built in Kitty + Claude Code. No analytics. No tracking. No newsletter
    unless you ask for one.
  </p>
</footer>

<style>
  .colophon {
    margin: 4rem 0 0;
    opacity: 0.6;
  }
  .colophon p { margin: 0 0 0.4rem; }
</style>
```

- [ ] **Step 2: Final composition of `src/pages/index.astro`**

Replace the file with:

```astro
---
import "../styles/global.css";
import Masthead from "../components/Masthead.astro";
import Lede from "../components/Lede.astro";
import Itch from "../components/Itch.astro";
import WhatItIsnt from "../components/WhatItIsnt.astro";
import Colophon from "../components/Colophon.astro";
import WobblyRule from "../components/WobblyRule.astro";
import { SubscribeCard } from "../components/SubscribeCard";
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>BONK | a workout app i made for myself</title>
    <meta name="description" content="A workout app I built for myself. It's not done." />

    <link rel="icon" href="/favicon-32.png" type="image/png" sizes="32x32" />
    <link rel="icon" href="/favicon-16.png" type="image/png" sizes="16x16" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

    <meta property="og:title" content="BONK" />
    <meta property="og:description" content="A workout app I built for myself. It's not done." />
    <meta property="og:image" content="https://ridebonk.com/og.png" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://ridebonk.com/" />
    <meta name="twitter:card" content="summary_large_image" />

    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@700&family=JetBrains+Mono:wght@400;500&display=swap"
    />
  </head>
  <body>
    <main>
      <Masthead />
      <WobblyRule />
      <Lede />
      <WobblyRule />
      <Itch number={1} headline="I wanted an AI coach that wasn't forty bucks a month.">
        <p>
          TrainHero is genuinely good. It&apos;s also pre-baked and pricey. I
          wanted something that watched my actual rides, knew my actual
          fitness, and let me say "give me ninety minutes that won&apos;t
          ruin tomorrow&apos;s gravel" and wrote me a workout. So I built
          that.
        </p>
        <figure slot="figure" class="screenshot-slot">
          <div class="screenshot-frame">screenshot: a generated AI workout</div>
          <figcaption class="mono">fig. 1</figcaption>
        </figure>
      </Itch>
      <Itch number={2} headline="I wanted to ride a real climb without leaving Australia.">
        <p>
          I wanted to load up the Stelvio, or Alpe d&apos;Huez, or my own
          driveway, on the trainer and ride it. Not a fake race against
          ghosts. Just the gradient profile of a real climb, slotted into
          whatever I was already doing. So I built that too.
        </p>
        <figure slot="figure" class="screenshot-slot">
          <div class="screenshot-frame">screenshot: climb mode</div>
          <figcaption class="mono">fig. 2</figcaption>
        </figure>
      </Itch>
      <Itch number={3} headline="I wanted it to not be boring.">
        <p>
          Most cycling apps have the personality of a printer driver. This
          one doesn&apos;t. There are a handful of coach personalities. You
          pick one. The post-ride writeups try to be at least slightly
          interesting. Sometimes they&apos;re at your expense.
          That&apos;s fine.
        </p>
      </Itch>
      <WobblyRule />
      <WhatItIsnt />
      <WobblyRule />
      <SubscribeCard client:visible />
      <Colophon />
    </main>

    <style>
      .screenshot-slot { margin: 1.5rem 0 0; }
      .screenshot-frame {
        aspect-ratio: 9 / 16;
        max-width: 240px;
        background: #ffffff80;
        border: 1px dashed var(--color-ink);
        display: grid;
        place-items: center;
        text-align: center;
        padding: 1rem;
        color: var(--color-ink);
        opacity: 0.7;
        font-family: var(--font-mono);
        font-size: 0.78rem;
      }
      figcaption { margin-top: 0.5rem; opacity: 0.6; }
    </style>
  </body>
</html>
```

- [ ] **Step 3: Verify visually**

Run `npm run dev`. Walk through the page top to bottom. Expected: masthead, lede, three itches with two screenshot placeholders, what it isn't, subscribe card, colophon, with wobbly rules between sections.

- [ ] **Step 4: Commit**

```bash
git -C /Users/reidbates/dev/ridebonk.com add src/components/Colophon.astro src/pages/index.astro
git -C /Users/reidbates/dev/ridebonk.com commit -m "feat: Colophon and final page composition"
```

---

## Task 13: /api/subscribe tests (failing first)

**Files:**
- Create: `tests/api/subscribe.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mockSend = vi.fn();
vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: { send: mockSend },
  })),
}));

import { POST } from "../../src/pages/api/subscribe";

function makeRequest(body: unknown): Request {
  return new Request("http://localhost/api/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json", "User-Agent": "vitest" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/subscribe", () => {
  beforeEach(() => {
    mockSend.mockReset();
    mockSend.mockResolvedValue({ data: { id: "abc" }, error: null });
    vi.stubEnv("RESEND_API_KEY", "test_key");
    vi.stubEnv("NOTIFY_EMAIL", "reid@example.com");
    vi.stubEnv("FROM_EMAIL", "from@example.com");
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns 400 for missing email", async () => {
    const res = await POST({ request: makeRequest({}) } as never);
    expect(res.status).toBe(400);
  });

  it("returns 400 for malformed email", async () => {
    const res = await POST({ request: makeRequest({ email: "nope" }) } as never);
    expect(res.status).toBe(400);
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("returns 200 without sending when honeypot is filled", async () => {
    const res = await POST({
      request: makeRequest({ email: "rider@example.com", hp: "spam" }),
    } as never);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { ok: boolean };
    expect(body.ok).toBe(true);
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("forwards a valid email through Resend and returns 200", async () => {
    const res = await POST({
      request: makeRequest({ email: "rider@example.com", hp: "" }),
    } as never);
    expect(res.status).toBe(200);
    expect(mockSend).toHaveBeenCalledTimes(1);
    const args = mockSend.mock.calls[0][0];
    expect(args.to).toBe("reid@example.com");
    expect(args.from).toBe("from@example.com");
    expect(args.subject).toMatch(/ridebonk/i);
    expect(args.text).toContain("rider@example.com");
  });

  it("returns ok:false when Resend fails", async () => {
    mockSend.mockResolvedValueOnce({ data: null, error: { message: "boom" } });
    const res = await POST({
      request: makeRequest({ email: "rider@example.com", hp: "" }),
    } as never);
    expect(res.status).toBe(502);
    const body = (await res.json()) as { ok: boolean };
    expect(body.ok).toBe(false);
  });
});
```

- [ ] **Step 2: Run the tests to confirm they fail**

```bash
npm test
```

Expected: tests fail because `src/pages/api/subscribe.ts` does not exist yet.

- [ ] **Step 3: Commit failing tests**

```bash
git -C /Users/reidbates/dev/ridebonk.com add tests/api/subscribe.test.ts
git -C /Users/reidbates/dev/ridebonk.com commit -m "test: /api/subscribe expectations (failing)"
```

---

## Task 14: /api/subscribe implementation

**Files:**
- Create: `src/pages/api/subscribe.ts`

- [ ] **Step 1: Implement the endpoint**

```ts
import type { APIRoute } from "astro";
import { Resend } from "resend";

export const prerender = false;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LEN = 254;

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const POST: APIRoute = async ({ request }) => {
  let payload: { email?: unknown; hp?: unknown };
  try {
    payload = (await request.json()) as { email?: unknown; hp?: unknown };
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400);
  }

  if (typeof payload.hp === "string" && payload.hp.length > 0) {
    return json({ ok: true });
  }

  const email = typeof payload.email === "string" ? payload.email.trim() : "";
  if (!email || email.length > MAX_EMAIL_LEN || !EMAIL_RE.test(email)) {
    return json({ ok: false, error: "invalid_email" }, 400);
  }

  const apiKey = import.meta.env.RESEND_API_KEY;
  const notifyEmail = import.meta.env.NOTIFY_EMAIL;
  const fromEmail = import.meta.env.FROM_EMAIL;
  if (!apiKey || !notifyEmail || !fromEmail) {
    return json({ ok: false, error: "server_misconfigured" }, 500);
  }

  const resend = new Resend(apiKey);
  const ua = request.headers.get("user-agent") ?? "unknown";
  const at = new Date().toISOString();

  const { error } = await resend.emails.send({
    from: fromEmail,
    to: notifyEmail,
    subject: "ridebonk: someone wants in",
    text: `Email: ${email}\nUser-Agent: ${ua}\nAt: ${at}`,
  });

  if (error) {
    return json({ ok: false, error: "send_failed" }, 502);
  }

  return json({ ok: true });
};
```

- [ ] **Step 2: Run the tests**

```bash
npm test
```

Expected: all tests in `tests/api/subscribe.test.ts` pass, plus the existing tests.

- [ ] **Step 3: Commit**

```bash
git -C /Users/reidbates/dev/ridebonk.com add src/pages/api/subscribe.ts
git -C /Users/reidbates/dev/ridebonk.com commit -m "feat: /api/subscribe endpoint"
```

---

## Task 15: Icon variants

**Files:**
- Create: `scripts/make-icons.mjs`
- Create: `public/apple-touch-icon.png`, `public/favicon-32.png`, `public/favicon-16.png`, `public/icon-512.png`

- [ ] **Step 1: Create `scripts/make-icons.mjs`**

```js
import sharp from "sharp";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(__dirname, "../src/assets/banana.png");
const OUT = resolve(__dirname, "../public");

const targets = [
  { size: 180, file: "apple-touch-icon.png" },
  { size: 32,  file: "favicon-32.png" },
  { size: 16,  file: "favicon-16.png" },
  { size: 512, file: "icon-512.png" },
];

for (const { size, file } of targets) {
  await sharp(SRC).resize(size, size).png().toFile(`${OUT}/${file}`);
  console.log(`wrote public/${file} (${size}x${size})`);
}
```

- [ ] **Step 2: Run the script**

```bash
npm run icons
```

Expected: four PNGs land under `public/`.

- [ ] **Step 3: Verify the favicon shows up**

Run `npm run dev`, hard-refresh the browser. Expected: a tiny sad banana in the browser tab.

- [ ] **Step 4: Commit**

```bash
git -C /Users/reidbates/dev/ridebonk.com add scripts/make-icons.mjs public/apple-touch-icon.png public/favicon-32.png public/favicon-16.png public/icon-512.png
git -C /Users/reidbates/dev/ridebonk.com commit -m "feat: favicon and apple-touch-icon variants"
```

---

## Task 16: Open Graph image

**Files:**
- Create: `scripts/make-og.mjs`
- Create: `public/og.png`

- [ ] **Step 1: Create `scripts/make-og.mjs`**

This script renders an SVG composition with the banana and the wordmark, then converts it to a 1200x630 PNG. No web font dependency: it uses the system serif stack expressed as a fallback list, which sharp will render through its bundled font config.

```js
import sharp from "sharp";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { readFileSync } from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BANANA = resolve(__dirname, "../src/assets/banana.png");
const OUT = resolve(__dirname, "../public/og.png");

const W = 1200, H = 630;
const bananaPng = readFileSync(BANANA);

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="#f5efe2"/>
  <text x="80" y="280" font-family="Iowan Old Style, Charter, Georgia, serif" font-weight="700" font-size="220" fill="#1b1b1b" letter-spacing="-8">BONK</text>
  <text x="84" y="340" font-family="JetBrains Mono, ui-monospace, monospace" font-size="22" fill="#1b1b1b" opacity="0.7">VOL. 0 / IN DEVELOPMENT / SOMEWHERE IN AUSTRALIA</text>
  <text x="80" y="430" font-family="Iowan Old Style, Charter, Georgia, serif" font-size="34" fill="#1b1b1b">a workout app i made for myself.</text>
  <text x="80" y="478" font-family="Iowan Old Style, Charter, Georgia, serif" font-size="34" fill="#1b1b1b" opacity="0.7">it's not done.</text>
</svg>
`;

const banana = await sharp(bananaPng).resize(380, 380).toBuffer();

await sharp(Buffer.from(svg))
  .composite([{ input: banana, left: W - 380 - 80, top: H - 380 - 80 }])
  .png()
  .toFile(OUT);

console.log("wrote public/og.png");
```

- [ ] **Step 2: Run it**

```bash
node scripts/make-og.mjs
```

Expected: `public/og.png` is created.

- [ ] **Step 3: Eyeball the OG image**

Open `public/og.png`. Expected: cream background, large `BONK` wordmark top-left, monospace strap below it, two-line tagline, sad banana in the bottom-right.

- [ ] **Step 4: Commit**

```bash
git -C /Users/reidbates/dev/ridebonk.com add scripts/make-og.mjs public/og.png
git -C /Users/reidbates/dev/ridebonk.com commit -m "feat: open graph image"
```

---

## Task 17: robots.txt and final polish

**Files:**
- Create: `public/robots.txt`

- [ ] **Step 1: Create `public/robots.txt`**

```
User-agent: *
Allow: /
Sitemap: https://ridebonk.com/sitemap-index.xml
```

(The sitemap line is aspirational; if no sitemap integration is added, search engines will simply 404 on that path, which is harmless.)

- [ ] **Step 2: Run `npm run typecheck` and `npm test`**

Expected: typecheck passes, all tests pass.

- [ ] **Step 3: Run `npm run build`**

Expected: build succeeds. The Cloudflare adapter emits `_worker.js` and `dist/` artifacts.

- [ ] **Step 4: Commit**

```bash
git -C /Users/reidbates/dev/ridebonk.com add public/robots.txt
git -C /Users/reidbates/dev/ridebonk.com commit -m "chore: robots.txt"
```

---

## Task 18: Cloudflare Pages deployment (manual, with Reid)

This task is not automatable; it's a checklist for the human owner.

- [ ] **Step 1: Verify the GitHub remote**

If the repo is not yet on GitHub, create it (private is fine) and push:

```bash
gh repo create reid82/ridebonk.com --private --source /Users/reidbates/dev/ridebonk.com --remote origin --push
```

- [ ] **Step 2: Create the Cloudflare Pages project**

In the Cloudflare dashboard, Pages, Connect to Git, pick the `ridebonk.com` repo, framework preset `Astro`, build command `npm run build`, output directory `dist`.

- [ ] **Step 3: Set environment variables**

In the Pages project, Settings, Environment variables, add for both Production and Preview:

- `RESEND_API_KEY` = the key from Resend
- `NOTIFY_EMAIL` = `reid1@reidbates.com`
- `FROM_EMAIL` = `onboarding@resend.dev` (or a verified sender on `ridebonk.com`)

- [ ] **Step 4: Add the custom domain**

In Pages, Custom domains, add `ridebonk.com` and `www.ridebonk.com`. Follow the DNS instructions Cloudflare gives.

- [ ] **Step 5: Trigger a deploy and smoke-test**

Push a commit. Wait for the Pages deploy to finish. Visit `https://ridebonk.com`. Expected: the page renders. Submit the form with a real email; expected: an email arrives at `NOTIFY_EMAIL`.

- [ ] **Step 6: Verify the OG image**

Paste `https://ridebonk.com` into iMessage (or any unfurl-aware tool). Expected: the unfurl shows the OG image with `BONK` and the banana.

---

## Self-Review Notes

- All sections of the spec are covered: stack (Task 1), tokens (Task 3), all six page sections (Tasks 5-12), email capture (Tasks 13-14), icon variants (Task 15), OG image (Task 16), robots (Task 17), deploy (Task 18).
- TDD applies to logic-bearing units only (`SubscribeCard`, `/api/subscribe`); static Astro components are verified by visual inspection of the dev server. This is a deliberate scoping choice, not a discipline gap.
- No em dashes anywhere in the code, copy, or this plan.
- `WobblyRule.astro` and `Itch.astro` interfaces match their consumers in `index.astro`.
- The honeypot field name is `hp` everywhere (component, test, endpoint, endpoint test).
- Status strings used in `SubscribeCard` (`idle`, `submitting`, `thanks`, `error`) match between implementation and tests.
- Env var names match across `.env.example`, `src/env.d.ts`, the endpoint, and the endpoint tests (`RESEND_API_KEY`, `NOTIFY_EMAIL`, `FROM_EMAIL`).
