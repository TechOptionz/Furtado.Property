// Communities Furtado Property has managed, from the company's experience sheet. Shown in full on /projects and in
// summary on /about (components/TrackRecord.tsx), and quoted by the chat (lib/chat-topics.ts). Totals are derived
// from this list, so adding or correcting an entry updates every figure on the site.
export type Community = {
  name: string;
  // Street and suburb as one line; suburb is what the "locations" count is taken from.
  street?: string;
  suburb: string;
  homes: number;
  unit: "units" | "apartments";
  // Year management commenced, and the year the community was sold.
  from: number;
  to: number;
  soldTo: string;
};

export type CommunityGroup = { title: string; singular: string; plural: string; communities: Community[] };

const EUREKA = "Eureka Group Holdings";
const PRIVATE = "private operators";

export const groups: CommunityGroup[] = [
  {
    title: "Residential complexes",
    singular: "complex",
    plural: "complexes",
    communities: [
      {
        name: "Deagon Village",
        street: "Board Street",
        suburb: "Deagon",
        homes: 84,
        unit: "units",
        from: 2008,
        to: 2022,
        soldTo: EUREKA,
      },
      {
        name: "Freshwater Villas",
        street: "Duffield Road",
        suburb: "Kallangur",
        homes: 60,
        unit: "units",
        from: 2010,
        to: 2021,
        soldTo: PRIVATE,
      },
      {
        name: "The Brook at Kalinger Park",
        street: "Bage Street",
        suburb: "Nundah",
        homes: 74,
        unit: "units",
        from: 2012,
        to: 2016,
        soldTo: PRIVATE,
      },
      {
        name: "Madison Green",
        street: "Westacott Street",
        suburb: "Nundah",
        homes: 45,
        unit: "apartments",
        from: 2012,
        to: 2023,
        soldTo: PRIVATE,
      },
    ],
  },
  {
    title: "Over-50s villages",
    singular: "village",
    plural: "villages",
    communities: [
      {
        name: "Oxford Crest Riverhills Gardens",
        street: "Fryar Road",
        suburb: "Eagleby",
        homes: 73,
        unit: "units",
        from: 2012,
        to: 2022,
        soldTo: EUREKA,
      },
      {
        name: "Oxford Crest Whitehill Gardens",
        street: "Cascade Street",
        suburb: "Raceview",
        homes: 81,
        unit: "units",
        from: 2012,
        to: 2022,
        soldTo: EUREKA,
      },
      {
        name: "Oxford Crest Bundamba",
        street: "Lindsay Street",
        suburb: "Bundamba",
        homes: 43,
        unit: "units",
        from: 2012,
        to: 2022,
        soldTo: EUREKA,
      },
      {
        name: "Oxford Crest Gympie Gardens",
        street: "College Street",
        suburb: "Gympie",
        homes: 90,
        unit: "units",
        from: 2012,
        to: 2022,
        soldTo: EUREKA,
      },
      {
        name: "Oxford Crest Toowoomba",
        street: "James Street",
        suburb: "Toowoomba",
        homes: 71,
        unit: "units",
        from: 2012,
        to: 2022,
        soldTo: EUREKA,
      },
      // The experience sheet gives no street for Beachmere.
      {
        name: "Oxford Crest Beachmere",
        suburb: "Beachmere",
        homes: 65,
        unit: "units",
        from: 2012,
        to: 2022,
        soldTo: EUREKA,
      },
      {
        name: "Village Life Toowoomba",
        street: "Drayton Road",
        suburb: "Toowoomba",
        homes: 48,
        unit: "units",
        from: 2012,
        to: 2024,
        soldTo: PRIVATE,
      },
    ],
  },
];

export const communities = groups.flatMap((g) => g.communities);
const sum = (list: Community[]) => list.reduce((n, c) => n + c.homes, 0);

export const totals = {
  communities: communities.length,
  homes: sum(communities),
  villages: groups[1].communities.length,
  complexes: groups[0].communities.length,
  locations: new Set(communities.map((c) => c.suburb)).size,
  from: Math.min(...communities.map((c) => c.from)),
  to: Math.max(...communities.map((c) => c.to)),
};
export const homesIn = (g: CommunityGroup) => sum(g.communities);
