/**
 * One-off / utility: make uniform black/gray backdrop transparent (keeps navy text etc.).
 * Usage: node scripts/remove-logo-black-bg.mjs <input.png> <output.png>
 */
import sharp from "sharp";

function isBackdropPixel(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  // Solid black + gray anti-alias ring; exclude coloured dark pixels (e.g. navy "Job").
  return max < 48 && max - min < 18;
}

const input = process.argv[2];
const output = process.argv[3];
if (!input || !output) {
  console.error("Usage: node scripts/remove-logo-black-bg.mjs <input.png> <output.png>");
  process.exit(1);
}

const { data, info } = await sharp(input)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const channels = info.channels;
if (channels !== 4) {
  console.error("Expected RGBA");
  process.exit(1);
}

const buf = Buffer.from(data);
for (let i = 0; i < buf.length; i += 4) {
  const r = buf[i];
  const g = buf[i + 1];
  const b = buf[i + 2];
  if (isBackdropPixel(r, g, b)) {
    buf[i + 3] = 0;
  }
}

await sharp(buf, {
  raw: { width: info.width, height: info.height, channels: 4 },
})
  .png({ compressionLevel: 9 })
  .toFile(output);

console.log("Wrote", output);
