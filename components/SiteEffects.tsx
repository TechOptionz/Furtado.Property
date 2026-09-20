"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { initImages, initReveal, initScenes } from "@/lib/site";

// Starts the entrance motion and scroll scenes, and again after each client-side navigation so the new page's
// elements are picked up (both skip anything already prepared). Reveals wait for the intro curtain to lift.
export default function SiteEffects() {
  const pathname = usePathname();
  useEffect(() => {
    initScenes();
    initImages();
    const intro = document.querySelector("[data-intro]");
    const playing = intro && getComputedStyle(intro).display !== "none";
    const timer = setTimeout(initReveal, playing ? 2300 : 0);
    return () => clearTimeout(timer);
  }, [pathname]);
  return null;
}
