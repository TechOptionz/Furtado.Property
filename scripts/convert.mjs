// Compiles the design export (../*.dc.html) into Next.js pages and components.
//   node scripts/convert.mjs
// Inline styles become style objects, style-hover/focus/active become generated classes (app/interactions.css),
// {{ bindings }}, <sc-if> and <sc-for> become JSX expressions, images become next/image with local files.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { parse } from 'node-html-parser';
import { imageSize } from 'image-size';
import prettier from 'prettier';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.resolve(ROOT, '..');
const REMOTE = 'https://furtado-property.vercel.app';

const ROUTES = {
  './Home.dc.html': '/',
  './About.dc.html': '/about',
  './Projects.dc.html': '/projects',
  './Mira-Living.dc.html': '/projects/mira-living',
  './Contact.dc.html': '/contact',
};

const DESCRIPTIONS = {
  Home: 'Building Dreams, Creating Homes. Residential developments in South East Queensland, built on 20 years of experience. Now selling — Mira Living, Bargara QLD.',
  About: 'Furtado Property is a residential developer in South East Queensland with over 20 years of property industry experience.',
  Projects: 'Creating homes designed for longevity across South East Queensland.',
  'Mira-Living': 'Discover the epitome of luxury coastal living at Mira Living, a stunning apartment complex nestled seaside in the charming coastal enclave of Bargara. Now selling — completion Q2 2026.',
  Contact: 'Interested in one of our developments or want to learn more? Call 0418 982 517 or email info@furtadoproperty.com.au.',
};

// Written by scripts/optimize-assets.mjs (placeholder colour per photograph) and scripts/measure-image-sizes.mjs
// (the `sizes` each image actually needs, measured from the rendered pages). Both are optional.
const readJson = (file, fallback) => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8')); } catch { return fallback; } };
const IMAGE_META = readJson('lib/image-meta.json', {});
const IMAGE_SIZES = readJson('scripts/image-sizes.json', {});

const SITE_VARS = ['salesStatus', 'completion', 'constructionStatus', 'structureStatus', 'availability', 'statusLine'];

const PAGES = [
  {
    file: 'Home', out: 'app/page.tsx', noPreload: true, extra: '<HomeStory /><CountUp />',
    extraImport: 'import HomeStory from "@/components/HomeStory";\nimport HomeHero from "@/components/HomeHero";\nimport CountUp from "@/components/CountUp";',
    // The video hero (components/HomeHero.tsx) opens the page and owns the h1; the story below it starts at #story.
    // The export's first story chapter repeats the hero (same headline, copy and buttons), so it is dropped and the
    // remaining five are renumbered; the new first chapter starts visible. Captions live in components/HomeStory.tsx.
    patchDom: (root) => {
      const world = root.querySelector('[data-screen-label="Story"]');
      const visible = (el) => el.setAttribute('style', el.getAttribute('style').replace(/opacity:0;|transform:[^;]+;|pointer-events:none;/g, ''));
      for (const attr of ['data-chapter-text', 'data-chapter-img']) {
        const els = world.querySelectorAll(`[${attr}]`);
        els[0].remove();
        els.slice(1).forEach((el, i) => { el.setAttribute(attr, String(i)); if (i === 0) visible(el); });
      }
      const n = world.querySelectorAll('[data-chapter-text]').length;
      world.querySelectorAll('[data-chapter-text] span').forEach((s) => {
        const m = s.text.match(/^(\d\d) \/ \d\d$/);
        if (m) s.set_content(`${String(m[1] - 1).padStart(2, '0')} / ${String(n).padStart(2, '0')}`);
      });
      world.querySelector('[data-world-caption]').set_content('Bargara Golf Club to the coast');
      world.setAttribute('style', world.getAttribute('style').replace('height:560vh', 'height:480vh'));
      // With one chapter gone, the running section numbers further down the page shift by one ("07 / 12" → "06 / 11").
      root.querySelectorAll('span').forEach((s) => {
        const m = s.text.match(/^(\d\d) \/ 12(.*)$/);
        if (m) s.set_content(`${String(m[1] - 1).padStart(2, '0')} / 11${m[2]}`);
      });
      // Figures: whole numbers count up when the cards scroll in (components/CountUp.tsx), every card lifts on hover
      // (the export leaves the highlighted one static), and the status badge gets a live dot.
      const cards = root.querySelectorAll('[data-screen-label="Figures"] > div > div');
      const hover = cards[0].getAttribute('style-hover'), ease = cards[0].getAttribute('style').match(/transition:[^;]+/)[0];
      for (const card of cards) {
        const figure = card.querySelectorAll('span').find((s) => /^\d+\+?$/.test(s.text.trim()));
        if (figure) figure.setAttribute('data-count', '');
        if (!card.getAttribute('style-hover')) {
          card.setAttribute('style-hover', hover);
          card.setAttribute('style', `${card.getAttribute('style')};${ease}`);
          card.querySelector('span').insertAdjacentHTML('afterbegin', '<span class="live-dot"></span>');
        }
      }
    },
    patch: (jsx) => jsx
      .replace(/(<main\b[^>]*>)/, '$1<HomeHero />')
      .replace('data-world=""', 'data-world="" id="story"')
      // The centred labels carry their running number as bare text ("09 / 12 · The residences").
      .replace(/(\d\d) \/ 12 ·/g, (_, n) => `${String(n - 1).padStart(2, '0')} / 11 ·`),
  },
  // The aerial image break (photo + overlapping quote card) is dropped from both pages, and the running section
  // numbers close the gap ("06 / 06" → "05 / 05").
  { file: 'About', out: 'app/about/page.tsx', ...dropSection('Image', 6) },
  { file: 'Projects', out: 'app/projects/page.tsx' },
  { file: 'Mira-Living', out: 'app/projects/mira-living/page.tsx', ...dropSection('Lifestyle', 9) },
  // /contact is handwritten (app/contact/) and no longer compiled from Contact.dc.html.
];

const COMPONENTS = [
  {
    file: 'SiteHeader', out: 'components/SiteHeader.tsx', client: true,
    logo: { color: '#20231F', height: 40 },
    ifAsClass: { wide: 'only-wide', narrow: 'only-narrow' },
    imports: 'import { useEffect, useRef, useState } from "react";\nimport { usePathname } from "next/navigation";',
    noGlass: true, // the bar and scrim get their own rules in globals.css
    signature: 'SiteHeader()',
    // Hooks for globals.css (bar states, phone bar height, drawer) and the close button's ref.
    patch: (jsx) => jsx
      .replace('ref={barRef}', 'ref={barRef} className="site-bar"')
      .replace('ref={innerRef}', 'className="site-bar-inner"')
      .replace('role="dialog"', 'role="dialog" aria-modal="true" className="site-drawer"')
      .replace(/onClick={closeMenu}(?=[^>]*animation: "scrimIn)/, 'onClick={closeMenu} className="site-scrim"')
      .replace('aria-label="Close menu"', 'aria-label="Close menu" ref={closeRef}'),
    preamble: `
  const pathname = usePathname();
  // The drawer is open only for the route it was opened on, so navigating closes it.
  const [openAt, setOpenAt] = useState<string | null>(null);
  const menuOpen = openAt === pathname;
  const barRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Over the home hero film the bar stays clear until the hero has scrolled out from under it; elsewhere it turns
    // solid as soon as the page moves. No scroll listener: an IntersectionObserver watches the hero (or, on other
    // pages, a marker across the top 8px of the document) and flips two attributes that globals.css styles —
    // .site-bar[data-scrolled] and html[data-over-hero].
    const hero = document.querySelector("[data-video-hero]");
    const marker = hero ? null : document.createElement("div");
    if (marker) {
      marker.style.cssText = "position:absolute;top:0;left:0;width:1px;height:8px;pointer-events:none";
      document.body.append(marker);
    }
    const io = new IntersectionObserver(([e]) => {
      const s = !e.isIntersecting;
      document.documentElement.toggleAttribute("data-over-hero", !!hero && !s);
      barRef.current?.toggleAttribute("data-scrolled", s);
    }, { rootMargin: hero ? "-64px 0px 0px 0px" : "0px" });
    io.observe(hero || marker!);
    const mq = matchMedia("(min-width: 1024px)");
    const onMq = () => { if (mq.matches) setOpenAt(null); };
    mq.addEventListener("change", onMq);
    return () => { io.disconnect(); marker?.remove(); mq.removeEventListener("change", onMq); };
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    // While the drawer is open the page behind it does not scroll, Escape closes it, and focus starts on Close.
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpenAt(null); };
    addEventListener("keydown", onKey);
    return () => { root.style.overflow = prev; removeEventListener("keydown", onKey); };
  }, [menuOpen]);

  const items: [string, string][] = [
    ["Home", "/"], ["About", "/about"], ["Projects", "/projects"],
    ["Mira Living", "/projects/mira-living"], ["Contact", "/contact"],
  ];
  // The most specific matching route is the active one (/projects/mira-living beats /projects).
  const activeHref = items.map(([, href]) => href)
    .filter((href) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/")))
    .sort((a, b) => b.length - a.length)[0];
  const links = items.map(([label, href], i) => ({
    label, href, index: "0" + (i + 1),
    color: href === activeHref ? "#20231F" : "rgba(32,35,31,.65)",
    line: href === activeHref ? "#B59168" : "transparent",
  }));
  const openMenu = () => setOpenAt(pathname);
  const closeMenu = () => setOpenAt(null);
`,
  },
  {
    file: 'SiteFooter', out: 'components/SiteFooter.tsx',
    logo: { color: '#FCFAF6', height: 44 },
    imports: 'import { site } from "@/lib/site-config";',
    signature: 'SiteFooter()',
    preamble: '\n  const { statusLine } = site;\n',
  },
  {
    file: 'EnquiryForm', out: 'components/EnquiryForm.tsx', client: true,
    dropAttrs: ['data-endpoint', 'action', 'method'],
    imports: 'import { useState, type FormEvent } from "react";\nimport { submitEnquiry } from "@/lib/site";',
    signature: 'EnquiryForm({ endpoint = "/api/enquiry" }: { endpoint?: string })',
    preamble: `
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error" | "unconnected">("idle");
  const notices: Record<string, string> = {
    unconnected: "Enquiries are not yet delivered from this form. Please email info@furtadoproperty.com.au or call 0418 982 517 and we will be in touch within one business day.",
    sent: "Thank you — we will be in touch within one business day.",
    error: "Something went wrong sending your enquiry. Please email info@furtadoproperty.com.au or call 0418 982 517.",
  };
  const buttonLabel = status === "sending" ? "Sending…" : "Enquire now";
  const showNotice = !!notices[status];
  const notice = notices[status] || "";
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus("sending");
    const r = await submitEnquiry(form, endpoint);
    if (r.ok) form.reset();
    setStatus(r.ok ? "sent" : r.unconnected ? "unconnected" : "error");
  };
`,
  },
];

// ---------------------------------------------------------------------------------------------------------------

const VOID = new Set(['img', 'input', 'br', 'hr', 'meta', 'link', 'source', 'area', 'col', 'embed', 'track', 'wbr']);
const ATTR_MAP = { class: 'className', for: 'htmlFor', autocomplete: 'autoComplete', tabindex: 'tabIndex', srcset: 'srcSet', maxlength: 'maxLength', readonly: 'readOnly' };
const NUMERIC = new Set(['rows', 'cols', 'tabIndex', 'maxLength']);
const fx = new Map(); // class name → css text

const camel = (s) => s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
const cssKey = (prop) => {
  if (prop.startsWith('--')) return JSON.stringify(prop);
  if (prop.startsWith('-ms-')) return camel(prop.slice(1));
  if (prop.startsWith('-')) { const c = camel(prop.slice(1)); return c[0].toUpperCase() + c.slice(1); }
  return camel(prop);
};
// Fixed type sizes become tokens (app/globals.css) so phones can run body copy and labels a step larger than the
// desktop design without touching the export: .95rem → var(--fs-95).
const FS_TOKENS = new Set(['.66', '.7', '.72', '.78', '.8', '.84', '.86', '.88', '.9', '.92', '.95']);
const token = (p, v) => {
  const m = p === 'font-size' && v.match(/^(\.\d+)rem$/);
  return m && FS_TOKENS.has(m[1]) ? `var(--fs-${m[1].slice(1).padEnd(2, '0')})` : v;
};
const decls = (css) => css.split(';').map(d => d.trim()).filter(Boolean).map(d => { const i = d.indexOf(':'); const p = d.slice(0, i).trim(); return [p, token(p, d.slice(i + 1).trim().replace(/'Geist Mono'/g, 'var(--font-geist-mono)'))]; });

// "a {{ x }} b" → JS expression
const BIND = /\{\{\s*([^}]+?)\s*\}\}/g;
function expr(value) {
  const whole = value.match(/^\s*\{\{\s*([^}]+?)\s*\}\}\s*$/);
  if (whole) return whole[1];
  if (!BIND.test(value)) return JSON.stringify(value);
  BIND.lastIndex = 0;
  return '`' + value.replace(/[`\\]/g, '\\$&').replace(BIND, (_, e) => '${' + e + '}') + '`';
}

function styleObject(css) {
  // backdrop-filter is the most expensive thing on these pages. On the dark cards (6% white over flat green) it
  // changes nothing visible, so it goes; the caption pills over photographs keep a small blur on larger screens
  // through the .glass class (globals.css), which element() adds.
  css = css.replace(/(^|;)\s*(-webkit-)?backdrop-filter:[^;]*/g, '$1');
  // aspect-ratio + min-height transfers a minimum width through the ratio and overflows narrow screens; a definite
  // width keeps the box inside its column (the image inside is object-fit: cover).
  if (/aspect-ratio:/.test(css) && /min-height:/.test(css) && !/(^|;)s*width:/.test(css)) css += ';width:100%';
  const body = '{ ' + decls(css).map(([p, v]) => `${cssKey(p)}: ${expr(v)}`).join(', ') + ' }';
  return /(^|;)\s*--/.test(css) ? `{${body} as React.CSSProperties}` : `{${body}}`; // custom properties need the cast
}

function fxClass(states) {
  const body = Object.entries(states).map(([s, css]) => `${s}|${css}`).join('||');
  const name = 'fx-' + crypto.createHash('md5').update(body).digest('hex').slice(0, 7);
  if (!fx.has(name)) {
    const pseudo = { hover: ':hover', focus: ':focus', active: ':active' };
    fx.set(name, Object.entries(states).map(([s, css]) => {
      const rule = `.${name}${pseudo[s]}{${decls(css).map(([p, v]) => `${p}:${v} !important`).join(';')}}`;
      // Hover styles only where hovering exists, so taps on touch screens do not leave buttons stuck in the hover state.
      return s === 'hover' ? `@media (hover:hover){${rule}}` : rule;
    }).join('\n'));
  }
  return name;
}

function text(raw, ctx) {
  let t = raw.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, '\u00a0');
  if (!t.trim()) return /\n/.test(t) || !t ? '' : '{" "}';
  t = t.replace(/[ \t\r\n]+/g, ' ');
  // split on bindings
  const parts = [];
  let last = 0; BIND.lastIndex = 0; let m;
  while ((m = BIND.exec(t))) {
    if (m.index > last) parts.push(JSON.stringify(t.slice(last, m.index)));
    parts.push(m[1] === 'blob' ? '__BLOB__' : m[1]);
    last = m.index + m[0].length;
  }
  if (last < t.length) parts.push(JSON.stringify(t.slice(last)));
  return parts.map(p => {
    if (p === '__BLOB__') { ctx.uses.add('Blob'); return '<Blob />'; }
    if (p[0] === '"' && /^"[^{}<>&"'\\]*"$/.test(p) && p === JSON.stringify(p.slice(1, -1).trim())) return p.slice(1, -1);
    return `{${p}}`;
  }).join('');
}

function localSrc(src) { return src.startsWith(REMOTE) ? src.slice(REMOTE.length) : src; }

function element(node, ctx) {
  const tag = node.rawTagName;
  const attrs = { ...node.attributes };
  const kids = () => node.childNodes.map(c => render(c, ctx)).join('');

  if (tag === 'helmet') return '';
  if (tag === 'dc-import') {
    if (attrs.name === 'EnquiryForm') { ctx.uses.add('EnquiryForm'); return '<EnquiryForm />'; }
    return ''; // intro, header and footer live in the root layout
  }
  if (tag === 'sc-if') {
    const cond = expr(attrs.value);
    const cls = ctx.cfg.ifAsClass?.[cond];
    if (cls) return `<div className="${cls}">${kids()}</div>`;
    return `{${cond} && (<>${kids()}</>)}`;
  }
  if (tag === 'sc-for') {
    ctx.uses.add('Fragment');
    return `{${expr(attrs.list)}.map((${attrs.as}, i) => (<Fragment key={i}>${kids()}</Fragment>))}`;
  }

  const out = [];
  const states = {};
  const classes = [];
  let name = tag;
  if (/backdrop-filter:\s*blur/.test(attrs.style || '') && !/rgba\(250,247,240,\.06\)/.test(attrs.style) && !ctx.cfg.noGlass) classes.push('glass');
  if (attrs['data-sticky']) attrs.style = `${attrs.style || ''};--sticky-top:${attrs['data-sticky']}`;

  if (tag === 'img') {
    const src = localSrc(attrs.src);
    if (attrs.ref && ctx.cfg.logo) {
      ctx.uses.add('Logo');
      return `<Logo src="${src}" alt=${JSON.stringify(attrs.alt || '')} color="${ctx.cfg.logo.color}" height={${ctx.cfg.logo.height}} style=${styleObject(attrs.style || '')} />`;
    }
    ctx.uses.add('Image');
    name = 'Image';
    const dim = imageSize(fs.readFileSync(path.join(ROOT, 'public', src)));
    attrs.src = src;
    ctx.imgIndex = (ctx.imgIndex ?? -1) + 1;
    const sizes = IMAGE_SIZES[ctx.cfg.out]?.[ctx.imgIndex];
    out.push(`width={${dim.width}}`, `height={${dim.height}}`, `sizes="${sizes || '(min-width: 1024px) 50vw, 100vw'}"`);
    // Only the first image of a page is above the fold and gets fetched early; on Home that job belongs to the
    // hero poster. Everything else is lazy (next/image's default).
    if (!ctx.firstImage && !ctx.cfg.noPreload) out.push('preload');
    ctx.firstImage = true;
    // Placeholder: the photograph's own softened colour fills the reserved box until the pixels arrive.
    if (IMAGE_META[src]) attrs.style = `${attrs.style || ''};background-color:${IMAGE_META[src]}`;
  }

  if (tag === 'a' && ROUTES[attrs.href]) { name = 'Link'; ctx.uses.add('Link'); attrs.href = ROUTES[attrs.href]; }
  else if (tag === 'a' && /^s*{{/.test(attrs.href || '')) { name = 'Link'; ctx.uses.add('Link'); } // bound hrefs are internal routes

  for (let [k, v] of Object.entries(attrs)) {
    if (k.startsWith('hint-') || ctx.cfg.dropAttrs?.includes(k)) continue;
    if (k === 'style') { out.push(`style=${styleObject(v)}`); continue; }
    const st = k.match(/^style-(hover|focus|active)$/);
    if (st) { states[st[1]] = v; continue; }
    if (k === 'ref') {
      const r = expr(v);
      if (r === 'worldRef') out.push('data-world=""'); else out.push(`ref={${r}}`);
      continue;
    }
    if (!k.startsWith('data-') && !k.startsWith('aria-') && k.includes('-')) k = camel(k);
    k = ATTR_MAP[k] || k;
    if (v === '' && !k.startsWith('data-') && k !== 'alt' && k !== 'value') { out.push(k); continue; }
    const e = expr(v);
    if (NUMERIC.has(k) && /^"\d+"$/.test(e)) out.push(`${k}={${e.slice(1, -1)}}`);
    else out.push(e[0] === '"' ? `${k}=${e.includes('\\') ? `{${e}}` : e}` : `${k}={${e}}`);
  }
  if (Object.keys(states).length) classes.unshift(fxClass(states));
  if (classes.length) out.unshift(`className="${classes.join(' ')}"`);

  const open = `<${name}${out.length ? ' ' + out.join(' ') : ''}`;
  if (VOID.has(tag)) return `${open} />`;
  const inner = kids();
  return inner ? `${open}>${inner}</${name}>` : `${open} />`;
}

function render(node, ctx) {
  if (node.nodeType === 3) return text(node.rawText, ctx);
  if (node.nodeType === 8) return `{/* ${node.rawText.trim()} */}`;
  if (node.nodeType === 1) return element(node, ctx);
  return '';
}

// Page options that remove the section with the given data-screen-label and renumber the "NN / total" labels around it.
function dropSection(label, total) {
  const pad = (n) => String(n).padStart(2, '0');
  let dropped = total;
  return {
    patchDom: (root) => {
      const section = root.querySelector(`[data-screen-label="${label}"]`);
      if (!section) throw new Error(`dropSection: no "${label}" section`);
      const m = section.text.match(new RegExp(`(\\d\\d) \\/ ${pad(total)}`));
      if (m) dropped = Number(m[1]);
      section.remove();
    },
    patch: (jsx) => jsx.replace(new RegExp(`(\\d\\d) \\/ ${pad(total)}`, 'g'), (_, n) => `${pad(n > dropped ? n - 1 : Number(n))} / ${pad(total - 1)}`),
  };
}

function load(file) {
  const html = fs.readFileSync(path.join(SRC, `${file}.dc.html`), 'utf8');
  const body = html.match(/<x-dc>([\s\S]*?)<\/x-dc>/)[1];
  const title = (body.match(/<title>([^<]*)<\/title>/) || [])[1];
  const root = parse(body, { comment: true, lowerCaseTagName: false, voidTag: { tags: [...VOID] } });
  // Every control gets feedback from app/globals.css: pill buttons are tagged data-press (lift on hover unless the
  // export defines its own hover, press-in on click, 44px touch target), and links the export left without a hover
  // state are tagged data-link (underline on hover). Focus rings apply to all of them.
  for (const el of root.querySelectorAll('a, button')) {
    const pill = /border-radius:\s*999px/.test(el.getAttribute('style') || '');
    if (pill) el.setAttribute('data-press', el.getAttribute('style-hover') ? '' : 'lift');
    else if (!el.getAttribute('style-hover') && el.text.trim()) el.setAttribute('data-link', '');
  }
  return { root, title };
}

const IMPORTS = {
  Fragment: 'import { Fragment } from "react";',
  Link: 'import Link from "next/link";',
  Image: 'import Image from "next/image";',
  Blob: 'import Blob from "@/components/Blob";',
  Logo: 'import Logo from "@/components/Logo";',
  EnquiryForm: 'import EnquiryForm from "@/components/EnquiryForm";',
};
const HEADER = '// Generated by scripts/convert.mjs from the design export — edit the source or the script, then re-run.\n';

async function write(out, code) {
  const file = path.join(ROOT, out);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, await prettier.format(code, { parser: 'typescript', printWidth: 120 }));
  console.log('wrote', out);
}

for (const cfg of PAGES) {
  const { root, title } = load(cfg.file);
  const ctx = { cfg, uses: new Set() };
  if (cfg.patchDom) cfg.patchDom(root);
  const rendered = root.childNodes.map(n => render(n, ctx)).join('');
  const jsx = cfg.patch ? cfg.patch(rendered) : rendered;
  const vars = SITE_VARS.filter(v => new RegExp(`[{$]\\{?\\s*${v}\\b`).test(jsx));
  const imports = ['import type { Metadata } from "next";', ...[...ctx.uses].map(u => IMPORTS[u]), cfg.extraImport, vars.length && 'import { site } from "@/lib/site-config";'].filter(Boolean);
  await write(cfg.out, `${HEADER}${imports.join('\n')}

export const metadata: Metadata = {
  title: ${JSON.stringify(title)},
  description: ${JSON.stringify(DESCRIPTIONS[cfg.file])},
};

export default function Page() {
  ${vars.length ? `const { ${vars.join(', ')} } = site;` : ''}
  return (<>${jsx}${cfg.extra || ''}</>);
}
`);
}

for (const cfg of COMPONENTS) {
  const { root } = load(cfg.file);
  const ctx = { cfg, uses: new Set(), firstImage: true };
  const rendered = root.childNodes.map(n => render(n, ctx)).join('');
  const jsx = cfg.patch ? cfg.patch(rendered) : rendered;
  const imports = [cfg.imports, ...[...ctx.uses].map(u => IMPORTS[u])].filter(Boolean);
  await write(cfg.out, `${cfg.client ? '"use client";\n' : ''}${HEADER}${imports.join('\n')}

export default function ${cfg.signature} {${cfg.preamble}
  return (<>${jsx}</>);
}
`);
}

fs.writeFileSync(path.join(ROOT, 'app/interactions.css'), `/* Generated by scripts/convert.mjs — hover, focus and active states from the design export. */\n${[...fx.values()].join('\n')}\n`);
console.log('wrote app/interactions.css', fx.size, 'classes');
