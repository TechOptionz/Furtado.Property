import { closing, miraLiving } from "@/lib/projects";

// Structured data for /projects: the company, and Mira Living as an apartment complex. No price or availability
// figures, because the site publishes none. Same site URL rule as app/layout.tsx.
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

const organization = {
  "@type": "Organization",
  "@id": `${siteUrl}/#organization`,
  name: "Furtado Property",
  url: siteUrl,
  logo: `${siteUrl}/assets/logo-dark.png`,
  email: closing.email,
  telephone: "+61418982517",
  areaServed: "South East Queensland",
};

const residence = {
  "@type": "ApartmentComplex",
  name: miraLiving.name,
  description: miraLiving.description,
  url: `${siteUrl}${miraLiving.href}`,
  image: miraLiving.gallery.map((photo) => `${siteUrl}${photo.src}`),
  numberOfAccommodationUnits: { "@type": "QuantitativeValue", value: miraLiving.residences },
  numberOfBedrooms: 3,
  address: { "@type": "PostalAddress", addressLocality: "Bargara", addressRegion: "QLD", addressCountry: "AU" },
  brand: { "@id": `${siteUrl}/#organization` },
};

export default function JsonLd() {
  const data = { "@context": "https://schema.org", "@graph": [organization, residence] };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
