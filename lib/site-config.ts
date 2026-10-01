import { miraLiving } from "./projects";

// Mira Living status lines used across the site. The sales status, completion date and construction progress are
// kept in lib/projects.ts (with the rest of what /projects says); update them there.
const { salesStatus, completion } = miraLiving;
const current = miraLiving.stages.find((s) => s.status === "current");
const constructionStatus = `${current?.percent ?? 0}% complete`;

export const site = {
  salesStatus,
  completion,
  constructionStatus,
  structureStatus: `Under way, ${constructionStatus}`,
  availability: `${miraLiving.availabilityNote}.`,
  statusLine: `${salesStatus} · Mira Living · ${miraLiving.location}`,
  // The intro curtain only ever plays on the home page. true: once, when the visitor first enters the site there;
  // false: on every full load of the home page.
  introOncePerSession: false,
};
