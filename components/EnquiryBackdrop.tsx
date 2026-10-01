"use client";
import { useEffect, useRef, type CSSProperties } from "react";

const cover: CSSProperties = { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" };

// The film behind the home enquiry section (.enquiry-glass in globals.css draws the scrim over it). The poster is the
// film's first frame and is what shows until the section is close; the film is then fetched, fades in once it plays,
// and pauses whenever the section is off screen. Like the hero film it is skipped under prefers-reduced-motion and
// for data-saving visitors, who keep the poster.
export default function EnquiryBackdrop() {
  const videoRef = useRef<HTMLVideoElement>(null);
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
          v.src = matchMedia("(max-width: 900px)").matches ? "/video/enquiry-720.mp4" : "/video/enquiry-1080.mp4";
          v.addEventListener("playing", () => (v.style.opacity = "1"), { once: true });
        }
        v.play().catch(() => {});
      },
      { rootMargin: "50% 0px" },
    );
    io.observe(v.parentElement!);
    return () => io.disconnect();
  }, []);
  return (
    <div className="enquiry-bg" style={{ position: "absolute", inset: 0 }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- a single pre-sized poster, like the hero's */}
      <img src="/video/enquiry-poster.webp" alt="" width={1920} height={1080} loading="lazy" decoding="async" style={cover} />
      <video
        ref={videoRef}
        muted
        loop
        playsInline
        preload="none"
        aria-hidden
        tabIndex={-1}
        style={{ ...cover, opacity: 0, transition: "opacity 1.2s ease-out" }}
      />
    </div>
  );
}
