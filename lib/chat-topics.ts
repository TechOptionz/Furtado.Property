import { site } from "@/lib/site-config";

// Questions and answers for components/ChatBot.tsx. Every answer restates what the site already says (status lines
// come from lib/site-config.ts); anything the site does not publish — prices, the stock list, body corporate levies,
// pet rules — is handed to the sales team rather than guessed at.
export type ChatLink = { label: string; href: string };
export type ChatTopic = {
  id: string;
  question: string;
  // Words and phrases a visitor might type; phrases score higher than single words.
  keywords: string[];
  answer: string[];
  links?: ChatLink[];
  // Topics offered as follow-up chips.
  next: string[];
};

export const PHONE = "0418 982 517";
export const EMAIL = "info@furtadoproperty.com.au";
const call: ChatLink = { label: `Call ${PHONE}`, href: "tel:+61418982517" };
const enquire: ChatLink = { label: "Send an enquiry", href: "/contact" };

export const topics: ChatTopic[] = [
  {
    id: "availability",
    question: "What is still available at Mira Living?",
    keywords: [
      "available",
      "availability",
      "left",
      "remaining",
      "sold",
      "sold out",
      "for sale",
      "buy",
      "stock",
      "selling",
    ],
    answer: [
      `Mira Living is ${site.salesStatus.toLowerCase()}, and ${site.availability.toLowerCase()} There are 25 residences in total, all three-bedroom, some with a study or multi-purpose room.`,
      "The list of apartments still available changes as sales go through, so the team will send you the current one.",
    ],
    links: [enquire, call],
    next: ["price", "brochure", "movein"],
  },
  {
    id: "price",
    question: "How much are the apartments?",
    keywords: [
      "price",
      "prices",
      "pricing",
      "cost",
      "how much",
      "budget",
      "expensive",
      "afford",
      "price list",
      "priced",
    ],
    answer: [
      "Prices are not published on the website, because they depend on the level, aspect and floor plan of each apartment.",
      "Ask for the current price list with the brochure and the team will reply within one business day.",
    ],
    links: [{ label: "Request the price list", href: "/contact" }, call],
    next: ["availability", "brochure", "included"],
  },
  {
    id: "movein",
    question: "When can I move in?",
    keywords: [
      "move in",
      "move-in",
      "completion",
      "complete",
      "finished",
      "ready",
      "construction",
      "progress",
      "built",
      "settle",
      "settlement",
      "timeline",
    ],
    answer: [
      `Completion is scheduled for ${site.completion}. The site is cleared and excavated, the basement is complete and the structure is under way, ${site.constructionStatus}.`,
      "For the latest programme from the builder, ask the team, or follow the construction updates on Instagram @furtadoproperty.",
    ],
    links: [{ label: "See construction progress", href: "/projects/mira-living" }, enquire],
    next: ["builder", "availability", "inspect"],
  },
  {
    id: "brochure",
    question: "Can I get the floor plans and brochure?",
    keywords: [
      "brochure",
      "floor plan",
      "floor plans",
      "floorplan",
      "plans",
      "layout",
      "finishes",
      "schedule",
      "size",
      "sqm",
      "square metres",
      "download",
      "pdf",
    ],
    answer: [
      "Yes. The brochure contains the floor plans and the finishes schedule. It is sent on request rather than downloaded.",
      "Choose “Mira Living, Bargara” on the enquiry form and mention the brochure; you will hear back within one business day.",
    ],
    links: [{ label: "Request the brochure", href: "/contact" }],
    next: ["included", "price", "availability"],
  },
  {
    id: "included",
    question: "What is included in each apartment?",
    keywords: [
      "included",
      "inclusions",
      "features",
      "bedroom",
      "bedrooms",
      "kitchen",
      "appliances",
      "interior",
      "interiors",
      "finishes",
      "parking",
      "garage",
      "car",
      "cars",
      "pool",
      "study",
      "ensuite",
      "wardrobe",
      "balcony",
      "amenities",
    ],
    answer: [
      "Every apartment has three bedrooms, and some add a study or multi-purpose room. Master bedrooms have walk-in wardrobes and ensuites, and kitchens are fitted with high-end European appliances, porcelain benchtops and walnut-toned joinery.",
      "Each apartment has basement garaging for two cars. Residents share a tropical landscaped pool and gardens beside a communal alfresco area.",
    ],
    links: [{ label: "View the gallery", href: "/projects/mira-living" }],
    next: ["brochure", "location", "price"],
  },
  {
    id: "location",
    question: "Where is Mira Living, and what is nearby?",
    keywords: [
      "where",
      "location",
      "located",
      "address",
      "bargara",
      "beach",
      "esplanade",
      "golf",
      "airport",
      "bundaberg",
      "nearby",
      "close to",
      "cafes",
      "shops",
      "distance",
      "map",
    ],
    answer: [
      "Mira Living is at the south end of the Esplanade in Bargara, Queensland, a few hundred metres from the sand.",
      "The beach and Esplanade are a short walk, Bargara Golf Club is within walking distance, and the cafés of Bauer Street are close by. Bundaberg is 20 minutes away and Bundaberg Airport 25 minutes.",
    ],
    links: [{ label: "More about Bargara", href: "/projects/mira-living" }],
    next: ["invest", "inspect", "included"],
  },
  {
    id: "invest",
    question: "Why are buyers looking at Bargara?",
    keywords: [
      "invest",
      "investment",
      "investor",
      "growth",
      "rent",
      "rental",
      "yield",
      "return",
      "value",
      "market",
      "hospital",
      "capital",
      "why bargara",
      "downsize",
      "downsizing",
      "retire",
      "retirement",
      "sea change",
      "lifestyle",
    ],
    answer: [
      "Bargara pairs natural beauty with village charm: the Esplanade, the beach, the golf club and local markets, 20 minutes from Bundaberg. The region is seeing considered growth, including the new $1.2 billion Bundaberg Hospital, part of Queensland’s Big Build programme.",
      "Furtado chooses well-located sites in undersupplied markets, picked for long-term liveability; Mira Living has just 25 residences. We can’t give financial advice or rental estimates here, but the team is happy to talk through the project with you or your adviser.",
    ],
    links: [enquire, call],
    next: ["location", "price", "availability"],
  },
  {
    id: "inspect",
    question: "Can I visit the site or speak to someone?",
    keywords: [
      "inspect",
      "inspection",
      "visit",
      "display",
      "appointment",
      "meet",
      "tour",
      "see it",
      "viewing",
      "open home",
      "speak",
      "talk",
      "agent",
      "sales",
      "human",
      "person",
      "someone",
    ],
    answer: [
      `Yes. Call ${PHONE} or send an enquiry to arrange a time with the team.`,
      "Enquiries are answered within one business day.",
    ],
    links: [call, enquire],
    next: ["brochure", "location", "movein"],
  },
  {
    id: "builder",
    question: "Who is building Mira Living?",
    keywords: [
      "builder",
      "architect",
      "designer",
      "design",
      "team",
      "who built",
      "who is building",
      "manage design build",
      "mondo",
      "sarah wood",
      "developer",
      "quality",
    ],
    answer: [
      "Furtado Property is the developer, with over 20 years in property. The builder is Manage Design Build, the architect is Mondo Architects, and the interiors are by Sarah Wood Design.",
      "All are regional specialists who know the Queensland coast, and Furtado stays involved from site selection through to handover.",
    ],
    links: [{ label: "About Furtado Property", href: "/about" }],
    next: ["movein", "furtado", "included"],
  },
  {
    id: "furtado",
    question: "Who is Furtado Property, and what is coming next?",
    keywords: [
      "furtado",
      "company",
      "about",
      "who are you",
      "experience",
      "other projects",
      "future",
      "upcoming",
      "next project",
      "past projects",
      "new developments",
      "brisbane",
      "gold coast",
      "sunshine coast",
    ],
    answer: [
      "Furtado Property is a residential developer in South East Queensland with over 20 years of property experience, focused on quality, architectural design and customer satisfaction.",
      "Mira Living is the project now selling. To hear about upcoming developments first, choose “Future developments” on the enquiry form.",
    ],
    links: [
      { label: "Our projects", href: "/projects" },
      { label: "Register for future projects", href: "/contact" },
    ],
    next: ["availability", "builder", "contact"],
  },
  {
    id: "buying",
    question: "How does buying off the plan work here?",
    keywords: [
      "off the plan",
      "off-the-plan",
      "deposit",
      "contract",
      "process",
      "how to buy",
      "steps",
      "reserve",
      "reservation",
      "finance",
      "loan",
      "mortgage",
      "stamp duty",
      "first home",
      "grant",
      "firb",
      "foreign",
      "overseas",
      "solicitor",
    ],
    answer: [
      "In short: request the brochure and price list, choose an apartment with the team, then your solicitor reviews the contract before you sign. Settlement follows completion of the building.",
      `Deposit terms, contract conditions and eligibility for grants or concessions depend on your circumstances, so the team will take you through them directly. Call ${PHONE} or send an enquiry.`,
    ],
    links: [enquire, call],
    next: ["price", "movein", "brochure"],
  },
  {
    id: "living",
    question: "Are pets allowed, and what are the body corporate fees?",
    keywords: [
      "pet",
      "pets",
      "dog",
      "dogs",
      "cat",
      "body corporate",
      "strata",
      "levies",
      "levy",
      "fees",
      "rates",
      "holiday let",
      "airbnb",
      "short stay",
      "short-term",
      "by-laws",
      "bylaws",
    ],
    answer: [
      "Body corporate levies, pet approval and letting rules are set out in the contract documents and by-laws rather than on the website, so we won’t guess at them here.",
      "Ask the team and they will send the details with the brochure.",
    ],
    links: [enquire, call],
    next: ["brochure", "included", "buying"],
  },
  {
    id: "contact",
    question: "How do I get in touch?",
    keywords: [
      "contact",
      "phone",
      "call",
      "email",
      "number",
      "reach",
      "get in touch",
      "enquire",
      "enquiry",
      "instagram",
      "facebook",
      "social",
      "hours",
      "office",
    ],
    answer: [
      `Call ${PHONE}, email ${EMAIL}, or use the enquiry form. Enquiries are answered within one business day.`,
      "Construction updates and new releases are posted on Instagram @furtadoproperty.",
    ],
    links: [call, { label: `Email ${EMAIL}`, href: `mailto:${EMAIL}` }, enquire],
    next: ["inspect", "brochure", "availability"],
  },
];

// Shown when the panel opens: what buyers ask first.
export const starters = ["availability", "price", "movein", "brochure", "location", "invest"];

export const greeting = [
  "Hello, and welcome to Furtado Property. I can answer common questions about Mira Living, our oceanfront residences in Bargara.",
  "Choose a question below or type your own.",
];

export const fallback = {
  answer: [
    "I don’t have an answer to that one, and I would rather not guess.",
    `The team can help directly: call ${PHONE} or send an enquiry, and you will hear back within one business day.`,
  ],
  links: [call, enquire],
  next: ["availability", "price", "brochure"],
};

const byId = new Map(topics.map((t) => [t.id, t]));
export const topic = (id: string) => byId.get(id)!;

// Best topic for typed text: whole-word matches, with multi-word phrases weighted above single words.
export function matchTopic(input: string): ChatTopic | null {
  const text = ` ${input
    .toLowerCase()
    .replace(/[^a-z0-9$\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()} `;
  let best: ChatTopic | null = null;
  let bestScore = 0;
  for (const t of topics) {
    let score = 0;
    for (const k of t.keywords) {
      if (text.includes(` ${k} `) || (k.length > 3 && text.includes(` ${k}s `))) score += k.includes(" ") ? 3 : 1;
    }
    if (score > bestScore) {
      best = t;
      bestScore = score;
    }
  }
  return best;
}
