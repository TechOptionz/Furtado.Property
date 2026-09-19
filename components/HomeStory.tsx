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
// then text, image, caption and progress bar follow.
export default function HomeStory() {
  useEffect(() => {
    const N = CAPTIONS.length;
    let chapter = -1;
    const onScroll = () => {
      const el = document.querySelector<HTMLElement>("[data-world]");
      if (!el) return;
      const r = el.getBoundingClientRect();
      const total = el.offsetHeight - innerHeight;
      const p = Math.min(1, Math.max(0, -r.top / total));
      const idx = Math.min(N - 1, Math.floor(p * N));
      const bar = el.querySelector<HTMLElement>("[data-world-bar]");
      if (bar) bar.style.transform = `scaleX(${p})`;
      if (idx === chapter) return;
      chapter = idx;
      el.querySelectorAll<HTMLElement>("[data-chapter-text]").forEach((t) => {
        const on = Number(t.dataset.chapterText) === idx;
        t.style.opacity = on ? "1" : "0";
        t.style.transform = on ? "translateY(0)" : "translateY(28px)";
        t.style.pointerEvents = on ? "auto" : "none";
      });
      el.querySelectorAll<HTMLElement>("[data-chapter-img]").forEach((im) => {
        const on = Number(im.dataset.chapterImg) === idx;
        im.style.opacity = on ? "1" : "0";
        im.style.transform = on ? "scale(1)" : "scale(1.04)";
      });
      const cap = el.querySelector("[data-world-caption]");
      if (cap) cap.textContent = CAPTIONS[idx];
    };
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    onScroll();
    return () => {
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
    };
  }, []);
  return null;
}
