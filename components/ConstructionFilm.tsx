"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";

const cover: CSSProperties = { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" };

const pill: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  borderRadius: "999px",
  border: "1px solid rgba(255,255,255,.2)",
  background: "rgba(32,35,31,.55)",
  color: "#FCFAF6",
};

// The site film behind Mira Living's "Construction progress" section (scripts/convert.mjs places it in the section's
// panel; .film-panel in globals.css draws the scrim over it). The poster is the film's first frame and is what shows
// until the panel is on screen; the film is then fetched, fades in once it plays, and pauses whenever the panel is
// off screen or the visitor pauses it. Like the hero film it is skipped under prefers-reduced-motion and for
// data-saving visitors, who keep the poster.
export default function ConstructionFilm() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const paused = useRef(false);
  const [shown, setShown] = useState(false);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || conn?.saveData || /2g/.test(conn?.effectiveType || ""))
      return;
    let loaded = false;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return v.pause();
        if (!loaded) {
          loaded = true;
          v.src = matchMedia("(max-width: 900px)").matches
            ? "/video/mira-construction-540.mp4"
            : "/video/mira-construction-900.mp4";
          v.addEventListener("playing", () => setShown(true), { once: true });
        }
        if (!paused.current) v.play().catch(() => {});
      },
      { threshold: 0.2 },
    );
    io.observe(v.parentElement!);
    return () => io.disconnect();
  }, []);
  const toggle = () => {
    const v = videoRef.current!;
    paused.current = !v.paused;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  };
  return (
    <>
      <div className="film-bg" style={{ position: "absolute", inset: 0 }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- a single pre-sized poster, like the hero's */}
        <img src="/video/mira-construction-poster.webp" alt="" width={1600} height={900} loading="lazy" decoding="async" style={cover} />
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          preload="none"
          aria-hidden
          tabIndex={-1}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          style={{ ...cover, opacity: shown ? 1 : 0, transition: "opacity 1.2s ease-out" }}
        />
      </div>
      <div className="film-controls">
        <span
          className="glass"
          style={{
            ...pill,
            padding: "8px 14px",
            fontSize: "var(--fs-72)",
            fontWeight: 600,
            letterSpacing: ".18em",
            textTransform: "uppercase",
          }}
        >
          <span className="live-dot" />
          On site, Bargara
        </span>
        <button
          type="button"
          className="glass"
          data-press=""
          onClick={toggle}
          aria-label={playing ? "Pause the construction film" : "Play the construction film"}
          style={{
            ...pill,
            justifyContent: "center",
            width: "44px",
            height: "44px",
            padding: 0,
            opacity: shown ? 1 : 0,
            visibility: shown ? "visible" : "hidden",
            transition: "opacity .6s ease-out",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden>
            {playing ? <path d="M3 2h3v10H3zM8 2h3v10H8z" /> : <path d="M4 2l8 5-8 5z" />}
          </svg>
        </button>
      </div>
    </>
  );
}
