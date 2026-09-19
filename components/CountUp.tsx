"use client";
import { useEffect } from "react";

// Counts every [data-count] figure up from zero the first time it scrolls into view ("20+" keeps its suffix).
// The server renders the final value, so nothing is lost without JavaScript or under prefers-reduced-motion.
export default function CountUp() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const els = [...document.querySelectorAll<HTMLElement>("[data-count]")];
    const frames = new Set<number>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          io.unobserve(e.target);
          const el = e.target as HTMLElement;
          const [, digits, suffix] = el.dataset.countTo!.match(/^(\d+)(.*)$/)!;
          const to = Number(digits);
          const dur = 1100 + Math.min(900, to * 30);
          const t0 = performance.now();
          const step = (now: number) => {
            const p = Math.min(1, (now - t0) / dur);
            el.textContent = Math.round(to * (1 - Math.pow(1 - p, 4))) + suffix;
            if (p < 1) frames.add(requestAnimationFrame(step));
          };
          frames.add(requestAnimationFrame(step));
        }
      },
      { threshold: 0.6 },
    );
    for (const el of els) {
      el.dataset.countTo = el.textContent ?? "";
      el.textContent = "0" + el.dataset.countTo.replace(/^\d+/, "");
      // Hold the final width so the card does not reflow while the digits change.
      el.style.fontVariantNumeric = "tabular-nums";
      io.observe(el);
    }
    return () => {
      io.disconnect();
      frames.forEach(cancelAnimationFrame);
      for (const el of els) if (el.dataset.countTo) el.textContent = el.dataset.countTo;
    };
  }, []);
  return null;
}
