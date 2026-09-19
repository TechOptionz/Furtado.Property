"use client";
import { useEffect, useRef, type CSSProperties } from "react";
import Link from "next/link";

// Full-screen video hero that opens the home page, above the pinned five-chapter story. The poster is what paints
// first (preloaded below, portrait crop on phones); the film itself is a muted loop (coast, home,
// interiors, waterfront) that is only fetched once the page has finished loading, fades in when it can play, and
// pauses whenever the hero is off screen. It is skipped under prefers-reduced-motion and for data-saving visitors.
export default function HomeHero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || conn?.saveData || /2g/.test(conn?.effectiveType || ""))
      return;
    const section = v.closest("section")!;
    const wrap = v.parentElement!;
    const content = contentRef.current;
    let visible = true;
    let loaded = false;
    const load = () => {
      if (loaded) return;
      loaded = true;
      v.src = matchMedia("(max-width: 900px)").matches ? "/video/hero-720.mp4" : "/video/hero-1080.mp4";
      v.addEventListener("playing", () => (v.style.opacity = "1"), { once: true });
      if (visible) v.play().catch(() => {});
    };
    // The film must not compete with the page's own resources, so it waits for the load event.
    let idle = 0;
    const onLoad = () => (idle = window.setTimeout(load, 200));
    if (document.readyState === "complete") onLoad();
    else addEventListener("load", onLoad, { once: true });

    // Scroll-off (larger screens): the film drifts down at a slower rate while the copy lifts and fades, so the hero
    // recedes under the story instead of just sliding away. The listener only exists while the hero is on screen.
    const parallax = matchMedia("(min-width: 768px) and (pointer: fine)").matches;
    let raf = 0;
    let height = innerHeight;
    const update = () => {
      raf = 0;
      const p = Math.min(1, Math.max(0, scrollY / height));
      wrap.style.transform = `translate3d(0,${p * 12}%,0)`;
      if (content) {
        content.style.transform = `translate3d(0,${p * -60}px,0)`;
        content.style.opacity = String(1 - p * 1.4);
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const onResize = () => (height = innerHeight);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) {
        if (loaded) v.play().catch(() => {});
        if (parallax) {
          wrap.style.willChange = "transform";
          addEventListener("scroll", onScroll, { passive: true });
          onScroll();
        }
      } else {
        v.pause();
        wrap.style.willChange = "";
        removeEventListener("scroll", onScroll);
      }
    });
    io.observe(section);
    addEventListener("resize", onResize);
    return () => {
      io.disconnect();
      clearTimeout(idle);
      removeEventListener("load", onLoad);
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <section
      data-screen-label="Hero"
      data-video-hero
      style={{
        position: "relative",
        height: "100svh",
        minHeight: "560px",
        overflow: "hidden",
        background: "#19332F",
        color: "#FCFAF6",
      }}
    >
      {/* React hoists these into <head>, so the poster starts downloading before the body is parsed. */}
      <link
        rel="preload"
        as="image"
        href="/video/hero-poster-portrait.webp"
        media="(max-width: 900px) and (orientation: portrait)"
        fetchPriority="high"
      />
      <link
        rel="preload"
        as="image"
        type="image/webp"
        href="/video/hero-poster.webp"
        media="not ((max-width: 900px) and (orientation: portrait))"
        fetchPriority="high"
      />
      <div style={{ position: "absolute", inset: 0 }}>
        <picture>
          <source media="(max-width: 900px) and (orientation: portrait)" srcSet="/video/hero-poster-portrait.webp" />
          <source type="image/webp" srcSet="/video/hero-poster.webp" />
          <img
            src="/video/hero-poster.jpg"
            alt=""
            width={1920}
            height={1080}
            fetchPriority="high"
            decoding="async"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
        </picture>
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          preload="none"
          aria-hidden
          tabIndex={-1}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: 0,
            transition: "opacity 1.2s ease-out",
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg,rgba(15,28,26,.5) 0%,rgba(15,28,26,.08) 38%,rgba(15,28,26,.72) 100%),radial-gradient(at 0% 100%,rgba(15,28,26,.55),transparent 60%)",
          pointerEvents: "none",
        }}
      />
      <div
        ref={contentRef}
        className="hero-content"
        style={{
          position: "relative",
          height: "100%",
          maxWidth: "1600px",
          margin: "0 auto",
          padding: "120px clamp(20px,5vw,80px) clamp(40px,6vw,72px)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          gap: "22px",
        }}
      >
        <div
          className="hero-in"
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: "8px 12px",
            fontSize: ".7rem",
            fontWeight: 600,
            letterSpacing: ".22em",
            textTransform: "uppercase",
            color: "#D3B995",
          }}
        >
          <span
            className="hero-rule"
            style={{
              display: "block",
              width: "40px",
              height: "1px",
              background: "#D3B995",
            }}
          />
          Furtado Property · South East Queensland
        </div>
        <h1
          className="hero-h1"
          style={{
            margin: 0,
            fontSize: "clamp(2.6rem,7vw,6.4rem)",
            fontWeight: 600,
            letterSpacing: "-.032em",
            lineHeight: ".98",
            maxWidth: "14ch",
            textWrap: "balance",
            textShadow: "0 2px 40px rgba(0,0,0,.35)",
          }}
        >
          <span className="hero-line">
            <span>Building Dreams, </span>
          </span>
          <span className="hero-line" style={{ "--d": ".12s" } as CSSProperties}>
            <span style={{ color: "#D3B995" }}>Creating Homes.</span>
          </span>
        </h1>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: "24px",
          }}
        >
          <p
            className="hero-in"
            style={
              {
                "--d": ".45s",
                margin: 0,
                fontSize: "clamp(1rem,1.25vw,1.2rem)",
                lineHeight: 1.6,
                color: "rgba(252,250,246,.85)",
                maxWidth: "46ch",
              } as CSSProperties
            }
          >
            Residential developments in South East Queensland, built on over 20 years of property experience.
          </p>
          <div
            className="hero-in"
            style={
              {
                "--d": ".6s",
                display: "flex",
                flexWrap: "wrap",
                gap: "12px",
              } as CSSProperties
            }
          >
            <Link
              data-press="lift"
              href="/projects/mira-living"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px 12px 12px 28px",
                borderRadius: "999px",
                background: "#FCFAF6",
                color: "#19332F",
                fontSize: ".95rem",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Discover Mira Living
              <span
                style={{
                  display: "inline-grid",
                  placeItems: "center",
                  width: "36px",
                  height: "36px",
                  borderRadius: "999px",
                  background: "rgba(25,51,47,.1)",
                }}
              >
                →
              </span>
            </Link>
            <a
              data-press="lift"
              href="#story"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                padding: "12px 24px",
                borderRadius: "999px",
                border: "1px solid rgba(252,250,246,.45)",
                background: "rgba(15,28,26,.32)",
                color: "#FCFAF6",
                fontSize: ".95rem",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Scroll the story <span className="hero-cue">↓</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
