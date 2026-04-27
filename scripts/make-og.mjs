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
