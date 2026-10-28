// Regenerates lib/enquiry-logo.json: the white wordmark from public/assets/logo-white.png, trimmed and sized for the
// enquiry email header, embedded as base64 so the email never depends on the website being online.
//   npm run mail:logo
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import sharp from "sharp";

const root = resolve(import.meta.dirname, "..");
const buf = await sharp(resolve(root, "public/assets/logo-white.png"))
  .trim()
  .resize({ width: 520 })
  .png({ compressionLevel: 9, palette: true })
  .toBuffer();
const { width, height } = await sharp(buf).metadata();
const out = resolve(root, "lib/enquiry-logo.json");
writeFileSync(out, JSON.stringify({ source: "public/assets/logo-white.png via scripts/email-logo.mjs", width, height, base64: buf.toString("base64") }, null, 2).replace(/\n/g, "\r\n") + "\r\n");
console.log(`lib/enquiry-logo.json: ${width}x${height}, ${buf.length} bytes`);
