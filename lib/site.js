// Shared behaviour for the Furtado Property pages.
// Entrance motion (animates once, honours prefers-reduced-motion):
//   data-reveal="text"    fade + rise
//   data-reveal="heading" masked rise: clip opens upward while the heading moves into place
//   data-reveal="image"   fade + scale 1.04 → 1
//   data-reveal="mask"    image mask opens vertically (clip-path), with a slow settle from scale 1.06
//   data-reveal="rule"    hairline grows from the left (scaleX)
//   data-delay="ms"       optional stagger
// Only opacity, transform and clip-path are animated, and everything is driven by IntersectionObserver: nothing here
// listens to scroll. Phones get the same vocabulary with shorter travel and no image scaling, which keeps large
// photographs off the compositor's slow path.
const EASE = 'cubic-bezier(.16,1,.3,1)';
const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const lite = () => matchMedia('(max-width: 767px), (pointer: coarse)').matches;

const HIDDEN = {
  text: { opacity: '0', transform: 'translateY(28px)' },
  heading: { opacity: '0', transform: 'translateY(36px)', clipPath: 'inset(0 0 100% 0)' },
  image: { opacity: '0', transform: 'scale(1.04)' },
  mask: { clipPath: 'inset(100% 0 0 0)', transform: 'scale(1.06)' },
  rule: { transform: 'scaleX(0)' },
};
const HIDDEN_LITE = {
  text: { opacity: '0', transform: 'translateY(18px)' },
  heading: { opacity: '0', transform: 'translateY(22px)' },
  image: { opacity: '0', transform: 'translateY(14px)' },
  mask: { clipPath: 'inset(100% 0 0 0)' },
  rule: { transform: 'scaleX(0)' },
};
const SHOWN = {
  text: { opacity: '1', transform: 'none' },
  heading: { opacity: '1', transform: 'none', clipPath: 'inset(-12% 0 -12% 0)' },
  image: { opacity: '1', transform: 'none' },
  mask: { clipPath: 'inset(0 0 0 0)', transform: 'none' },
  rule: { transform: 'scaleX(1)' },
};
const DUR = { text: 800, heading: 1000, image: 1100, mask: 1200, rule: 900 };

let revealIO = null;
// A clip-path that hides an element entirely also hides it from IntersectionObserver, so clipped kinds are watched
// through their parent (the image frame, or the heading's text column): proxy → elements waiting on it.
const waiting = new Map();
function show(el) {
  const kind = SHOWN[el.dataset.reveal] ? el.dataset.reveal : 'text';
  // Promoted to its own layer only for the length of the animation: a page full of permanent layers is what makes
  // scrolling stutter on phones.
  el.style.willChange = 'opacity, transform';
  for (const p of Object.keys(el._hidden || {})) el.style[p] = SHOWN[kind][p];
  const done = (e) => {
    if (e && e.target !== el) return;
    el.removeEventListener('transitionend', done);
    clearTimeout(timer);
    el.style.willChange = '';
    el.style.transition = el._transition || ''; // hand back the element's own hover transition
    if (kind !== 'rule') { el.style.transform = ''; el.style.clipPath = ''; }
  };
  const timer = setTimeout(done, DUR[kind] + (el._delay || 0) + 200);
  el.addEventListener('transitionend', done);
}

// Prepares every [data-reveal] not yet handled. Called on start and again after each client-side navigation.
export function initReveal() {
  if (reduce()) return;
  if (!revealIO) {
    revealIO = new IntersectionObserver((entries) => {
      // Anything in view, or already scrolled past, is shown; elements further down wait their turn.
      for (const e of entries) {
        // Shown once 8% (or, for tall blocks, 80px) is in view — or if it has already been scrolled past.
        const inView = e.isIntersecting && (e.intersectionRatio >= 0.08 || e.intersectionRect.height >= 80);
        if (!inView && e.boundingClientRect.top >= 0) continue;
        revealIO.unobserve(e.target);
        for (const el of waiting.get(e.target) || []) show(el);
        waiting.delete(e.target);
      }
    }, { threshold: [0, 0.08, 0.2, 0.4], rootMargin: '0px 0px -6% 0px' });
  }
  const hidden = lite() ? HIDDEN_LITE : HIDDEN;
  // Phones stagger less: several delayed transitions landing together is where frames get dropped.
  const delayScale = lite() ? 0.5 : 1;
  for (const el of document.querySelectorAll('[data-reveal]:not([data-reveal-ready])')) {
    el.dataset.revealReady = '1';
    const kind = hidden[el.dataset.reveal] ? el.dataset.reveal : 'text';
    const dur = DUR[kind], delay = Math.round((+el.dataset.delay || 0) * delayScale);
    if (kind === 'rule') el.style.transformOrigin = 'left';
    if ((kind === 'mask' || kind === 'image') && el.parentElement) el.parentElement.style.overflow = 'hidden';
    el._hidden = hidden[kind];
    el._delay = delay;
    el._transition = el.style.transition;
    Object.assign(el.style, hidden[kind]);
    el.style.transition = Object.keys(hidden[kind]).map((p) => `${p === 'clipPath' ? 'clip-path' : p} ${dur}ms ${EASE} ${delay}ms`).join(', ');
    const proxy = hidden[kind].clipPath && el.parentElement ? el.parentElement : el;
    if (!waiting.has(proxy)) waiting.set(proxy, []);
    waiting.get(proxy).push(el);
    revealIO.observe(proxy);
  }
}

// Scroll scenes. A [data-scene] holds [data-scene-item] blocks that scroll normally; the item crossing the middle of
// the viewport becomes active. The scene may also hold:
//   [data-scene-img="i"]   stacked images that crossfade with the active item
//   [data-scene-index]     text → "01", [data-scene-count] → "04", [data-scene-label] → item's data-label
//   [data-scene-bar]       progress (scaleX / scaleY), [data-scene-dot="i"] step dots
//   [data-sticky]          sticky while it sits beside its sibling column (see refreshSticky)
// Inactive items are dimmed via data-dim="0.3" on the scene, from 1024px up only: stacked on a phone, each step is
// simply read in turn. [data-show], [data-vh] and [data-gallery] are plain CSS (app/globals.css).
// The active item comes from an IntersectionObserver whose root is squeezed to a line across the middle of the
// viewport, so there is no scroll listener and no per-frame measuring.
let sceneIO = null;
const sceneOf = new WeakMap(); // item → { scene, items, index }
const wide = () => matchMedia('(min-width: 1024px)').matches;

function activate(sc, items, best) {
  if (sc._active === best) return;
  sc._active = best;
  const dim = wide() ? sc.dataset.dim : '';
  items.forEach((it, i) => {
    if (sc.dataset.dim) { it.style.transition = `opacity .6s ${EASE}`; it.style.opacity = !dim || i === best ? '1' : dim; }
    it.dataset.active = i === best ? '1' : '';
  });
  sc.querySelectorAll('[data-scene-img]').forEach((im) => {
    const on = +im.dataset.sceneImg === best;
    im.style.opacity = on ? '1' : '0';
    im.style.transform = on ? 'scale(1)' : 'scale(1.04)';
  });
  const idx = sc.querySelector('[data-scene-index]'); if (idx) idx.textContent = String(best + 1).padStart(2, '0');
  const cnt = sc.querySelector('[data-scene-count]'); if (cnt) cnt.textContent = String(items.length).padStart(2, '0');
  const lab = sc.querySelector('[data-scene-label]'); if (lab) lab.textContent = items[best].dataset.label || '';
  const bar = sc.querySelector('[data-scene-bar]'); if (bar) bar.style.transform = `${bar.dataset.axis === 'y' ? 'scaleY' : 'scaleX'}(${(best + 1) / items.length})`;
  sc.querySelectorAll('[data-scene-dot]').forEach((d) => {
    const on = +d.dataset.sceneDot <= best;
    d.style.background = on ? (d.dataset.on || '#B59168') : (d.dataset.off || 'rgba(32,35,31,.15)');
  });
}

// A column is sticky only while it actually sits beside its sibling; once the layout stacks it scrolls normally.
// Measured on start, on resize and after navigation — never while scrolling.
function refreshSticky() {
  for (const el of document.querySelectorAll('[data-sticky]')) {
    const sib = el.nextElementSibling || el.previousElementSibling, parent = el.parentElement;
    const beside = !!sib && !!parent && el.offsetParent !== null && sib.offsetParent !== null
      && Math.abs(sib.offsetTop - parent.offsetTop) < 64 && innerWidth >= 768;
    el.toggleAttribute('data-stuck', beside);
  }
}

let scenesBound = false;
export function initScenes() {
  if (!sceneIO) {
    sceneIO = new IntersectionObserver((entries) => {
      for (const e of entries) {
        const info = sceneOf.get(e.target);
        if (e.isIntersecting && info) activate(info.scene, info.items, info.index);
      }
    }, { rootMargin: '-50% 0px -50% 0px', threshold: 0 });
  }
  for (const sc of document.querySelectorAll('[data-scene]:not([data-scene-ready])')) {
    sc.dataset.sceneReady = '1';
    const items = [...sc.querySelectorAll('[data-scene-item]')];
    if (!items.length) continue;
    items.forEach((it, index) => { sceneOf.set(it, { scene: sc, items, index }); sceneIO.observe(it); });
    activate(sc, items, 0);
  }
  refreshSticky();
  if (scenesBound) return;
  scenesBound = true;
  let timer = 0;
  addEventListener('resize', () => { clearTimeout(timer); timer = setTimeout(refreshSticky, 150); });
  matchMedia('(min-width: 1024px)').addEventListener('change', () => {
    for (const sc of document.querySelectorAll('[data-scene]')) {
      const items = [...sc.querySelectorAll('[data-scene-item]')], active = sc._active || 0;
      sc._active = -1;
      if (items.length) activate(sc, items, active);
    }
  });
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
