# Furtado Property — Next.js site

Next.js (App Router, TypeScript) build of the Furtado Property design export. The export (`../*.dc.html`,
`../uploads/image-originals`) is kept beside this repo, not in it; see **Generated files** below for what that means.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

## Routes

| Route | Source |
| --- | --- |
| `/` | generated from `Home.dc.html` (`app/page.tsx`) |
| `/about` | generated from `About.dc.html` (`app/about/page.tsx`) |
| `/projects` | handwritten — `app/projects/page.tsx`, one component per section in `components/projects/`, all reading `lib/projects.ts` |
| `/projects/mira-living` | generated from `Mira-Living.dc.html` (`app/projects/mira-living/page.tsx`) |
| `/contact` | handwritten — `app/contact/` (page, `ContactForm.tsx`, `contact.module.css`) |
| `/privacy`, `/terms` | handwritten — `app/privacy`, `app/terms`, both on `components/legal/LegalPage.tsx` |
| `POST /api/enquiry` | enquiry form delivery (`app/api/enquiry/route.ts`) |

## How it is put together

- **Generated files** — `app/page.tsx`, `app/about/page.tsx`, `app/projects/mira-living/page.tsx`,
  `components/SiteHeader.tsx`, `components/SiteFooter.tsx`, `components/EnquiryForm.tsx` and `app/interactions.css`
  were compiled from the design export by `scripts/convert.mjs`; each carries a header saying so. The export is not in
  this repo. While it is in the parent folder, change it or the script and re-run `npm run convert` rather than editing
  these files by hand. Without it, `npm run convert` stops before writing anything and these files are the source:
  edit them directly and keep the header. Header/form behaviour (state, effects) lives in the `COMPONENTS` config at
  the top of that script.
- **Handwritten files** — everything else: `app/layout.tsx`, `app/globals.css`, the `/projects`, `/contact`,
  `/privacy` and `/terms` routes, the remaining `components/` (intro, hero, story, chat, …), `lib/`,
  `app/api/enquiry/route.ts` and `scripts/`.
- **Motion** — `lib/site.js` is the design's reveal / scroll-scene script (`data-reveal`, `data-scene`, …), started
  from `SiteEffects` on load and after each navigation. It is IntersectionObserver-only (no scroll listeners), animates
  `opacity` / `transform` / `clip-path` once per element, and runs a lighter variant on phones.
- **Status text** — "Now selling", the completion date and the construction stages live in `lib/projects.ts`
  (`miraLiving`). `lib/site-config.ts` derives the status lines from them, and the pages, footer, chat and page
  descriptions read those, so a figure is changed in one place. The figures the client still has to confirm are marked
  `TODO` there; the page shows "Last updated: to be confirmed" until `lastUpdated` is set.
- **Images** — served through `next/image` (AVIF/WebP, lazy by default). After adding or replacing a photograph:
  `npm run assets` (caps sources at 2400px, re-encodes heavy files, renders the logos and hero posters, records each
  photo's placeholder colour in `lib/image-meta.json`), then with the site running `npm run sizes -- <url>` (measures
  the real `sizes` of every image into `scripts/image-sizes.json`) and `npm run convert`. Untouched originals live
  in `../uploads/image-originals`.

## Enquiry form

The form posts to `/api/enquiry`, which emails the enquiry through [Resend](https://resend.com). Copy
`.env.example` to `.env.local` and set `RESEND_API_KEY` (and a verified `ENQUIRY_FROM` address). Without a key the
API answers 503 and the form asks the visitor to phone or email instead.

## Differences from the design export

- Intro curtain, header and footer live in the root layout; the intro plays on full page loads only, and entrance
  animations wait for it to lift.
- Header nav/drawer switching is CSS-driven (no layout flash on phones); the drawer closes on navigation and Escape.
- Fixed horizontal overflow on phones (About, Mira Living hero images) and the cramped first chapter of the home
  story on phones — see the notes in `scripts/convert.mjs` and the end of `app/globals.css`.

## Performance notes

- Home montage: `node scripts/render-home-hero.mjs` (requires FFmpeg) blends the original coastal hero with Mira
  Living exterior, kitchen and living scenes into muted 1080p/720p loops. Source films remain unchanged; outputs
  are `public/video/hero-mira-*.mp4`, with a closing dissolve back into the opening coastal shot.

- Home hero: the poster (portrait crop on phones) is preloaded and paints first; the film is fetched after `load`,
  fades in, pauses off screen, and is skipped for reduced-motion / Save-Data visitors. Parallax is desktop-only; phones
  fade the hero copy with a CSS scroll timeline.
- The only scroll listeners are the home story progress bar and the desktop hero parallax, both rAF-throttled and
  attached only while their section is on screen. Header state, reveals and scenes use IntersectionObserver.
- `backdrop-filter` is limited to the desktop nav bar and caption pills (`.glass`); phones use denser fills instead.
- Responsive rules the export applied with JavaScript (`data-show`, `data-vh`, `data-gallery`) are CSS in
  `app/globals.css`, as are the phone type tokens (`--fs-NN`), footer stacking and touch targets.
