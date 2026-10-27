import puppeteer from 'puppeteer-core';
const out = 'C:/Users/arshm/AppData/Local/Temp/claude/c--Keyob-Websites-furtado-property/86170fa9-0004-442b-8cdc-c154292db7dc/scratchpad/';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new' });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto('http://localhost:3001/', { waitUntil: 'networkidle0', timeout: 90000 });
const top = await page.evaluate(() => document.querySelector('[data-world]').getBoundingClientRect().top + scrollY);
const h = await page.evaluate(() => document.querySelector('[data-world]').offsetHeight);
for (const f of [0.5, 0.56]) {
  await page.evaluate((y) => scrollTo(0, y), top + h * f);
  await page.evaluate(() => new Promise((r) => setTimeout(r, 2500)));
  await page.screenshot({ path: `${out}place-${f}.png` });
}
await browser.close();
console.log('done');
