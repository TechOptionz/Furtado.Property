"use client";
import { useEffect, useState } from "react";
import Logo from "@/components/Logo";

const EASE = "cubic-bezier(.16,1,.3,1)";

// Full-screen curtain shown on a full page load. It is server-rendered so it covers the very first paint; CSS hides
// it under prefers-reduced-motion, or when the inline script in the layout has marked the session as already seen.
export default function SiteIntro() {
  const [show, setShow] = useState(true);
  useEffect(() => {
    const el = document.querySelector("[data-intro]");
    if (!el || getComputedStyle(el).display === "none") return; // hidden by CSS: nothing to play
    try {
      sessionStorage.setItem("furtado-intro-seen", "1");
    } catch {}
    document.documentElement.style.overflow = "hidden";
    const timer = setTimeout(() => {
      document.documentElement.style.overflow = "";
      setShow(false);
    }, 3100);
    return () => {
      clearTimeout(timer);
      document.documentElement.style.overflow = "";
    };
  }, []);
  if (!show) return null;
  return (
    <div
      aria-hidden
      data-intro=""
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "#19332F",
        color: "#FCFAF6",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
        overflow: "hidden",
        animation: `introLift .9s ${EASE} 2.15s forwards`,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(at 100% 0%,rgba(211,185,149,.18),transparent 55%)",
          animation: "introGlow 1.2s ease-out both",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 1,
          background: "linear-gradient(90deg,transparent,rgba(211,185,149,.5) 50%,transparent)",
        }}
      />
      <Logo
        src="/assets/logo-white.png"
        alt="Furtado Property"
        color="#FCFAF6"
        height={64}
        style={{
          position: "relative",
          height: "clamp(40px,5vw,64px)",
          width: "auto",
          display: "block",
          animation: `introLogo 1s ${EASE} .15s both`,
        }}
      />
      <span
        style={{
          position: "relative",
          display: "block",
          width: "clamp(120px,14vw,200px)",
          height: 1,
          background: "#D3B995",
          transformOrigin: "left",
          animation: `introRule 1s ${EASE} .55s both`,
        }}
      />
      <p
        style={{
          position: "relative",
          margin: 0,
          fontSize: ".7rem",
          fontWeight: 600,
          letterSpacing: ".24em",
          textTransform: "uppercase",
          color: "#D3B995",
          animation: `introRise .9s ${EASE} .85s both`,
        }}
      >
        Building Dreams, Creating Homes
      </p>
      <p
        style={{
          position: "absolute",
          bottom: "clamp(24px,4vw,40px)",
          margin: 0,
          fontFamily: "var(--font-geist-mono),ui-monospace,monospace",
          fontSize: ".78rem",
          fontWeight: 500,
          letterSpacing: ".08em",
          color: "rgba(250,247,240,.45)",
          animation: `introRise .9s ${EASE} 1.1s both`,
        }}
      >
        South East Queensland
      </p>
    </div>
  );
}
