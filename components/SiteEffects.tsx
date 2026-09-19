"use client";
import { useEffect } from "react";
import { initReveal, initScenes } from "@/lib/site";

// Starts the entrance motion and scroll scenes once for the whole app; both watch the DOM, so pages reached by
// client-side navigation are picked up automatically. Reveals wait for the intro curtain to lift.
export default function SiteEffects() {
  useEffect(() => {
    initScenes();
    const intro = document.querySelector("[data-intro]");
    const playing = intro && getComputedStyle(intro).display !== "none";
    const timer = setTimeout(initReveal, playing ? 2300 : 0);
    return () => clearTimeout(timer);
  }, []);
  return null;
}
