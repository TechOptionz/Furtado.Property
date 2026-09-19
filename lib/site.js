// Shared behaviour for the Furtado Property pages.
// Entrance motion (animates once, honours prefers-reduced-motion):
//   data-reveal="text"    fade + rise 28px
//   data-reveal="heading" masked rise: clip opens upward while the heading moves into place
//   data-reveal="image"   fade + scale 1.04 → 1
//   data-reveal="mask"    image mask opens vertically (clip-path), with a slow settle from scale 1.06
//   data-reveal="rule"    hairline grows from the left (scaleX)
//   data-delay="ms"       optional stagger
const EASE = 'cubic-bezier(.16,1,.3,1)';
let started = false;
const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

const HIDDEN = {
  text: { opacity: '0', transform: 'translateY(28px)' },
  heading: { opacity: '0', transform: 'translateY(36px)', clipPath: 'inset(0 0 100% 0)' },
  image: { opacity: '0', transform: 'scale(1.04)' },
  mask: { clipPath: 'inset(100% 0 0 0)', transform: 'scale(1.06)' },
  rule: { transform: 'scaleX(0)' },
};
const SHOWN = {
  text: { opacity: '1', transform: 'translateY(0)' },
  heading: { opacity: '1', transform: 'translateY(0)', clipPath: 'inset(-12% 0 -12% 0)' },
  image: { opacity: '1', transform: 'scale(1)' },
  mask: { clipPath: 'inset(0 0 0 0)', transform: 'scale(1)' },
  rule: { transform: 'scaleX(1)' },
};
const DUR = { text: 800, heading: 1000, image: 1100, mask: 1200, rule: 900 };

export function initReveal() {
  if (started) return;
  started = true;
  if (reduce()) return;
  const pending = new Set();
  const show = (el) => { Object.assign(el.style, SHOWN[el.dataset.reveal] || SHOWN.text); pending.delete(el); io.unobserve(el); };
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) show(e.target);
  }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
  // Fallback sweep on scroll/resize: IntersectionObserver is throttled in hidden or background frames.
  let raf = 0;
  const sweep = () => {
    raf = 0;
    for (const el of pending) {
      if (!el.isConnected) { pending.delete(el); continue; } // left behind by a client-side navigation
      const r = el.getBoundingClientRect();
      if (r.top < innerHeight * 0.94 && r.width) show(el); // in view, or already scrolled past
    }
  };
  const queue = () => { if (!raf) raf = document.visibilityState === 'visible' ? requestAnimationFrame(sweep) : setTimeout(sweep, 60); };
  addEventListener('scroll', queue, { passive: true });
  addEventListener('resize', queue);
  // Low-cost safety net: while anything is still pending, re-check twice a second (covers layout shifts and
  // sticky columns whose geometry changes after the observer's first pass).
  const tick = setInterval(() => { if (pending.size) sweep(); }, 500);

  const prep = (el) => {
    if (el.dataset.revealReady) return;
    el.dataset.revealReady = '1';
    const kind = HIDDEN[el.dataset.reveal] ? el.dataset.reveal : 'text';
    const dur = DUR[kind], delay = el.dataset.delay || 0;
    if (kind === 'rule') el.style.transformOrigin = 'left';
    if ((kind === 'mask' || kind === 'image') && el.parentElement) el.parentElement.style.overflow = 'hidden';
    Object.assign(el.style, HIDDEN[kind]);
    el.style.willChange = 'opacity, transform';
    el.style.transition = ['opacity', 'transform', 'clip-path'].map(p => `${p} ${dur}ms ${EASE} ${delay}ms`).join(', ');
    pending.add(el);
    io.observe(el);
    queue();
  };

  document.querySelectorAll('[data-reveal]').forEach(prep);
  const mo = new MutationObserver((muts) => {
    for (const m of muts) for (const n of m.addedNodes) {
      if (n.nodeType !== 1) continue;
      if (n.dataset && n.dataset.reveal) prep(n);
      n.querySelectorAll && n.querySelectorAll('[data-reveal]').forEach(prep);
    }
  });
  mo.observe(document.body, { childList: true, subtree: true });
}

// Scroll-driven scenes. A [data-scene] holds [data-scene-item] blocks that scroll normally; the item nearest the
// viewport's focal line becomes active. The scene may also hold:
//   [data-scene-img="i"]   stacked images that crossfade with the active item
//   [data-scene-index]     text → "01", [data-scene-count] → "04", [data-scene-label] → item's data-label
//   [data-scene-bar]       vertical progress (scaleY), [data-scene-dot="i"] step dots
//   [data-sticky]          sticky only from 1024px up (static below, so mobile stacks naturally)
//   [data-show="wide|narrow"] shown only on that side of 1024px (data-display sets the display value when shown)
// Inactive items are dimmed via data-dim="0.3" on the scene (opacity), active ones return to 1.
let scenesStarted = false;
export function initScenes() {
  if (scenesStarted) return;
  scenesStarted = true;
  const wide = matchMedia('(min-width: 1024px)');
  const applySticky = () => {
    document.querySelectorAll('[data-sticky]').forEach(el => {
      // Sticky whenever the column actually sits beside a sibling (not stacked above it). Compare the sibling's top
      // with the parent's top so the element's own sticky offset never skews the measurement.
      const sib = el.nextElementSibling, parent = el.parentElement;
      const beside = sib && parent && Math.abs(sib.offsetTop - parent.offsetTop) < 64 && innerWidth >= 768;
      const next = beside ? 'sticky' : 'relative';
      if (el.style.position !== next) { el.style.position = next; el.style.top = beside ? (el.dataset.sticky || '96px') : ''; }
    });
    document.querySelectorAll('[data-show]').forEach(el => {
      const want = el.dataset.show === 'wide' ? wide.matches : !wide.matches;
      el.style.display = want ? (el.dataset.display || '') : 'none';
    });
    // Editorial galleries: 6-column spans on desktop, 2 columns on tablet, single column on phones.
    document.querySelectorAll('[data-gallery]').forEach(g => {
      const two = innerWidth < 1024, one = innerWidth < 640;
      g.style.gridTemplateColumns = one ? '1fr' : two ? 'repeat(2,minmax(0,1fr))' : 'repeat(6,minmax(0,1fr))';
      [...g.children].forEach(c => {
        if (c.dataset.span === undefined) { c.dataset.span = c.style.gridColumn || ''; c.dataset.ratio = c.style.aspectRatio || '4/3'; }
        c.style.gridColumn = one || two ? 'auto' : c.dataset.span;
        c.style.aspectRatio = one || two ? '4/3' : c.dataset.ratio;
      });
    });
    // Items paired with a sticky image are one viewport tall on desktop; natural height when stacked.
    document.querySelectorAll('[data-vh]').forEach(el => {
      if (!el.dataset.vhValue) el.dataset.vhValue = el.style.minHeight || '92vh';
      el.style.minHeight = wide.matches ? el.dataset.vhValue : '0px';
    });
  };
  applySticky();
  wide.addEventListener('change', applySticky);

  const scenes = () => [...document.querySelectorAll('[data-scene]')];
  const update = () => {
    const focal = innerHeight * 0.5;
    for (const sc of scenes()) {
      const items = [...sc.querySelectorAll('[data-scene-item]')];
      if (!items.length) continue;
      let best = 0, bestD = Infinity;
      items.forEach((it, i) => {
        const r = it.getBoundingClientRect();
        const d = Math.abs(r.top + Math.min(r.height, innerHeight * 0.6) / 2 - focal);
        if (d < bestD) { bestD = d; best = i; }
      });
      const first = items[0].getBoundingClientRect(), last = items[items.length - 1].getBoundingClientRect();
      if (first.top > focal) best = 0;
      if (last.bottom < focal) best = items.length - 1;
      if (sc._active === best) continue;
      sc._active = best;
      const dim = sc.dataset.dim;
      items.forEach((it, i) => {
        if (dim) { it.style.transition = `opacity .6s ${EASE}`; it.style.opacity = i === best ? '1' : dim; }
        it.dataset.active = i === best ? '1' : '';
      });
      sc.querySelectorAll('[data-scene-img]').forEach(im => {
        const on = +im.dataset.sceneImg === best;
        im.style.opacity = on ? '1' : '0';
        im.style.transform = on ? 'scale(1)' : 'scale(1.04)';
      });
      const idx = sc.querySelector('[data-scene-index]'); if (idx) idx.textContent = String(best + 1).padStart(2, '0');
      const cnt = sc.querySelector('[data-scene-count]'); if (cnt) cnt.textContent = String(items.length).padStart(2, '0');
      const lab = sc.querySelector('[data-scene-label]'); if (lab) lab.textContent = items[best].dataset.label || '';
      const bar = sc.querySelector('[data-scene-bar]'); if (bar) bar.style.transform = `${bar.dataset.axis === 'y' ? 'scaleY' : 'scaleX'}(${(best + 1) / items.length})`;
      sc.querySelectorAll('[data-scene-dot]').forEach(d => {
        const on = +d.dataset.sceneDot <= best;
        d.style.background = on ? (d.dataset.on || '#B59168') : (d.dataset.off || 'rgba(32,35,31,.15)');
      });
    }
  };
  let raf = 0;
  const onScroll = () => { if (!raf) raf = document.visibilityState === 'visible' ? requestAnimationFrame(() => { raf = 0; applySticky(); update(); }) : setTimeout(() => { raf = 0; applySticky(); update(); }, 60); };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', () => { applySticky(); onScroll(); });
  const mo = new MutationObserver(() => { applySticky(); onScroll(); });
  mo.observe(document.body, { childList: true, subtree: true });
  update();
}

// The supplied logo PNGs draw the "F" mark with 4px strokes on a 363px-tall canvas, which vanishes when scaled to
// header size. Rebuild the logo at display resolution: thicken the strokes evenly, recolour to a solid ink, and hand
// the result back to the <img>.
const logoCache = new Map();
export async function sharpenLogo(img, color, displayHeight) {
  if (!img) return;
  const key = img.src + '|' + color + '|' + displayHeight;
  if (logoCache.has(key)) { img.src = logoCache.get(key); return; }
  try {
    const blob = await fetch(img.src).then(r => r.blob());
    const bmp = await createImageBitmap(blob);
    const W = bmp.width, H = bmp.height;
    const src = document.createElement('canvas'); src.width = W; src.height = H;
    const sx = src.getContext('2d'); sx.drawImage(bmp, 0, 0);
    const data = sx.getImageData(0, 0, W, H).data;
    const a = new Uint8ClampedArray(W * H);
    for (let i = 0; i < W * H; i++) a[i] = data[i * 4 + 3];
    let started = false, split = Math.round(W * 0.13);
    for (let x = 0; x < W; x++) {
      let ink = 0; for (let y = 0; y < H; y++) if (a[y * W + x] > 40) { ink = 1; break; }
      if (ink) started = true; else if (started) { split = x; break; }
    }
    const dilate = (r) => {
      const tmp = new Uint8ClampedArray(W * H), out = new Uint8ClampedArray(W * H);
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const rr = x < split ? r.mark : r.text; let m = 0;
        for (let k = -rr; k <= rr; k++) { const xx = x + k; if (xx >= 0 && xx < W) { const v = a[y * W + xx]; if (v > m) m = v; } }
        tmp[y * W + x] = m;
      }
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const rr = x < split ? r.mark : r.text; let m = 0;
        for (let k = -rr; k <= rr; k++) { const yy = y + k; if (yy >= 0 && yy < H) { const v = tmp[yy * W + x]; if (v > m) m = v; } }
        out[y * W + x] = m;
      }
      return out;
    };
    const scale = H / displayHeight;
    const thick = dilate({ mark: Math.round(scale * 0.55), text: Math.round(scale * 0.35) });
    const rgb = color.match(/\w\w/g).map(h => parseInt(h, 16));
    const px = sx.createImageData(W, H);
    for (let i = 0; i < W * H; i++) { px.data[i * 4] = rgb[0]; px.data[i * 4 + 1] = rgb[1]; px.data[i * 4 + 2] = rgb[2]; px.data[i * 4 + 3] = thick[i]; }
    sx.putImageData(px, 0, 0);
    const dpr = Math.min(3, (window.devicePixelRatio || 1) * 1.5);
    const out = document.createElement('canvas');
    out.height = Math.round(displayHeight * dpr); out.width = Math.round(W / H * out.height);
    const ox = out.getContext('2d'); ox.imageSmoothingQuality = 'high';
    ox.drawImage(src, 0, 0, out.width, out.height);
    const url = out.toDataURL('image/png');
    logoCache.set(key, url);
    img.src = url;
  } catch (e) { /* keep the original image */ }
}

// Enquiry form delivery. Pass an endpoint (Formspree, Netlify, a custom API) to POST JSON; with no endpoint the form
// reports that it is not connected.
export async function submitEnquiry(form, endpoint) {
  const data = Object.fromEntries(new FormData(form).entries());
  if (!endpoint) return { ok: false, unconnected: true, data };
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(data),
    });
    // The API answers 503 while no mail provider is configured.
    return { ok: res.ok, unconnected: res.status === 503, data };
  } catch (err) {
    return { ok: false, error: String(err), data };
  }
}
