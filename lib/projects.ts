// Everything /projects says (components/projects/). The communities in the track record stay in lib/track-record.ts
// and are re-exported here; lib/site-config.ts takes Mira Living's completion and construction status from this file,
// so the other pages, the footer and the chat follow it.
import type { Community } from "./track-record";

export { communities, groups, homesIn, totals } from "./track-record";
export type { CommunityGroup } from "./track-record";
export type ManagedCommunity = Community;

// A photograph in public/uploads. Its size and blur placeholder are looked up where it is drawn (lib/photo.ts), which
// keeps this file small enough for the footer and the chat to read their status lines from it.
export type Photo = { src: string; alt: string };
const photo = (src: string, alt: string): Photo => ({ src, alt });

export type ConstructionStage = {
  name: string;
  status: "complete" | "current" | "upcoming";
  // How far through a "current" stage the build is, 0–100.
  percent?: number;
  note: string;
};

export type Spec = { label: string; value: string };

export type Project = {
  name: string;
  href: string;
  salesStatus: string;
  location: string;
  description: string;
  residences: number;
  specs: Spec[];
  team: Spec[];
  completion: string;
  stages: ConstructionStage[];
  // ISO date the construction stages were last confirmed with the builder; null until the client supplies one.
  lastUpdated: string | null;
  availabilityNote: string;
  lead: Photo;
  gallery: Photo[];
};

export const UPCOMING_STAGES = ["Site selection", "Design", "Planning", "Release"] as const;

export type UpcomingProject = {
  name: string;
  type: string;
  location: string;
  description: string;
  stage: (typeof UPCOMING_STAGES)[number];
  image: Photo;
};

// ╔════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
// ║ TODO (CLIENT TO CONFIRM): Mira Living's construction status below is OUT OF DATE.                          ║
// ║ The site still says "completion Q2 2026" and "structure 50% complete". Before this goes live, confirm:     ║
// ║   1. the current stage and its percentage  (stages)                                                        ║
// ║   2. the completion date                   (COMPLETION)                                                    ║
// ║   3. the date those figures were confirmed (lastUpdated, as "YYYY-MM-DD"; the page shows                   ║
// ║      "Last updated: to be confirmed" while it is null)                                                     ║
// ╚════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
const COMPLETION = "Q2 2026";

const front = photo("/uploads/front.jpg", "Front elevation of Mira Living at dusk, seen from the Esplanade");

export const miraLiving: Project = {
  name: "Mira Living",
  href: "/projects/mira-living",
  salesStatus: "Now selling",
  location: "Bargara QLD",
  description:
    "Twenty-five oceanfront residences at the south end of the Bargara Esplanade, a few hundred metres from the sand. Each has three bedrooms and European appliances throughout. Residents share a tropical landscaped pool and an alfresco area.",
  residences: 25,
  specs: [
    { label: "Residences", value: "25 three-bedroom" },
    { label: "Completion", value: COMPLETION },
    { label: "Parking", value: "Two basement spaces each" },
  ],
  team: [
    { label: "Architect", value: "Mondo Architects" },
    { label: "Builder", value: "Manage Design Build" },
    { label: "Interiors", value: "Sarah Wood Design" },
  ],
  completion: COMPLETION,
  stages: [
    { name: "Site", status: "complete", note: "Cleared and excavated" },
    { name: "Basement", status: "complete", note: "Complete" },
    { name: "Structure", status: "current", percent: 50, note: "Under way" },
    { name: "Completion", status: "upcoming", note: COMPLETION },
  ],
  lastUpdated: null,
  // TODO (client): confirm this still holds. No availability numbers are published anywhere on the site.
  availabilityNote: "Limited availability remains",
  lead: front,
  gallery: [
    front,
    photo(
      "/uploads/mira-living-room-balcony-ocean-view.webp",
      "Living room opening to a balcony with an ocean view",
    ),
    photo("/uploads/pool.jpg", "Landscaped pool with sun loungers and a shaded alfresco area"),
    photo("/uploads/mira-kitchen-living-open-plan.webp", "Open-plan kitchen with a stone island, and the living area"),
  ],
};

export const upcomingProjects: UpcomingProject[] = [
  {
    name: "Coastal Apartments",
    type: "Boutique apartments",
    location: "Queensland coast",
    description:
      "A second boutique oceanfront address, following the Mira Living approach: generous three-bedroom floor plans, deep balconies and resort-style amenity.",
    stage: "Design",
    image: photo(
      "/uploads/upcoming-coastal-apartments.jpg",
      "Indicative render of a boutique beachfront apartment building",
    ),
  },
  {
    name: "Townhome Collection",
    type: "Townhomes",
    location: "South East Queensland",
    description:
      "Low-maintenance townhomes for downsizers and families, on a walkable, well-located site close to shops, schools and transport.",
    stage: "Planning",
    image: photo("/uploads/upcoming-townhomes.jpg", "Indicative render of a row of contemporary townhomes"),
  },
  {
    name: "Hinterland Residences",
    type: "Detached residences",
    location: "SEQ hinterland",
    description:
      "A small release of architect-designed homes set into the landscape, with elevated outlooks and materials chosen for longevity.",
    stage: "Site selection",
    image: photo(
      "/uploads/upcoming-hinterland-residences.jpg",
      "Indicative render of hillside residences overlooking the coast",
    ),
  },
];

export const upcomingDisclaimer =
  "Images are indicative only. Upcoming projects are subject to site acquisition, design development and planning approval; names, locations and details may change.";

export const hero = {
  image: photo("/uploads/aerial.jpg", "The Bargara coastline and Esplanade from the air"),
  lead: "A residential developer with over 20 years in property, now selling on the Bargara Esplanade with more in planning across South East Queensland.",
  // Figures that are whole numbers count up once (components/CountUp.tsx); the completion date is shown as written.
  stats: [
    { value: "20+", label: "Years in property", count: true },
    { value: String(miraLiving.residences), label: "Oceanfront residences now selling", count: true },
    { value: String(upcomingProjects.length), label: "Developments in the pipeline", count: true },
    { value: miraLiving.completion, label: `${miraLiving.name} completion`, count: false },
  ],
};

// The short form of "How we work" on /about.
export const deliverySteps = [
  { name: "Site selection", line: "Well-located sites in undersupplied markets." },
  { name: "Design", line: "Shaped with experienced regional designers." },
  { name: "Construction", line: "Delivered with trusted builders." },
  { name: "Delivery", line: "The same team from first enquiry to the keys." },
];

export const closing = {
  image: photo("/uploads/pool.jpg", ""),
  phone: { label: "0418 982 517", href: "tel:0418982517" },
  email: "info@furtadoproperty.com.au",
};
