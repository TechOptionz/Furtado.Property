"use client";
import { useEffect } from "react";

const CAPTIONS = [
  "Bargara Golf Club to the coast",
  "Mira Living · Living room and balcony",
  "Mira Living · Kitchen and living",
  "Bargara beach at sunset",
  "Mira Living · Bargara QLD",
];

// Drives the pinned five-chapter story on the home page: scroll progress through [data-world] picks the chapter,
// then text, image, caption and progress bar follow. Progress has to be continuous, so this is the one place that
// reads scroll position — but only while the story is on screen, once per frame, from cached measurements and
// cached elements. Only the active image and its neighbours are kept ready; the rest are not painted at all.
export default function HomeStory() {
  useEffect(() => {
    const el = document.querySelector<HTMLElement>("[data-world]");
    if (!el) return;
    const N = CAPTIONS.length;
    const bar = el.querySelector<HTMLElement>("[data-world-bar]");
    const cap = el.querySelector("[data-world-caption]");
    const texts = [...el.querySelectorAll<HTMLElement>("[data-chapter-text]")];
    const imgs = [...el.querySelectorAll<HTMLElement>("[data-chapter-img]")];
    let top = 0;
    let total = 1;
    let chapter = -1;
    let raf = 0;
    const measure = () => {
      top = el.getBoundingClientRect().top + scrollY;
      total = Math.max(1, el.offsetHeight - innerHeight);
    };
    const update = () => {
      raf = 0;
      const p = Math.min(1, Math.max(0, (scrollY - top) / total));
      if (bar) bar.style.transform = `scaleX(${p})`;
      const idx = Math.min(N - 1, Math.floor(p * N));
      if (idx === chapter) return;
      chapter = idx;
      for (const t of texts) {
        const on = Number(t.dataset.chapterText) === idx;
        t.style.opacity = on ? "1" : "0";
        t.style.transform = on ? "translateY(0)" : "translateY(28px)";
        t.style.pointerEvents = on ? "auto" : "none";
        t.style.visibility = on ? "visible" : "hidden";
        // Hidden chapters leave the accessibility tree and tab order; the delay lets the fade finish first.
        t.style.transitionProperty = "opacity, transform, visibility";
        t.style.transitionDelay = on ? "0s" : "0s, 0s, .7s";
      }
      for (const im of imgs) {
        const i = Number(im.dataset.chapterImg);
        const on = i === idx;
        im.style.opacity = on ? "1" : "0";
        im.style.transform = on ? "scale(1)" : "scale(1.04)";
        im.style.visibility = Math.abs(i - idx) <= 1 ? "visible" : "hidden";
      }
      if (cap) cap.textContent = CAPTIONS[idx];
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const onResize = () => {
      measure();
      onScroll();
    };
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        measure();
        addEventListener("scroll", onScroll, { passive: true });
        onScroll();
      } else removeEventListener("scroll", onScroll);
    });
    io.observe(el);
    addEventListener("resize", onResize);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onResize);
    };
  }, []);
  return null;
}
