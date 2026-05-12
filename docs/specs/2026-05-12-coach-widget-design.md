# Coach Widget — design

**Date:** 2026-05-12
**Status:** approved, ready for plan

## Goal

Add a "meet the coaches" section to ridebonk.com that lists every BONK coach personality and lets the visitor press play to hear a one-line audio sample of each voice. Visitors should walk away with a concrete sense of what "a coach with a natural flair for the English language" means in practice.

## Why this exists

Itch #3 on the homepage already sets up the coach personalities conceptually ("there are a handful of coach personalities... sometimes they're at your expense"). Today the rider has to install the app and complete onboarding to hear what that actually sounds like. The widget moves that proof point onto the marketing site, where it can do the work it's meant to do: convert curious into intrigued.

## Roster

Mirror the 13 personalities currently shipped in `apps/mobile/src/lib/voice/personalities.ts` of the bonk monorepo:

| id            | name             | adult |
|---------------|------------------|-------|
| sergeant      | Sergeant Steel   |       |
| clinical      | Dr. Hodges       |       |
| mate          | Mate             |       |
| soigneuse     | Soigneuse        |       |
| boss          | Team Boss        |       |
| commentator   | The Commentator  |       |
| audax         | Audax Grandad    |       |
| headmistress  | The Headmistress |       |
| gravel        | Gravel Bro       |       |
| wade          | Wade             | 18+   |
| mickey        | Mickey           | 18+   |
| texas-champ   | Texas Champ      | 18+   |
| velominati    | Rule #5          | 18+   |

Adult coaches are shown inline with a small `18+` chip next to the name. No reveal gate, no separate section. The preview lines for the four adult personas are mild-to-moderate ("Howdy. Seven fucking Tours, give or take a UCI hearing.", "Oi, on yer bike. Five minutes in and I already don't like the look of ya.") and consistent with the swearing already on the homepage.

## Architecture

```
ridebonk.com/
├── scripts/
│   └── make-coach-audio.mjs        ← one-shot generator (NEW)
├── src/
│   ├── data/
│   │   └── coaches.ts              ← website source of truth (NEW)
│   ├── components/
│   │   ├── CoachWidget.tsx         ← React island, audio state (NEW)
│   │   └── Coaches.astro           ← Astro wrapper + section copy (NEW)
│   └── pages/
│       └── index.astro             ← inserts <Coaches /> after Itch #3 (EDIT)
└── public/
    └── voice/
        └── coaches/
            ├── sergeant.mp3        ← 13 files, committed (NEW)
            ├── clinical.mp3
            └── ...
```

### Data file (`src/data/coaches.ts`)

The single source of truth for the website. Manually mirrored from bonk's `personalities.ts`. Drift between bonk and ridebonk.com is acceptable: marketing site shows what we want to show, app is authoritative.

```ts
export interface Coach {
  id: string;            // matches mp3 filename
  name: string;
  voiceLabel: string;    // e.g. "Adam (deep, authoritative)"
  blurb: string;         // one-sentence character description
  previewLine: string;   // exact line spoken in the mp3, used by the gen script
  voiceId: string;       // ElevenLabs voice id, used by the gen script
  settings: {
    stability: number;
    similarity_boost: number;
    style?: number;
    use_speaker_boost?: boolean;
  };
  adult?: boolean;
}

export const COACHES: Coach[] = [ /* 13 entries */ ];
```

The component only needs `id`, `name`, `voiceLabel`, `blurb`, `adult`. `previewLine`, `voiceId`, and `settings` exist purely so the generator script can rebuild the mp3s without reaching into the bonk repo.

### Generator script (`scripts/make-coach-audio.mjs`)

One-shot. Run manually when preview lines or voices change.

- Reads `process.env.ELEVENLABS_API_KEY`. Aborts cleanly if missing.
- For each coach in `src/data/coaches.ts`:
  - POST `https://api.elevenlabs.io/v1/text-to-speech/{voiceId}` with `text: previewLine`, `voice_settings: settings`, `model_id: "eleven_multilingual_v2"`.
  - Stream response body to `public/voice/coaches/<id>.mp3`.
  - Log filename + size.
- Idempotent. Skips coaches whose mp3 already exists unless `--force` is passed.
- Total expected output: ~13 files, ~30-100KB each, ~0.6MB total. Cheap to commit.

The script is invoked as `node scripts/make-coach-audio.mjs` (or `--force` to regenerate). Not wired into `npm run build`. Marketing-site auth maintenance, not part of the deploy pipeline.

### React component (`src/components/CoachWidget.tsx`)

React island, hydrated `client:visible` so the JS payload only ships when the user scrolls to the section.

State (single source of truth for which coach is playing):
- `playingId: string | null` — id of the currently-playing coach, or null.

Behaviour:
- Single `<audio>` element rendered once (hidden, `preload="none"`).
- Click a coach's play button → set `audio.src = /voice/coaches/<id>.mp3`, call `audio.play()`, set `playingId = id`.
- Click the same coach while playing → pause, reset `playingId = null`.
- Click a different coach while one is playing → swap `src`, `audio.play()`, update `playingId`. Old one stops automatically because `audio.src` changes.
- `audio.onended` → `playingId = null`.
- `audio.onerror` → `playingId = null`, console.warn. (No retry UI; this is marketing, not production audio.)

Active state: the playing coach's button shows a pause glyph instead of play.

Accessibility:
- Each play button has `aria-pressed={playingId === id}` and `aria-label={`Play sample for ${coach.name}`}` (or `Pause`).
- Buttons are real `<button>` elements with visible focus ring (inherits site default).
- Audio element has no controls — visual button is the only control.
- Respects `prefers-reduced-motion` via the existing site `@media` rule (no extra work required; the component has no entrance animation of its own).

### Astro wrapper (`src/components/Coaches.astro`)

Section header in the "also in there" / mono-caption vocabulary already used by Colophon / the homepage `<aside class="also">`. Then a one-paragraph lede in body serif. Then the React island.

```astro
---
import CoachWidget, { type CoachCardData } from "./CoachWidget";
import { COACHES } from "../data/coaches";

const cards: CoachCardData[] = COACHES.map(({ id, name, voiceLabel, blurb, adult }) => ({
  id, name, voiceLabel, blurb, adult,
}));
---
<aside class="coaches">
  <p class="mono coaches-label">also in there · the coaches</p>
  <p class="coaches-lede">
    Thirteen personalities. Press play on any of them.
    They'll say a few words.
  </p>
  <CoachWidget client:visible coaches={cards} />
</aside>
```

`CoachCardData` is the trimmed view the React island needs (`id`, `name`, `voiceLabel`, `blurb`, `adult`). The wrapper maps `COACHES` down to that shape so the hydration payload doesn't include `voiceId`, `settings`, or `previewLine`, which are only needed by the generator script.

### Visual treatment

Type-only cards, no avatars, no glyphs. Stacked vertically. Each row:

```
┌────────────────────────────────────────────────┐
│  SERGEANT STEEL                         ▶ PLAY │
│  adam · deep, authoritative                    │
│  Drill-sergeant. Will absolutely call you soft.│
└────────────────────────────────────────────────┘
```

- Name: display serif, 1.1rem, ink colour.
- Voice label: mono small-caps, 0.7rem, 60% opacity.
- Blurb: body serif, 0.95rem.
- 18+ chip: 0.65rem mono, mustard background, ink text, 2px padding, 2px radius. Sits inline with the name.
- Play button: square-ish, 2.5rem high, mustard background, ink border 1.5px, ink text. Same boxy aesthetic as `tester-card__btn` but smaller. Shows "▶ PLAY" idle, "❚❚ PAUSE" when active.
- Row separators: 1px ink, 18% opacity.

Single column on all viewports (site max-width is 36rem, so this is effectively always mobile-friendly width).

## Placement

`src/pages/index.astro` — insert `<Coaches />` immediately after the closing tag of Itch #3, before Itch #4. No new `<WobblyRule />` needed; the Coaches section is conceptually a continuation of Itch #3, not a new beat.

## Testing

Vitest + React Testing Library (already configured). Three tests:

1. **Renders all coaches.** `render(<CoachWidget coaches={COACHES} />)` finds the name of every coach in the data file.
2. **Click plays the right file.** Mock `HTMLMediaElement.prototype.play`. Click Sergeant's button. Assert `audio.src` ends with `/voice/coaches/sergeant.mp3` and `play` was called.
3. **Exclusive playback.** Click Sergeant, then click Mate. Assert final `audio.src` is mate.mp3 and the active button is Mate's (Sergeant's button is back to idle state).

E2E in a real browser is out of scope; the audio behaviour is simple enough that unit tests cover it.

## Out of scope

- Volume slider, scrub bar, waveform visualisation.
- Transcript display (the line is short; hearing it is the point).
- Auto-advance to next coach.
- Analytics on which coach gets the most plays. (Could be added later via a thin fetch on play.)
- Persona portraits or avatars.
- A standalone `/coaches` page. The widget lives on the homepage; if traffic patterns later justify a dedicated page, that's a follow-up.
- Importing or syncing live from bonk's `personalities.ts`. Manual mirror is fine.

## Acceptance

- Visit ridebonk.com homepage on mobile and desktop.
- After Itch #3, see a "the coaches" section listing 13 coaches.
- Click any coach's play button → hear a one-sentence sample in their voice.
- Click a second coach while one is playing → first stops, second plays.
- Audio ends → button returns to idle.
- Adult coaches show a visible `18+` chip.
- Lighthouse a11y score on the homepage doesn't regress.
- `npm run test` passes.
- `npm run typecheck` passes.
- `npm run build` produces an output under Cloudflare's free-tier asset limits (current bundle is small; +13 mp3s × ~50KB is negligible).
