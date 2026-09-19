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

const SITE_VARS = ['salesStatus', 'completion', 'constructionStatus', 'structureStatus', 'availability', 'statusLine'];

const PAGES = [
  {
    file: 'Home', out: 'app/page.tsx', extra: '<HomeStory /><CountUp />',
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
        const m = s.text.match(/^(\d\d) \/ 12$/);
        if (m) s.set_content(`${String(m[1] - 1).padStart(2, '0')} / 11`);
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
      .replace('data-world=""', 'data-world="" id="story"'),
  },
  { file: 'About', out: 'app/about/page.tsx' },
  { file: 'Projects', out: 'app/projects/page.tsx' },
  { file: 'Mira-Living', out: 'app/projects/mira-living/page.tsx' },
  { file: 'Contact', out: 'app/contact/page.tsx' },
];

const COMPONENTS = [
  {
    file: 'SiteHeader', out: 'components/SiteHeader.tsx', client: true,
    logo: { color: '#20231F', height: 40 },
    ifAsClass: { wide: 'only-wide', narrow: 'only-narrow' },
    imports: 'import { useEffect, useRef, useState } from "react";\nimport { usePathname } from "next/navigation";',
    signature: 'SiteHeader()',
    preamble: `
  const pathname = usePathname();
  // The drawer is open only for the route it was opened on, so navigating closes it.
  const [openAt, setOpenAt] = useState<string | null>(null);
  const menuOpen = openAt === pathname;
  const barRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let scrolled: boolean | null = null;
    const onScroll = () => {
      // Over the home hero film the bar stays clear until the hero has scrolled out from under it; elsewhere it
      // turns solid as soon as the page moves. globals.css styles the clear state off html[data-over-hero].
      const hero = document.querySelector("[data-video-hero]");
      const s = hero ? hero.getBoundingClientRect().bottom <= 64 : window.scrollY > 8;
      if (s === scrolled) return;
      scrolled = s;
      document.documentElement.toggleAttribute("data-over-hero", !!hero && !s);
      const b = barRef.current, i = innerRef.current;
      if (!b) return;
      b.toggleAttribute("data-scrolled", s);
      b.style.background = s ? "rgba(247,244,237,.95)" : "rgba(247,244,237,.85)";
      b.style.borderBottomColor = s ? "rgba(32,35,31,.15)" : "rgba(32,35,31,.08)";
      b.style.boxShadow = s ? "0 8px 28px -12px rgba(60,40,15,.18)" : "none";
      if (i) i.style.height = s ? "64px" : "92px";
    };
    const mq = matchMedia("(min-width: 1024px)");
    const onMq = () => { if (mq.matches) setOpenAt(null); };
    addEventListener("scroll", onScroll, { passive: true });
    mq.addEventListener("change", onMq);
    onScroll();
    return () => { removeEventListener("scroll", onScroll); mq.removeEventListener("change", onMq); };
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpenAt(null); };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
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
const decls = (css) => css.split(';').map(d => d.trim()).filter(Boolean).map(d => { const i = d.indexOf(':'); return [d.slice(0, i).trim(), d.slice(i + 1).trim().replace(/'Geist Mono'/g, 'var(--font-geist-mono)')]; });

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
  // aspect-ratio + min-height transfers a minimum width through the ratio and overflows narrow screens; a definite
  // width keeps the box inside its column (the image inside is object-fit: cover).
  if (/aspect-ratio:/.test(css) && /min-height:/.test(css) && !/(^|;)s*width:/.test(css)) css += ';width:100%';
  return '{{ ' + decls(css).map(([p, v]) => `${cssKey(p)}: ${expr(v)}`).join(', ') + ' }}';
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
  let name = tag;

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
    out.push(`width={${dim.width}}`, `height={${dim.height}}`, `sizes="${ctx.imgSizes || '(min-width: 1024px) 50vw, 100vw'}"`);
    if (!ctx.firstImage) { ctx.firstImage = true; out.push('preload'); }
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
  if (Object.keys(states).length) out.unshift(`className="${fxClass(states)}"`);

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
  const jsx = root.childNodes.map(n => render(n, ctx)).join('');
  const imports = [cfg.imports, ...[...ctx.uses].map(u => IMPORTS[u])].filter(Boolean);
  await write(cfg.out, `${cfg.client ? '"use client";\n' : ''}${HEADER}${imports.join('\n')}

export default function ${cfg.signature} {${cfg.preamble}
  return (<>${jsx}</>);
}
`);
}

fs.writeFileSync(path.join(ROOT, 'app/interactions.css'), `/* Generated by scripts/convert.mjs — hover, focus and active states from the design export. */\n${[...fx.values()].join('\n')}\n`);
console.log('wrote app/interactions.css', fx.size, 'classes');
