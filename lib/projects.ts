// Everything /projects says (components/projects/). lib/site-config.ts takes Mira Living's completion and
// construction status from this file, so the other pages, the footer and the chat follow it.

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
  // "01", "02": the order the projects were announced in.
  number: string;
  name: string;
  type: string;
  location: string;
  description: string;
  stage: (typeof UPCOMING_STAGES)[number];
  // One line under the stage track on where the project stands, e.g. when an application was lodged.
  stageNote?: string;
  // The headline figures (storeys, apartments, mix), shown large.
  figures: Spec[];
  // The consultant team, where one has been named publicly.
  team: Spec[];
  // The lead render and up to two supporting views; without a lead the section shows a reserved panel instead.
  lead?: Photo;
  details: Photo[];
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

// West End's figures are from the development application Furtado Property (FP Margate Pty Ltd) lodged with Brisbane
// City Council, received 9 September 2026, as reported publicly. It is a proposal: never describe it as approved,
// under construction or complete. The renders are MAS Architecture's, from the application.
// Mount Gravatt's figures are from MAS Architecture's development application report for 32–34 Lauder Street,
// Mount Gravatt East (August 2026), supplied by the client on 27 October 2026: five levels, 30 apartments,
// construction expected to begin early 2027. The client has not settled the project's name, so the working title in
// the report is deliberately not used here; the entry is called after its suburb until a name is confirmed. The
// renders are MAS Architecture's, from the report. Like West End it is a proposal: never describe it as approved,
// under construction or complete.
export const upcomingProjects: UpcomingProject[] = [
  {
    number: "01",
    name: "West End",
    type: "Residential apartments",
    location: "West End, Brisbane",
    description:
      "Thirteen storeys of two- and three-bedroom residences on a quiet inner-city street, a short walk from Boundary Street, South Bank and the river. Planted balconies, a brick and timber-lined podium and a landscaped street entry give the building a warmth that belongs to West End.",
    stage: "Planning",
    stageNote: "Lodged with Brisbane City Council · September 2026",
    figures: [
      { label: "Storeys", value: "13" },
      { label: "Apartments", value: "113" },
      { label: "Two & three bedroom", value: "92 · 21" },
    ],
    team: [
      { label: "Architect", value: "MAS Architecture" },
      { label: "Town planner", value: "Urbicus" },
      { label: "Landscape", value: "AS Design" },
    ],
    lead: photo(
      "/uploads/west-end-tower.jpg",
      "Indicative render of the proposed thirteen-storey West End building, with curved white balconies, terracotta blades and a planted rooftop, seen from the street",
    ),
    details: [
      photo(
        "/uploads/west-end-frontage.jpg",
        "Indicative render of the street frontage: a landscaped verge and a timber-lined drop-off beneath the building",
      ),
      photo(
        "/uploads/west-end-undercroft.jpg",
        "Indicative render of the entry undercroft: brick piers, a timber-battened ceiling and a paved forecourt at dusk",
      ),
    ],
  },
  {
    number: "02",
    name: "Mount Gravatt",
    type: "Residential apartments",
    location: "Lauder Street, Mount Gravatt East",
    description:
      "Thirty apartments over five levels on a quiet street on Brisbane's south side, minutes from Westfield Garden City, Griffith University and the Mount Gravatt Lookout. Deep, planted balconies, timber-battened screens and a tree-lined rooftop draw on the bushland of the mountain itself, with filtered light and cross-breezes through every home.",
    stage: "Planning",
    stageNote: "Development application prepared · August 2026 · construction expected to begin early 2027",
    figures: [
      { label: "Levels", value: "5" },
      { label: "Apartments", value: "30" },
      { label: "Construction start", value: "Early 2027" },
    ],
    team: [
      { label: "Architect", value: "MAS Architecture" },
      { label: "Town planner", value: "Urbicus" },
      { label: "Landscape", value: "AS Design" },
    ],
    lead: photo(
      "/uploads/mount-gravatt-street.jpg",
      "Indicative render of the proposed five-level Mount Gravatt building from Lauder Street, with deep planted balconies, timber-battened screens and trees along the rooftop",
    ),
    details: [
      photo(
        "/uploads/mount-gravatt-rear.jpg",
        "Indicative render of the rear facade: stepped balconies and full-height glazing above a landscaped garden",
      ),
      photo(
        "/uploads/mount-gravatt-balconies.jpg",
        "Indicative render looking up from the entry: stacked balconies with planted edges and timber battens",
      ),
    ],
  },
];

export const upcomingDisclaimer =
  "Images are indicative only. West End is a proposed development, lodged with Brisbane City Council in September 2026 and not yet approved, under construction or complete. Mount Gravatt is a proposed development with a development application prepared in August 2026; it is not yet approved, under construction or complete, and its name is yet to be confirmed. Upcoming projects are subject to site acquisition, design development and planning approval; names, locations and details may change.";

export const hero = {
  image: photo("/uploads/bargara-coast-aerial.jpg", "The Bargara coastline and Esplanade from the air, with Mira Living on the headland"),
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
