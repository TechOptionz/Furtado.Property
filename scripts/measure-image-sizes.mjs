// Measures how wide every next/image on the generated pages is actually drawn, and writes the matching `sizes`
// attribute for each to scripts/image-sizes.json; scripts/convert.mjs reads that file. Accurate `sizes` is what lets
// a phone pick the 640px file for a card instead of the 1080px one.
//   1. npm run build && npx next start -p 3100      (any running copy of the site will do)
//   2. npm run sizes -- http://localhost:3100
//   3. npm run convert
// Needs a local Chrome or Edge (CHROME_PATH overrides the lookup). Re-run after layout changes.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const base = process.argv[2] || 'http://localhost:3000';
const PAGES = { 'app/page.tsx': '/', 'app/about/page.tsx': '/about', 'app/projects/page.tsx': '/projects', 'app/projects/mira-living/page.tsx': '/projects/mira-living' };
// One viewport per band of the generated media conditions.
const BANDS = [
  { width: 390, query: '(max-width: 639px)' },
  { width: 820, query: '(max-width: 1023px)' },
  { width: 1366, query: '(max-width: 1599px)' },
  { width: 1920, query: null },
];
const chrome = [process.env.CHROME_PATH, 'C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome']
  .find((p) => p && fs.existsSync(p));
if (!chrome) throw new Error('No Chrome or Edge found; set CHROME_PATH.');

const browser = await puppeteer.launch({ executablePath: chrome, headless: 'new' });
const result = {};
for (const [file, route] of Object.entries(PAGES)) {
  const widths = []; // [band][image] → css px
  for (const band of BANDS) {
    const page = await browser.newPage();
    await page.setViewport({ width: band.width, height: 900 });
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await page.goto(base + route, { waitUntil: 'domcontentloaded' });
    widths.push(await page.evaluate(() => [...document.querySelectorAll('main img[data-nimg]')].map((img) => Math.ceil(img.getBoundingClientRect().width))));
    await page.close();
  }
  result[file] = widths[0].map((_, i) => {
    const px = BANDS.map((_, b) => widths[b][i]);
    // An image hidden in one band (the phone-only copies inside sticky scenes) borrows its neighbour's width; the
    // browser never requests it there anyway.
    px.forEach((w, b) => { if (!w) px[b] = px.slice(b).find(Boolean) || [...px.slice(0, b)].reverse().find(Boolean) || 1; });
    return BANDS.map((band, b) => {
      // Fluid below the widest band (rounded up to 5vw so small layout changes do not under-serve), fixed above it
      // where every container has reached its max-width.
      const vw = Math.min(100, Math.ceil((px[b] / band.width) * 20) * 5);
      // Full-bleed images stay fluid on the widest screens too.
      return band.query ? `${band.query} ${vw}vw` : vw >= 95 ? "100vw" : `${Math.ceil(px[b] / 10) * 10}px`;
    }).join(', ');
  });
  console.log(file, result[file].length, 'images');
}
await browser.close();
fs.writeFileSync(path.join(ROOT, 'scripts/image-sizes.json'), JSON.stringify(result, null, 2) + '\n');
console.log('wrote scripts/image-sizes.json');
