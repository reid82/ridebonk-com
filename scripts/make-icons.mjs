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
