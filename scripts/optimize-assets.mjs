// Prepares the media in public/ for the web. Run after adding or replacing images:  npm run assets
//   - photographs larger than MAX_EDGE are scaled down and re-encoded (next/image still makes the per-device sizes;
//     this keeps its source files small, so the first optimised request is quick and nothing huge is ever served)
//   - the logo PNGs have hairline strokes that vanish at header size, so solid, slightly thickened versions are
//     rendered once here at display resolution instead of being redrawn on a canvas in every visitor's browser
//   - the hero film's poster is cut to phone and desktop sizes
//   - lib/image-meta.json records each photograph's dominant colour, shown as its placeholder while it loads
// Untouched originals live outside the app in ../uploads/image-originals.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const UPLOADS = path.join(ROOT, 'public/uploads');
const ORIGINALS = path.resolve(ROOT, '../uploads/image-originals');
const MAX_EDGE = 2400;
const BYTES_PER_PIXEL = 0.45; // above this a file is re-encoded even if its dimensions are fine

const kb = (n) => `${Math.round(n / 1024)}KB`;
const original = (name) => (fs.existsSync(path.join(ORIGINALS, name)) ? path.join(ORIGINALS, name) : null);

// Photographs --------------------------------------------------------------------------------------------------
const meta = {};
for (const name of fs.readdirSync(UPLOADS).sort()) {
  const file = path.join(UPLOADS, name);
  const src = original(name) || file;
  const input = fs.readFileSync(src);
  const { width, height } = await sharp(input).metadata();
  const edge = Math.max(width, height);
  const current = fs.statSync(file).size;
  const shrink = Math.min(1, MAX_EDGE / edge);
  const heavy = current / (width * height * shrink * shrink) > BYTES_PER_PIXEL;
  if (edge > MAX_EDGE || heavy) {
    let img = sharp(input).rotate();
    if (edge > MAX_EDGE) img = img.resize({ width: width >= height ? MAX_EDGE : undefined, height: height > width ? MAX_EDGE : undefined });
    const out = /\.webp$/.test(name) ? await img.webp({ quality: 86, effort: 6 }).toBuffer() : await img.jpeg({ quality: 86, mozjpeg: true }).toBuffer();
    if (out.length < current * 0.9) {
      fs.writeFileSync(file, out);
      console.log(`${name}: ${width}x${height} ${kb(current)} → ${kb(out.length)}`);
    }
  }
  const { dominant } = await sharp(fs.readFileSync(file)).stats();
  // Softened towards the page's cream so the placeholder never reads as a hard block of colour.
  const mix = (c, to) => Math.round(c * 0.5 + to * 0.5);
  meta[`/uploads/${name}`] = '#' + [mix(dominant.r, 238), mix(dominant.g, 233), mix(dominant.b, 223)].map((c) => c.toString(16).padStart(2, '0')).join('');
}
fs.writeFileSync(path.join(ROOT, 'lib/image-meta.json'), JSON.stringify(meta, null, 2) + '\n');
console.log('wrote lib/image-meta.json');

// Hero poster --------------------------------------------------------------------------------------------------
const poster = original('video/hero-poster.jpg') || path.join(ROOT, 'public/video/hero-poster.jpg');
// Phones show the film cropped to portrait, so their poster is cut to the middle of the frame at full height.
await sharp(poster).resize({ width: 900, height: 1600, fit: 'cover', position: 'centre', kernel: 'lanczos3' }).webp({ quality: 72, effort: 6 }).toFile(path.join(ROOT, 'public/video/hero-poster-portrait.webp'));
await sharp(poster).resize({ width: 1920 }).webp({ quality: 78, effort: 6 }).toFile(path.join(ROOT, 'public/video/hero-poster.webp'));
await sharp(poster).resize({ width: 1920 }).jpeg({ quality: 78, mozjpeg: true }).toFile(path.join(ROOT, 'public/video/hero-poster.jpg'));
for (const f of ['hero-poster-portrait.webp', 'hero-poster.webp', 'hero-poster.jpg']) console.log(f, kb(fs.statSync(path.join(ROOT, 'public/video', f)).size));

// Logos --------------------------------------------------------------------------------------------------------
// Thicken the strokes evenly (the "F" mark a little more than the lettering), recolour to a solid ink and scale to
// three times the largest display height.
async function logo(srcName, outName, color, displayHeight) {
  const { data, info } = await sharp(original(srcName) || path.join(ROOT, 'public/assets', srcName)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height;
  const a = new Uint8ClampedArray(W * H);
  for (let i = 0; i < W * H; i++) a[i] = data[i * 4 + 3];
  let started = false, split = Math.round(W * 0.13);
  for (let x = 0; x < W; x++) {
    let ink = false;
    for (let y = 0; y < H; y++) if (a[y * W + x] > 40) { ink = true; break; }
    if (ink) started = true; else if (started) { split = x; break; }
  }
  const scale = H / displayHeight;
  const radius = { mark: Math.round(scale * 0.55), text: Math.round(scale * 0.35) };
  const pass = (src, horizontal) => {
    const out = new Uint8ClampedArray(W * H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const r = x < split ? radius.mark : radius.text;
      let m = 0;
      for (let k = -r; k <= r; k++) {
        const xx = horizontal ? x + k : x, yy = horizontal ? y : y + k;
        if (xx >= 0 && xx < W && yy >= 0 && yy < H && src[yy * W + xx] > m) m = src[yy * W + xx];
      }
      out[y * W + x] = m;
    }
    return out;
  };
  const thick = pass(pass(a, true), false);
  const rgb = color.match(/\w\w/g).map((h) => parseInt(h, 16));
  const px = Buffer.alloc(W * H * 4);
  for (let i = 0; i < W * H; i++) { px[i * 4] = rgb[0]; px[i * 4 + 1] = rgb[1]; px[i * 4 + 2] = rgb[2]; px[i * 4 + 3] = thick[i]; }
  const out = path.join(ROOT, 'public/assets', outName);
  await sharp(px, { raw: { width: W, height: H, channels: 4 } }).resize({ height: displayHeight * 3 }).webp({ quality: 90, alphaQuality: 100, effort: 6 }).toFile(out);
  const m = await sharp(out).metadata();
  console.log(outName, `${m.width}x${m.height}`, kb(fs.statSync(out).size));
}
await logo('logo-dark.png', 'logo-ink.webp', '20231F', 44);
await logo('logo-white.png', 'logo-light.webp', 'FCFAF6', 56);
