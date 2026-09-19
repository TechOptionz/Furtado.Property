"use client";
import { useEffect, useRef, useState } from "react";
import Logo from "@/components/Logo";

const EASE = "cubic-bezier(.16,1,.3,1)";
const TAGLINE = ["Building", "Dreams,", "Creating", "Homes"];
const COUNT_MS = 1900; // the counter and progress rule fill while the lockup assembles
const SCROLL_KEYS = new Set([" ", "PageUp", "PageDown", "End", "Home", "ArrowUp", "ArrowDown"]);
const LIFT_AT = 2.15; // seconds: the curtain starts to lift (globals.css --hero-delay follows this)

// Full-screen curtain shown on a full page load. It is server-rendered so it covers the very first paint; CSS hides
// it under prefers-reduced-motion, or when the inline script in the layout has marked the session as already seen.
// Sequence: logo and rule assemble, the tagline rises word by word, a counter runs to 100, then the lockup drifts up
// and the curtain lifts with a champagne panel trailing behind it.
export default function SiteIntro() {
  const [show, setShow] = useState(true);
  const countRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = document.querySelector("[data-intro]");
    if (!el || getComputedStyle(el).display === "none") return; // hidden by CSS: nothing to play
    try {
      sessionStorage.setItem("furtado-intro-seen", "1");
    } catch {}
    // Hold the page still while the curtain is up by swallowing scroll input. Hiding the root overflow would also
    // remove the scrollbar, and the hero would visibly reflow when it came back.
    const block = (e: Event) => {
      if (e instanceof KeyboardEvent && !SCROLL_KEYS.has(e.key)) return;
      e.preventDefault();
    };
    const unlock = () => {
      removeEventListener("wheel", block);
      removeEventListener("touchmove", block);
      removeEventListener("keydown", block);
    };
    addEventListener("wheel", block, { passive: false });
    addEventListener("touchmove", block, { passive: false });
    addEventListener("keydown", block);
    const start = performance.now();
    let raf = requestAnimationFrame(function tick(now) {
      const t = Math.min(1, (now - start) / COUNT_MS);
      const eased = 1 - Math.pow(1 - t, 3);
      if (countRef.current) countRef.current.textContent = String(Math.round(eased * 100)).padStart(3, "0");
      if (t < 1) raf = requestAnimationFrame(tick);
    });
    const timer = setTimeout(() => {
      unlock();
      // Later client-side visits to the home page should not wait for a curtain that is no longer there.
      document.documentElement.classList.add("intro-seen");
      setShow(false);
    }, 3300);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(raf);
      unlock();
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
        pointerEvents: "none",
      }}
    >
      {/* Trailing panel: lifts a beat after the curtain, so a champagne band sweeps up behind it */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "#D3B995",
          animation: `introLift .95s ${EASE} ${LIFT_AT + 0.14}s forwards`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "#19332F",
          color: "#FCFAF6",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          pointerEvents: "auto",
          animation: `introLift .9s ${EASE} ${LIFT_AT}s forwards`,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: "-20%",
            background:
              "radial-gradient(at 85% 10%,rgba(211,185,149,.2),transparent 50%),radial-gradient(at 10% 95%,rgba(211,185,149,.08),transparent 45%)",
            animation: "introGlow 1.2s ease-out both, introDrift 7s ease-in-out infinite alternate",
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
        {/* Lockup: drifts up and fades just before the curtain lifts */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 24,
            animation: `introOut .6s cubic-bezier(.7,0,.84,0) ${LIFT_AT - 0.3}s forwards`,
          }}
        >
          <Logo
            src="/assets/logo-white.png"
            alt="Furtado Property"
            color="#FCFAF6"
            height={64}
            style={{
              height: "clamp(40px,5vw,64px)",
              width: "auto",
              display: "block",
              animation: `introLogo 1.1s ${EASE} .15s both`,
            }}
          />
          <span
            style={{
              display: "block",
              width: "clamp(120px,14vw,200px)",
              height: 1,
              background: "#D3B995",
              animation: `introRuleCenter 1s ${EASE} .55s both`,
            }}
          />
          <p
            style={{
              margin: 0,
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "0 .6em",
              fontSize: ".7rem",
              fontWeight: 600,
              letterSpacing: ".24em",
              textTransform: "uppercase",
              color: "#D3B995",
            }}
          >
            {TAGLINE.map((word, i) => (
              <span
                key={word}
                style={{
                  display: "inline-block",
                  overflow: "hidden",
                  padding: ".2em 0",
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    animation: `introWord .8s ${EASE} ${0.85 + i * 0.09}s both`,
                  }}
                >
                  {word}
                </span>
              </span>
            ))}
          </p>
        </div>
        <div
          style={{
            position: "absolute",
            left: "clamp(20px,5vw,80px)",
            right: "clamp(20px,5vw,80px)",
            bottom: "clamp(24px,4vw,40px)",
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontFamily: "var(--font-geist-mono),ui-monospace,monospace",
            fontSize: ".78rem",
            fontWeight: 500,
            letterSpacing: ".08em",
            color: "rgba(250,247,240,.45)",
            animation: `introRise .9s ${EASE} .4s both`,
          }}
        >
          <span style={{ whiteSpace: "nowrap" }}>South East Queensland</span>
          <span
            style={{
              position: "relative",
              flex: 1,
              height: 1,
              background: "rgba(250,247,240,.12)",
            }}
          >
            <span
              style={{
                position: "absolute",
                inset: 0,
                background: "#D3B995",
                transformOrigin: "left",
                animation: `introRule ${COUNT_MS}ms cubic-bezier(.33,1,.68,1) both`,
              }}
            />
          </span>
          <span ref={countRef} style={{ color: "#D3B995", fontVariantNumeric: "tabular-nums" }}>
            000
          </span>
        </div>
      </div>
    </div>
  );
}
