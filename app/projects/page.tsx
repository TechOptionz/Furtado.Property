import type { Metadata } from "next";
import CountUp from "@/components/CountUp";
import ClosingCta from "@/components/projects/ClosingCta";
import DeliverStrip from "@/components/projects/DeliverStrip";
import JsonLd from "@/components/projects/JsonLd";
import MiraLiving from "@/components/projects/MiraLiving";
import ProjectsHero from "@/components/projects/ProjectsHero";
import TrackRecordSection from "@/components/projects/TrackRecordSection";
import UpcomingProjects from "@/components/projects/UpcomingProjects";
import ui from "@/components/projects/ui.module.css";

// Handwritten (no longer compiled from Projects.dc.html by scripts/convert.mjs): one component per section in
// components/projects/, all of it reading lib/projects.ts. The attributes on <main> pace the shared entrance motion
// (lib/site.js) for this page.
export const metadata: Metadata = {
  title: "Our Projects — Furtado Property",
  description: "Creating homes designed for longevity across South East Queensland.",
};

export default function Page() {
  return (
    <>
      <main
        data-screen-label="Projects"
        data-reveal-ease="cubic-bezier(.22,1,.36,1)"
        data-reveal-max="900"
        className={ui.page}
      >
        <div aria-hidden className={ui.progress} />
        <ProjectsHero />
        <MiraLiving />
        <UpcomingProjects />
        <TrackRecordSection />
        <DeliverStrip />
        <ClosingCta />
      </main>
      <CountUp />
      <JsonLd />
    </>
  );
}
