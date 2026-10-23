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

// Mira Living is built: construction is complete and the display suite is open. These figures were checked against the
// official sales site (mira-living-psi.vercel.app) on 2026-10-23; lastUpdated records that check.
const COMPLETION = "2026";

const front = photo("/uploads/mira-building-dusk-aerial.jpg", "Mira Living at dusk, from the air above the Esplanade");

export const miraLiving: Project = {
  name: "Mira Living",
  href: "/projects/mira-living",
  salesStatus: "Now selling",
  location: "Bargara QLD",
  description:
    "Twenty-five oceanfront residences on the Bargara Esplanade, directly on the beachfront. Each has three bedrooms and integrated Smeg appliances throughout. Residents share a resort-style pool and an alfresco area.",
  residences: 25,
  specs: [
    { label: "Residences", value: "25 three-bedroom" },
    { label: "Construction", value: "Complete · display suite open" },
    { label: "Parking", value: "Two basement spaces each" },
  ],
  team: [
    { label: "Architect", value: "Sparc" },
    { label: "Builder", value: "IDC Construct" },
    { label: "Interiors", value: "Sarah Wood Designs" },
  ],
  completion: COMPLETION,
  stages: [
    { name: "Site", status: "complete", note: "Cleared and excavated" },
    { name: "Basement", status: "complete", note: "Complete" },
    { name: "Structure", status: "complete", note: "Complete" },
    { name: "Completion", status: "complete", note: "Complete · display suite open" },
  ],
  lastUpdated: "2026-10-23",
  // The sales site lists 10 of the 25 residences as available on its September 2026 price guide.
  availabilityNote: "Limited availability remains",
  lead: front,
  gallery: [
    front,
    photo("/uploads/mira-living-room-balcony.jpg", "Living room opening through sliding doors to the balcony and the Esplanade parkland"),
    photo("/uploads/mira-pool-dusk.jpg", "The residents' pool and alfresco terrace at dusk"),
    photo("/uploads/mira-kitchen-dining.jpg", "Open-plan kitchen with a stone island, dining and living"),
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
  image: photo("/uploads/mira-pool-dusk.jpg", ""),
  phone: { label: "0418 982 517", href: "tel:0418982517" },
  email: "info@furtadoproperty.com.au",
};
