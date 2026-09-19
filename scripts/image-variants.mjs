// Renders every size of every photograph once, ahead of time:  npm run variants  (also runs before each build)
// next/image's own optimiser encodes a size the first time a visitor asks for it, which costs 0.3–2s per AVIF and
// stalls a page of twenty photographs. Here each photograph in public/uploads is written to public/img as
// <name>-<width>.<version>.webp and .avif for every width next/image may request (next.config.ts), so the site only
// ever serves static files. lib/image-loader.ts maps a request onto these files using lib/image-variants.json.
// The version is a hash of the source and the encoder settings: replacing a photograph changes its URLs, which is
// what lets /img be cached for ever. Only missing files are encoded; files that no longer belong are removed.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const UPLOADS = path.join(ROOT, 'public/uploads');
const OUT = path.join(ROOT, 'public/img');
// Keep in step with imageSizes + deviceSizes in next.config.ts.
const WIDTHS = [160, 256, 384, 480, 640, 828, 1080, 1280, 1600, 1920, 2400];
const ENCODE = { webp: { quality: 75, effort: 5 }, avif: { quality: 55, effort: 5 } };

fs.mkdirSync(OUT, { recursive: true });
const manifest = {};
const keep = new Set();
const names = new Set();
let made = 0;
for (const file of fs.readdirSync(UPLOADS).sort()) {
  const name = file.replace(/\.\w+$/, '');
  if (names.has(name)) throw new Error(`two photographs are called "${name}"; rename one`);
  names.add(name);
  const input = fs.readFileSync(path.join(UPLOADS, file));
  const v = crypto.createHash('sha1').update(input).update(JSON.stringify(ENCODE)).digest('hex').slice(0, 8);
  const { width } = await sharp(input).metadata();
  // Never upscale: a photograph narrower than the smallest width is still offered at that one size.
  const widths = WIDTHS.filter((w) => w <= width);
  if (!widths.length) widths.push(WIDTHS[0]);
  manifest[`/uploads/${file}`] = { w: widths.at(-1), v };
  for (const w of widths) {
    for (const format of ['webp', 'avif']) {
      const out = `${name}-${w}.${v}.${format}`;
      keep.add(out);
      if (fs.existsSync(path.join(OUT, out))) continue;
      await sharp(input).rotate().resize({ width: w, withoutEnlargement: true })[format](ENCODE[format]).toFile(path.join(OUT, out));
      made++;
    }
  }
}
let removed = 0;
for (const f of fs.readdirSync(OUT)) if (!keep.has(f)) { fs.unlinkSync(path.join(OUT, f)); removed++; }
fs.writeFileSync(path.join(ROOT, 'lib/image-variants.json'), JSON.stringify(manifest, null, 2) + '\n');
const total = [...keep].reduce((n, f) => n + fs.statSync(path.join(OUT, f)).size, 0);
console.log(`public/img: ${keep.size} files (${(total / 1048576).toFixed(1)}MB), ${made} encoded, ${removed} removed`);
