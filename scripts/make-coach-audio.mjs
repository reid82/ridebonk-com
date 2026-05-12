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
