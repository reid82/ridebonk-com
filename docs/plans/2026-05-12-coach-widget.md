# Coach Widget Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "meet the coaches" section to ridebonk.com that lists all 13 BONK coach personalities with a play button per coach that plays a short pre-generated ElevenLabs audio sample.

**Architecture:** Static MP3s shipped as public assets (one per coach, pre-generated via a one-shot Node script). A React island (`CoachWidget.tsx`) manages a single `<audio>` element and click-to-play state. An Astro wrapper (`Coaches.astro`) injects section copy and hydrates the island `client:visible`. Inserted into `src/pages/index.astro` directly after Itch #3.

**Tech Stack:** Astro 5, React 19, Tailwind 4 (theme tokens only), Vitest + React Testing Library, jsdom, `@astrojs/cloudflare`. ElevenLabs HTTP API for one-time MP3 generation.

**Spec:** `docs/specs/2026-05-12-coach-widget-design.md`

**Repo state note:** ridebonk.com has unrelated uncommitted changes from another session at the time this plan was written. Each task below explicitly stages only the files it touches. Do NOT use `git add .` or `git add -A`. Do NOT touch the other modified files (`Lede.astro`, `Masthead.astro`, `WhatItIsnt.astro`, `index.astro` outside the one insertion in Task 5, `global.css` outside the additions in Task 5, deleted `SubscribeCard.astro`, untracked `Screen.astro`, untracked `TesterCard.astro`).

---

## Task 1: Coach data file + unit test

**Files:**
- Create: `src/data/coaches.ts`
- Create: `tests/data/coaches.test.ts`

This task lays down the website source of truth for the 13 coaches. Values are mirrored from `apps/mobile/src/lib/voice/personalities.ts` in the bonk monorepo at the time of writing. Drift between bonk and ridebonk.com is acceptable — the app is authoritative for in-app behaviour, the website shows whatever we want to show.

- [ ] **Step 1: Write the failing test**

Create `tests/data/coaches.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { COACHES } from "../../src/data/coaches";

describe("coaches data", () => {
  it("has 13 entries", () => {
    expect(COACHES).toHaveLength(13);
  });

  it("has unique ids", () => {
    const ids = COACHES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every entry has all required fields", () => {
    for (const c of COACHES) {
      expect(c.id).toMatch(/^[a-z][a-z0-9-]*$/);
      expect(c.name.length).toBeGreaterThan(0);
      expect(c.voiceLabel.length).toBeGreaterThan(0);
      expect(c.blurb.length).toBeGreaterThan(0);
      expect(c.previewLine.length).toBeGreaterThan(0);
      expect(c.voiceId).toMatch(/^[A-Za-z0-9]+$/);
      expect(c.settings.stability).toBeGreaterThanOrEqual(0);
      expect(c.settings.similarity_boost).toBeGreaterThanOrEqual(0);
    }
  });

  it("has four adult coaches", () => {
    const adults = COACHES.filter((c) => c.adult === true);
    expect(adults.map((c) => c.id).sort()).toEqual(
      ["mickey", "texas-champ", "velominati", "wade"]
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- tests/data/coaches.test.ts`
Expected: FAIL with module-not-found error for `../../src/data/coaches`.

- [ ] **Step 3: Create the data file**

Create `src/data/coaches.ts`:

```ts
/**
 * Coach personalities shown on ridebonk.com.
 *
 * Mirrored manually from apps/mobile/src/lib/voice/personalities.ts in the
 * bonk monorepo. Marketing site copy, not app behaviour. Re-sync when:
 *   - a personality is added or renamed in bonk
 *   - a previewLine changes (then re-run scripts/make-coach-audio.mjs)
 *   - a voiceId or settings change (then re-run with --force)
 */

export interface Coach {
  id: string;
  name: string;
  voiceLabel: string;
  blurb: string;
  previewLine: string;
  voiceId: string;
  settings: {
    stability: number;
    similarity_boost: number;
    style?: number;
    use_speaker_boost?: boolean;
  };
  adult?: boolean;
}

export const COACHES: Coach[] = [
  {
    id: "sergeant",
    name: "Sergeant Steel",
    voiceLabel: "Adam (deep, authoritative)",
    blurb: "Drill-sergeant. Hostile. Will absolutely call you soft.",
    previewLine: "On your feet. Pain is information. Pedal.",
    voiceId: "pNInz6obpgDQGcFmaJgB",
    settings: { stability: 0.4, similarity_boost: 0.85, style: 0.6, use_speaker_boost: true },
  },
  {
    id: "clinical",
    name: "Dr. Hodges",
    voiceLabel: "Daniel (precise British)",
    blurb: "Clinical, technical, exact. Numbers and physiology.",
    previewLine: "Targeting sweet-spot: sustained output at 88 to 94 percent of threshold.",
    voiceId: "onwK4e9ZLuTAKqWW03F9",
    settings: { stability: 0.7, similarity_boost: 0.65, style: 0.1 },
  },
  {
    id: "mate",
    name: "Mate",
    voiceLabel: "Charlie (Australian, casual)",
    blurb: "Aussie riding buddy. Banter. Will rib you when you slack.",
    previewLine: "Yeah nah, righto mate, quick sanity check, you remember how to pedal, yeah?",
    voiceId: "IKne3meq5aSn9XLyUdCD",
    settings: { stability: 0.5, similarity_boost: 0.7, style: 0.4 },
  },
  {
    id: "soigneuse",
    name: "Soigneuse",
    voiceLabel: "French/Italian female",
    blurb: "Tender team masseuse. Talks to your legs like newborns.",
    previewLine: "Allez, mon brave. Les jambes — they remember. Trust them. Piano piano.",
    voiceId: "FvmvwvObRqIHojkEGh5N",
    settings: { stability: 0.6, similarity_boost: 0.75, style: 0.35 },
  },
  {
    id: "boss",
    name: "Team Boss",
    voiceLabel: "Aria (placeholder — wants Dutch/Belgian)",
    blurb: "Directeur sportif on race radio. Cold, tactical, on your team.",
    previewLine: "Hold the wheel. Don't close yet. We bring it back in three.",
    voiceId: "9BWtsMINqrJLrRacOk9x",
    settings: { stability: 0.55, similarity_boost: 0.75, style: 0.3 },
  },
  {
    id: "commentator",
    name: "The Commentator",
    voiceLabel: "George (warm British)",
    blurb: "Phil Liggett pastiche. Dramatic. Tangents about pastries.",
    previewLine: "And here he is, our rider, attacking the slopes — reminds me of Hinault in '85, though admittedly Hinault had better socks.",
    voiceId: "JBFqnCBsd6RMkjVDRZzb",
    settings: { stability: 0.5, similarity_boost: 0.7, style: 0.45 },
  },
  {
    id: "audax",
    name: "Audax Grandad",
    voiceLabel: "Brian (placeholder — wants older British)",
    blurb: "Stoic old audaxer. Your workout is, by his standards, a warm-up.",
    previewLine: "When I rode PBP in '79 the rain didn't stop for two days. You'll be alright, lad.",
    voiceId: "nPczCjzI2devNBz1zQrb",
    settings: { stability: 0.7, similarity_boost: 0.65, style: 0.15 },
  },
  {
    id: "headmistress",
    name: "The Headmistress",
    voiceLabel: "Alice (posh British)",
    blurb: "Posh British boarding-school head. Disappointment as scalpel.",
    previewLine: "I have read your power numbers. We shall be having a conversation after assembly.",
    voiceId: "Xb7hH8MSUJpSbSDYk0k2",
    settings: { stability: 0.65, similarity_boost: 0.7, style: 0.25 },
  },
  {
    id: "gravel",
    name: "Gravel Bro",
    voiceLabel: "Eric (chill American)",
    blurb: "Chill gravel guy. Brapp. The vibe is the homies, not the watts.",
    previewLine: "Yeah dude, just sending it on the indoor today, that's sick. Brapp.",
    voiceId: "cjVigY5qzO86Huf0OWal",
    settings: { stability: 0.55, similarity_boost: 0.7, style: 0.3 },
  },
  {
    id: "wade",
    name: "Wade",
    voiceLabel: "Clyde (battle-hardened, wry)",
    blurb: "Unhinged fourth-wall-breaking merc. Filthy. Constantly biting.",
    previewLine: "Oh hi. Wade here. Brought to you by bad decisions, red spandex, and an AI that's mildly worried about your knees. Let's get sweaty, you magnificent disaster.",
    voiceId: "2EiwWnXFnvU5JabPnv8n",
    settings: { stability: 0.35, similarity_boost: 0.75, style: 0.65, use_speaker_boost: true },
    adult: true,
  },
  {
    id: "mickey",
    name: "Mickey",
    voiceLabel: "Dave (British, rough)",
    blurb: "South-London boxing gaffer. Filthy-mouthed. Quick to call you soft.",
    previewLine: "Oi, on yer bike. Five minutes in and I already don't like the look of ya.",
    voiceId: "CYw3kZ02Hs0563khs1Fj",
    settings: { stability: 0.35, similarity_boost: 0.8, style: 0.7, use_speaker_boost: true },
    adult: true,
  },
  {
    id: "texas-champ",
    name: "Texas Champ",
    voiceLabel: "American male, mid-50s",
    blurb: "Retired American great. Plano. Seven Tours, give or take a UCI hearing.",
    previewLine: "Howdy. Seven fucking Tours, give or take a UCI hearing. Saddle up.",
    voiceId: "l7uf46H2eclzHIFxaO4N",
    settings: { stability: 0.55, similarity_boost: 0.8, style: 0.45, use_speaker_boost: true },
    adult: true,
  },
  {
    id: "velominati",
    name: "Rule #5",
    voiceLabel: "Older posh British",
    blurb: "Velominati cult-keeper. Posh-vulgar. Quotes the Rules.",
    previewLine: "Rule fucking five, sunshine. Harden the fuck up. Merckx didn't whinge about Z2.",
    voiceId: "ttNi9wVM8M97tsxE7PFZ",
    settings: { stability: 0.4, similarity_boost: 0.8, style: 0.6, use_speaker_boost: true },
    adult: true,
  },
];
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- tests/data/coaches.test.ts`
Expected: PASS — all four `it` blocks green.

- [ ] **Step 5: Run typecheck**

Run: `npm run typecheck`
Expected: zero errors.

- [ ] **Step 6: Commit**

```bash
git add src/data/coaches.ts tests/data/coaches.test.ts
git commit -m "data: add coaches roster + tests"
```

---

## Task 2: Audio generator script

**Files:**
- Create: `scripts/make-coach-audio.mjs`
- Create: `public/voice/coaches/` (directory, populated by running the script)

The script reads the data file from Task 1, hits ElevenLabs once per coach, and writes the MP3s. It is idempotent: existing files are skipped unless `--force` is passed. Not part of `npm run build`; run by hand.

- [ ] **Step 1: Create the script**

Create `scripts/make-coach-audio.mjs`:

```js
/**
 * One-shot ElevenLabs TTS generator for the coach widget.
 *
 * Reads src/data/coaches.ts and writes one mp3 per coach to
 * public/voice/coaches/<id>.mp3.
 *
 * Usage:
 *   ELEVENLABS_API_KEY=sk_... node scripts/make-coach-audio.mjs
 *   ELEVENLABS_API_KEY=sk_... node scripts/make-coach-audio.mjs --force
 *
 * --force re-renders every coach even if the mp3 already exists.
 */

import { mkdir, readFile, stat, unlink, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname, "../public/voice/coaches");
const DATA_FILE = resolve(__dirname, "../src/data/coaches.ts");

const apiKey = process.env.ELEVENLABS_API_KEY;
if (!apiKey) {
  console.error("error: ELEVENLABS_API_KEY is not set");
  process.exit(1);
}

const force = process.argv.includes("--force");

// We need to import coaches.ts from a plain Node ESM script. tsx/ts-node are
// not installed in this repo. The data file is structurally pure JS — only
// the `export interface Coach` block and the `: Coach[]` annotation on
// COACHES are TypeScript-only. Strip those textually and write the result to
// a sibling .mjs file that Node can import.
const src = await readFile(DATA_FILE, "utf8");
const stripped = src
  // Drop the whole `export interface Coach { ... }` block.
  .replace(/^export interface Coach \{[\s\S]*?^\}\n/m, "")
  // Drop the `: Coach[]` type annotation on the const declaration.
  .replace(/:\s*Coach\[\]/g, "");
const tmp = resolve(__dirname, ".coaches.tmp.mjs");
await writeFile(tmp, stripped, "utf8");
const { COACHES } = await import(pathToFileURL(tmp).href);
// Best-effort cleanup; leftover file isn't fatal.
try { await unlink(tmp); } catch {}

await mkdir(OUT_DIR, { recursive: true });

let generated = 0;
let skipped = 0;

for (const coach of COACHES) {
  const outPath = resolve(OUT_DIR, `${coach.id}.mp3`);
  if (!force) {
    try {
      const s = await stat(outPath);
      if (s.size > 0) {
        console.log(`skip ${coach.id}.mp3 (${s.size} bytes, already exists)`);
        skipped++;
        continue;
      }
    } catch {
      // doesn't exist, fall through to generate
    }
  }

  const url = `https://api.elevenlabs.io/v1/text-to-speech/${coach.voiceId}`;
  const body = {
    text: coach.previewLine,
    model_id: "eleven_multilingual_v2",
    voice_settings: coach.settings,
  };

  process.stdout.write(`gen ${coach.id} (${coach.voiceLabel}) ... `);
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
      "Accept": "audio/mpeg",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error(`FAIL ${res.status}: ${detail.slice(0, 200)}`);
    process.exit(1);
  }

  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(outPath, buf);
  console.log(`${buf.length} bytes`);
  generated++;
}

console.log(`\ndone. generated=${generated} skipped=${skipped}`);
```

- [ ] **Step 2: Verify the script syntax**

Run: `node --check scripts/make-coach-audio.mjs`
Expected: no output (syntax OK).

- [ ] **Step 3: Run the script with the real API key**

Run: `ELEVENLABS_API_KEY=$ELEVENLABS_API_KEY node scripts/make-coach-audio.mjs`

(Reid has the key in his environment. If you don't see it set, ask before guessing.)

Expected output (lines may vary in byte counts):
```
gen sergeant (Adam (deep, authoritative)) ... 28714 bytes
gen clinical (Daniel (precise British)) ... 41210 bytes
...
gen velominati (Older posh British) ... 36802 bytes

done. generated=13 skipped=0
```

- [ ] **Step 4: Verify all 13 MP3s exist and are non-empty**

Run: `ls -l public/voice/coaches/ | grep -c '\.mp3$'`
Expected: `13`

Run: `find public/voice/coaches -name "*.mp3" -size 0`
Expected: no output (no empty files).

- [ ] **Step 5: Spot-check one MP3 plays**

Run: `afplay public/voice/coaches/sergeant.mp3` (macOS) and listen.
Expected: short audio sample of Sergeant Steel's preview line. (Optional but recommended.)

- [ ] **Step 6: Verify idempotency**

Run: `ELEVENLABS_API_KEY=$ELEVENLABS_API_KEY node scripts/make-coach-audio.mjs`
Expected: every line says `skip <id>.mp3 (<bytes> bytes, already exists)`. Final line: `done. generated=0 skipped=13`.

- [ ] **Step 7: Commit script + MP3s**

```bash
git add scripts/make-coach-audio.mjs public/voice/coaches
git commit -m "audio: add coach preview mp3s + generator script"
```

---

## Task 3: React widget — tests first

**Files:**
- Create: `src/components/CoachWidget.tsx`
- Create: `tests/components/CoachWidget.test.tsx`

This is the only piece with non-trivial logic, so it gets TDD.

- [ ] **Step 1: Write the failing tests**

Create `tests/components/CoachWidget.test.tsx`:

```tsx
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CoachWidget, type CoachCardData } from "../../src/components/CoachWidget";

const fixtures: CoachCardData[] = [
  { id: "sergeant", name: "Sergeant Steel", voiceLabel: "Adam (deep)", blurb: "Drill-sergeant." },
  { id: "mate", name: "Mate", voiceLabel: "Charlie (Aussie)", blurb: "Aussie buddy." },
  { id: "wade", name: "Wade", voiceLabel: "Clyde (wry)", blurb: "Unhinged.", adult: true },
];

beforeEach(() => {
  // jsdom doesn't implement play/pause; stub them out.
  vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(() => Promise.resolve());
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
});

describe("CoachWidget", () => {
  it("renders every coach name", () => {
    render(<CoachWidget coaches={fixtures} />);
    for (const c of fixtures) {
      expect(screen.getByText(c.name)).toBeInTheDocument();
    }
  });

  it("renders the voice label and blurb for each coach", () => {
    render(<CoachWidget coaches={fixtures} />);
    expect(screen.getByText("Adam (deep)")).toBeInTheDocument();
    expect(screen.getByText("Drill-sergeant.")).toBeInTheDocument();
  });

  it("shows an 18+ chip on adult coaches only", () => {
    render(<CoachWidget coaches={fixtures} />);
    const chips = screen.getAllByText("18+");
    expect(chips).toHaveLength(1);
  });

  it("clicking play sets the audio src to the right file and plays", () => {
    render(<CoachWidget coaches={fixtures} />);
    const btn = screen.getByRole("button", { name: /play sample for sergeant steel/i });
    fireEvent.click(btn);
    const audio = document.querySelector("audio") as HTMLAudioElement;
    expect(audio.src).toMatch(/\/voice\/coaches\/sergeant\.mp3$/);
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalled();
  });

  it("clicking the active coach a second time pauses", () => {
    render(<CoachWidget coaches={fixtures} />);
    const btn = screen.getByRole("button", { name: /play sample for sergeant steel/i });
    fireEvent.click(btn);
    // After first click, button label flips to pause.
    const pauseBtn = screen.getByRole("button", { name: /pause sample for sergeant steel/i });
    fireEvent.click(pauseBtn);
    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalled();
    // Back to play label.
    expect(screen.getByRole("button", { name: /play sample for sergeant steel/i })).toBeInTheDocument();
  });

  it("clicking a different coach swaps the audio src and keeps playing", () => {
    render(<CoachWidget coaches={fixtures} />);
    fireEvent.click(screen.getByRole("button", { name: /play sample for sergeant steel/i }));
    fireEvent.click(screen.getByRole("button", { name: /play sample for mate/i }));
    const audio = document.querySelector("audio") as HTMLAudioElement;
    expect(audio.src).toMatch(/\/voice\/coaches\/mate\.mp3$/);
    // Sergeant's button is back to idle (play label).
    expect(screen.getByRole("button", { name: /play sample for sergeant steel/i })).toBeInTheDocument();
  });

  it("aria-pressed reflects which coach is playing", () => {
    render(<CoachWidget coaches={fixtures} />);
    const sergeantBtn = screen.getByRole("button", { name: /play sample for sergeant steel/i });
    expect(sergeantBtn).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(sergeantBtn);
    const pauseBtn = screen.getByRole("button", { name: /pause sample for sergeant steel/i });
    expect(pauseBtn).toHaveAttribute("aria-pressed", "true");
  });

  it("when audio ends, the active button resets", () => {
    render(<CoachWidget coaches={fixtures} />);
    fireEvent.click(screen.getByRole("button", { name: /play sample for sergeant steel/i }));
    const audio = document.querySelector("audio") as HTMLAudioElement;
    fireEvent.ended(audio);
    expect(screen.getByRole("button", { name: /play sample for sergeant steel/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test -- tests/components/CoachWidget.test.tsx`
Expected: FAIL — module-not-found for `../../src/components/CoachWidget`.

- [ ] **Step 3: Implement the component**

Create `src/components/CoachWidget.tsx`:

```tsx
import { useRef, useState } from "react";

export interface CoachCardData {
  id: string;
  name: string;
  voiceLabel: string;
  blurb: string;
  adult?: boolean;
}

interface Props {
  coaches: CoachCardData[];
}

export function CoachWidget({ coaches }: Props) {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  function handleClick(id: string) {
    const audio = audioRef.current;
    if (!audio) return;

    if (playingId === id) {
      audio.pause();
      setPlayingId(null);
      return;
    }

    audio.src = `/voice/coaches/${id}.mp3`;
    void audio.play().catch(() => {
      setPlayingId(null);
    });
    setPlayingId(id);
  }

  return (
    <div className="coach-widget">
      <audio
        ref={audioRef}
        preload="none"
        onEnded={() => setPlayingId(null)}
        onError={() => setPlayingId(null)}
      />
      <ol className="coach-widget__list">
        {coaches.map((c) => {
          const isPlaying = playingId === c.id;
          return (
            <li key={c.id} className="coach-widget__row">
              <div className="coach-widget__text">
                <p className="coach-widget__name">
                  {c.name}
                  {c.adult ? (
                    <span className="coach-widget__chip" aria-label="adult content">
                      18+
                    </span>
                  ) : null}
                </p>
                <p className="coach-widget__voice mono">{c.voiceLabel}</p>
                <p className="coach-widget__blurb">{c.blurb}</p>
              </div>
              <button
                type="button"
                className="coach-widget__btn"
                aria-pressed={isPlaying}
                aria-label={`${isPlaying ? "Pause" : "Play"} sample for ${c.name}`}
                onClick={() => handleClick(c.id)}
              >
                <span aria-hidden="true" className="coach-widget__glyph">
                  {isPlaying ? "❚❚" : "▶"}
                </span>
                <span className="coach-widget__btn-label">
                  {isPlaying ? "PAUSE" : "PLAY"}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export default CoachWidget;
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test -- tests/components/CoachWidget.test.tsx`
Expected: PASS — all 8 `it` blocks green.

- [ ] **Step 5: Run typecheck**

Run: `npm run typecheck`
Expected: zero errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/CoachWidget.tsx tests/components/CoachWidget.test.tsx
git commit -m "feat: CoachWidget react island with audio playback"
```

---

## Task 4: Astro wrapper

**Files:**
- Create: `src/components/Coaches.astro`

The Astro file is a thin shell: section header, lede paragraph, the React island. Heavy lifting is done.

- [ ] **Step 1: Create the wrapper**

Create `src/components/Coaches.astro`:

```astro
---
import CoachWidget, { type CoachCardData } from "./CoachWidget";
import { COACHES } from "../data/coaches";

const cards: CoachCardData[] = COACHES.map(({ id, name, voiceLabel, blurb, adult }) => ({
  id,
  name,
  voiceLabel,
  blurb,
  adult,
}));
---
<aside class="coaches">
  <p class="mono coaches__label">also in there &middot; the coaches</p>
  <p class="coaches__lede">
    Thirteen personalities. Press play on any of them.
    They&apos;ll say a few words.
  </p>
  <CoachWidget client:visible coaches={cards} />
</aside>
```

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: zero errors. (Astro check will validate the import and the prop type.)

- [ ] **Step 3: Commit**

```bash
git add src/components/Coaches.astro
git commit -m "feat: add Coaches.astro wrapper"
```

---

## Task 5: Wire into homepage + add styles

**Files:**
- Modify: `src/pages/index.astro` (one-line insertion only — do not touch other parts of the file)
- Modify: `src/styles/global.css` (append-only — add a new section at the end)

The homepage and global.css have unrelated uncommitted changes from another session. Touch ONLY the specific lines this task specifies. Use `git diff` after editing to confirm your patch is minimal.

- [ ] **Step 1: Insert `<Coaches />` after Itch #3 in index.astro**

In `src/pages/index.astro`, find the `</Itch>` closing tag of Itch #3 (the one that contains "I wanted it to not be boring."). Immediately after that closing tag, on a new line, insert:

```astro
      <Coaches />
```

Also add the import at the top of the frontmatter alongside the other component imports:

```astro
import Coaches from "../components/Coaches.astro";
```

- [ ] **Step 2: Verify your edit is minimal**

Run: `git diff src/pages/index.astro`
Expected: exactly two added lines — one `import` line in the frontmatter, one `<Coaches />` line in the body. Nothing else changed in this file.

If you accidentally touched other parts of the file (the unrelated in-progress changes), use `git checkout -p src/pages/index.astro` to keep only your two additions and discard everything else.

- [ ] **Step 3: Append styles to global.css**

Open `src/styles/global.css`. Scroll to the end of the file (after the existing `@keyframes rise` block). Append:

```css
/* ---------- coach widget ---------- */

.coaches {
  margin: 2.75rem 0 0;
  padding-left: calc(4.5rem + 1rem);
}

.coaches__label {
  margin: 0 0 0.25rem;
  opacity: 0.6;
  font-size: 0.7rem;
}

.coaches__lede {
  margin: 0 0 1.25rem;
  font-size: 0.95rem;
}

@media (max-width: 30rem) {
  .coaches {
    padding-left: calc(3.2rem + 1rem);
  }
}

.coach-widget__list {
  list-style: none;
  margin: 0;
  padding: 0;
  border-top: 1px solid color-mix(in srgb, var(--color-ink) 18%, transparent);
}

.coach-widget__row {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 0.5rem 1rem;
  padding: 0.9rem 0;
  border-bottom: 1px solid color-mix(in srgb, var(--color-ink) 18%, transparent);
}

.coach-widget__text {
  min-width: 0;
}

.coach-widget__name {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.1rem;
  line-height: 1.15;
  margin: 0 0 0.15rem;
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.coach-widget__chip {
  font-family: var(--font-mono);
  font-size: 0.6rem;
  letter-spacing: 0.06em;
  background: var(--color-mustard);
  color: var(--color-ink);
  padding: 1px 4px;
  border-radius: 2px;
  text-transform: uppercase;
  line-height: 1;
}

.coach-widget__voice {
  margin: 0 0 0.3rem;
  opacity: 0.6;
  font-size: 0.65rem;
}

.coach-widget__blurb {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.4;
}

.coach-widget__btn {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.55rem 0.85rem;
  border: 1.5px solid var(--color-ink);
  background: var(--color-mustard);
  color: var(--color-ink);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.95rem;
  letter-spacing: -0.01em;
  cursor: pointer;
  box-shadow: 3px 3px 0 var(--color-ink);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.coach-widget__btn:hover,
.coach-widget__btn:focus-visible {
  transform: translate(-2px, -2px);
  box-shadow: 5px 5px 0 var(--color-ink);
  outline: none;
}

.coach-widget__btn:active {
  transform: translate(1px, 1px);
  box-shadow: 2px 2px 0 var(--color-ink);
}

.coach-widget__btn[aria-pressed="true"] {
  background: var(--color-paper);
}

.coach-widget__glyph {
  font-size: 0.85rem;
  line-height: 1;
}
```

- [ ] **Step 4: Verify your global.css edit is minimal**

Run: `git diff src/styles/global.css`
Expected: only added lines at the end of the file (the block above). No modifications to existing rules. If you see existing rules in the diff, fix it.

- [ ] **Step 5: Smoke-test in the dev server**

Run: `npm run dev`
Visit http://localhost:4321 (or whatever port Astro prints).

Manually verify:
- After Itch #3 ("I wanted it to not be boring."), a "also in there · the coaches" section appears.
- All 13 coach names are visible.
- Wade, Mickey, Texas Champ, Rule #5 each show an `18+` chip next to the name.
- Clicking PLAY on any coach plays audio. Button flips to "PAUSE".
- Clicking PAUSE stops it. Button flips back.
- Clicking a different coach while one is playing stops the first and plays the second.
- When a clip ends naturally, the button flips back to PLAY on its own.
- Resize the window narrow (mobile). Layout still works: name + voice + blurb on left, button on right.

Stop the dev server with Ctrl-C.

- [ ] **Step 6: Run all tests**

Run: `npm run test`
Expected: all tests pass (the new coach + widget tests, plus the existing smoke test).

- [ ] **Step 7: Run typecheck**

Run: `npm run typecheck`
Expected: zero errors.

- [ ] **Step 8: Run a production build**

Run: `npm run build`
Expected: build succeeds. Output directory `dist/` contains the new MP3s under `dist/voice/coaches/`.

- [ ] **Step 9: Commit**

```bash
git add src/pages/index.astro src/styles/global.css
git commit -m "feat: ship coach widget on homepage"
```

---

## Acceptance check

After Task 5, verify against the spec's acceptance criteria:

- [ ] Homepage shows the new "the coaches" section after Itch #3.
- [ ] 13 coaches are listed; 4 have `18+` chips (Wade, Mickey, Texas Champ, Rule #5).
- [ ] Clicking play on any coach plays audio.
- [ ] Clicking a second coach mid-playback stops the first and plays the second.
- [ ] Audio finishing naturally returns the button to idle.
- [ ] `npm run test` passes.
- [ ] `npm run typecheck` passes.
- [ ] `npm run build` succeeds.
- [ ] No em dashes in the section's user-facing copy (the section header and lede paragraph).
- [ ] No accidental modifications to the unrelated in-progress files (`Lede.astro`, `Masthead.astro`, `WhatItIsnt.astro`, deleted `SubscribeCard.astro`, untracked `Screen.astro`, untracked `TesterCard.astro`).

If any of these fail, stop and report rather than papering over the issue.
