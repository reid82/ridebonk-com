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
    voiceLabel: "Aria (placeholder - wants Dutch/Belgian)",
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
    voiceLabel: "Brian (placeholder - wants older British)",
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
