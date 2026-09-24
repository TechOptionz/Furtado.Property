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
// The supplied brand files (FURTADO_Logo-01 = ink, -02 = white, both 3334x1250 on transparent) carry a wide margin
// around the lockup, so the transparent padding is cropped first. Then the strokes are thickened evenly (the "F"
// a little more than the lettering), recoloured to a solid ink and scaled to three times the largest display height.
// The printed aspect ratio is what components/Logo.tsx uses to reserve the image's width.
async function logo(srcName, outName, color, displayHeight) {
  const src = sharp(original(srcName) || path.join(ROOT, 'public/assets', srcName)).ensureAlpha();
  const full = await src.raw().toBuffer({ resolveWithObject: true });
  const box = { l: full.info.width, t: full.info.height, r: 0, b: 0 };
  for (let y = 0; y < full.info.height; y++) for (let x = 0; x < full.info.width; x++) {
    if (full.data[(y * full.info.width + x) * 4 + 3] > 8) {
      if (x < box.l) box.l = x; if (x > box.r) box.r = x; if (y < box.t) box.t = y; if (y > box.b) box.b = y;
    }
  }
  const pad = Math.round((box.b - box.t) * 0.02); // a 2% margin so the thickened edge is never clipped and both variants share one shape
  const { data, info } = await src.extract({
    left: Math.max(0, box.l - pad), top: Math.max(0, box.t - pad),
    width: Math.min(full.info.width, box.r + pad + 1) - Math.max(0, box.l - pad),
    height: Math.min(full.info.height, box.b + pad + 1) - Math.max(0, box.t - pad),
  }).raw().toBuffer({ resolveWithObject: true });
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
  console.log(outName, `${m.width}x${m.height}`, kb(fs.statSync(out).size), `ratio ${(m.width / m.height).toFixed(3)}`);
}
await logo('logo-dark.png', 'logo-ink.webp', '20231F', 44);
await logo('logo-white.png', 'logo-light.webp', 'FCFAF6', 56);

// Favicon ------------------------------------------------------------------------------------------------------
// The brand supplied no standalone mark, so the tab icon is the "F" of the ink logo, cream on an ink square:
// app/icon.png and app/apple-icon.png (Next.js links them itself) plus app/favicon.ico for clients that still ask
// for that path. The .ico is the 32px PNG in an ICO wrapper, which every current browser reads.
{
  const src = sharp(original('logo-dark.png') || path.join(ROOT, 'public/assets/logo-dark.png')).ensureAlpha();
  const { data, info } = await src.raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height;
  const inked = (x, y) => data[(y * W + x) * 4 + 3] > 40;
  // Take the first run of inked columns (the F), then that run's own top and bottom.
  let l = -1, r = -1;
  for (let x = 0; x < W; x++) {
    let ink = false;
    for (let y = 0; y < H; y++) if (inked(x, y)) { ink = true; break; }
    if (ink && l < 0) l = x; else if (!ink && l >= 0) { r = x - 1; break; }
  }
  let t = H, b = 0;
  for (let y = 0; y < H; y++) for (let x = l; x <= r; x++) if (inked(x, y)) { if (y < t) t = y; if (y > b) b = y; break; }
  const glyphH = b - t + 1, glyphW = r - l + 1;
  const glyph = await src.extract({ left: l, top: t, width: glyphW, height: glyphH }).raw().toBuffer();
  const write = async (size, file) => {
    const gh = Math.round(size * 0.6), gw = Math.round((gh * glyphW) / glyphH);
    const cream = { r: 252, g: 250, b: 246 };
    // Thicken by about half a display pixel so the hairline crossbar survives at tab size.
    const rad = Math.round((glyphH / gh) * 0.5);
    const alpha = new Uint8ClampedArray(glyphW * glyphH);
    for (let i = 0; i < glyphW * glyphH; i++) alpha[i] = glyph[i * 4 + 3];
    const dilate = (a, horizontal) => {
      const o = new Uint8ClampedArray(glyphW * glyphH);
      for (let y = 0; y < glyphH; y++) for (let x = 0; x < glyphW; x++) {
        let m = 0;
        for (let k = -rad; k <= rad; k++) {
          const xx = horizontal ? x + k : x, yy = horizontal ? y : y + k;
          if (xx >= 0 && xx < glyphW && yy >= 0 && yy < glyphH && a[yy * glyphW + xx] > m) m = a[yy * glyphW + xx];
        }
        o[y * glyphW + x] = m;
      }
      return o;
    };
    const thick = rad > 0 ? dilate(dilate(alpha, true), false) : alpha;
    const px = Buffer.alloc(glyphW * glyphH * 4);
    for (let i = 0; i < glyphW * glyphH; i++) { px[i * 4] = cream.r; px[i * 4 + 1] = cream.g; px[i * 4 + 2] = cream.b; px[i * 4 + 3] = thick[i]; }
    const letter = await sharp(px, { raw: { width: glyphW, height: glyphH, channels: 4 } }).resize({ width: gw, height: gh, kernel: 'lanczos3' }).png().toBuffer();
    const radius = Math.round(size * 0.18);
    const mask = Buffer.from(`<svg width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${radius}" fill="#20231F"/></svg>`);
    const png = await sharp(mask).composite([{ input: letter, left: Math.round((size - gw) / 2), top: Math.round((size - gh) / 2) }]).png().toBuffer();
    if (file) fs.writeFileSync(path.join(ROOT, 'app', file), png);
    return png;
  };
  await write(512, 'icon.png');
  await write(180, 'apple-icon.png');
  const png32 = await write(32);
  const ico = Buffer.alloc(6 + 16);
  ico.writeUInt16LE(0, 0); ico.writeUInt16LE(1, 2); ico.writeUInt16LE(1, 4);
  ico.writeUInt8(32, 6); ico.writeUInt8(32, 7); ico.writeUInt8(0, 8); ico.writeUInt8(0, 9);
  ico.writeUInt16LE(1, 10); ico.writeUInt16LE(32, 12); ico.writeUInt32LE(png32.length, 14); ico.writeUInt32LE(22, 18);
  fs.writeFileSync(path.join(ROOT, 'app/favicon.ico'), Buffer.concat([ico, png32]));
  console.log('app/icon.png, app/apple-icon.png, app/favicon.ico from the logo "F"', `${glyphW}x${glyphH}`);
}
