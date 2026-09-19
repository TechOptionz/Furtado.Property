"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";

const EASE = "cubic-bezier(.16,1,.3,1)";

// Full-screen video hero that opens the home page, above the pinned five-chapter story. The film is a muted loop
// (coast, home, interiors, waterfront); under prefers-reduced-motion it stays paused on the poster frame.
export default function HomeHero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      v.pause();
      return;
    }
    v.play().catch(() => {});
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
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster="/video/hero-poster.jpg"
        aria-hidden
        tabIndex={-1}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
      >
        <source src="/video/hero-720.mp4" type="video/mp4" media="(max-width: 900px)" />
        <source src="/video/hero-1080.mp4" type="video/mp4" />
      </video>
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
          animation: `introRise 1.1s ${EASE} .2s both`,
        }}
      >
        <div
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
          <span style={{ display: "block", width: "40px", height: "1px", background: "#D3B995" }} />
          Furtado Property · South East Queensland
        </div>
        <h1
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
          {"Building Dreams, "}
          <span style={{ color: "#D3B995" }}>Creating Homes.</span>
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
            style={{
              margin: 0,
              fontSize: "clamp(1rem,1.25vw,1.2rem)",
              lineHeight: 1.6,
              color: "rgba(252,250,246,.85)",
              maxWidth: "46ch",
            }}
          >
            Residential developments in South East Queensland, built on over 20 years of property experience.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
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
                background: "rgba(252,250,246,.08)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                color: "#FCFAF6",
                fontSize: ".95rem",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Scroll the story ↓
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
