// Handwritten: not part of the design export (see scripts/convert.mjs).
import type { Metadata } from "next";
import Link from "next/link";
import LegalPage, { type LegalSection } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Terms — Furtado Property",
  description: "The terms that apply to your use of the Furtado Property website.",
};

const sections: LegalSection[] = [
  {
    id: "acceptance",
    title: "Using this website",
    body: (
      <>
        <p>
          This website is operated by Furtado Property. By using it you agree to these terms. If you do not agree,
          please do not use the website.
        </p>
        <p>
          You may use the website for lawful purposes only. You must not interfere with its operation, attempt to gain
          unauthorised access to it, or use it to send unsolicited or misleading material.
        </p>
      </>
    ),
  },
  {
    id: "information",
    title: "Information on this website",
    body: (
      <>
        <p>
          The content of this website is general information about Furtado Property and its developments. It is not an
          offer to sell, does not form part of any contract, and is not legal, financial or investment advice.
        </p>
        <p>
          Images, plans, specifications, prices, availability and completion dates are indicative and can change
          without notice. The full disclaimer is set out in our{" "}
          <Link href="/privacy#disclaimer">Privacy &amp; Disclaimer</Link>. Any purchase is governed solely by the
          contract of sale and its disclosure documents.
        </p>
      </>
    ),
  },
  {
    id: "ip",
    title: "Intellectual property",
    body: (
      <>
        <p>
          Unless stated otherwise, the text, photographs, renders, plans, video, logos and design of this website are
          owned by or licensed to Furtado Property and are protected by copyright and trade mark law.
        </p>
        <p>
          You may view the website and print or save pages for your own personal, non-commercial use. You must not
          otherwise copy, reproduce, republish or adapt any part of it without our written permission.
        </p>
      </>
    ),
  },
  {
    id: "enquiries",
    title: "Enquiries",
    body: (
      <p>
        Sending an enquiry through this website does not reserve a property or create any obligation on you or on us.
        Please make sure the details you give us are accurate. We handle them as described in our{" "}
        <Link href="/privacy">Privacy &amp; Disclaimer</Link>.
      </p>
    ),
  },
  {
    id: "links",
    title: "Links to other websites",
    body: (
      <p>
        This website links to other websites, including our social media pages. Those websites are not under our
        control, and we are not responsible for their content or their privacy practices.
      </p>
    ),
  },
  {
    id: "liability",
    title: "Liability",
    body: (
      <>
        <p>
          We take care to keep this website accurate and available, but we do not promise that it will be free of
          errors, uninterrupted or free of viruses.
        </p>
        <p>
          To the extent the law allows, Furtado Property is not liable for any loss or damage arising from your use
          of, or reliance on, this website. Nothing in these terms excludes, restricts or modifies any right or remedy
          you have under the Australian Consumer Law or any other law that cannot be excluded.
        </p>
      </>
    ),
  },
  {
    id: "law",
    title: "Governing law",
    body: (
      <p>
        These terms are governed by the laws of Queensland, Australia, and you submit to the non-exclusive jurisdiction
        of the courts of Queensland.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes and contact",
    body: (
      <>
        <p>
          We may update these terms from time to time. The current version is always the one published here, and your
          continued use of the website means you accept it.
        </p>
        <p>
          Questions about these terms? Email{" "}
          <a href="mailto:info@furtadoproperty.com.au">info@furtadoproperty.com.au</a> or call{" "}
          <a href="tel:0418982517">0418 982 517</a>.
        </p>
      </>
    ),
  },
];

export default function Page() {
  return (
    <LegalPage
      label="Terms"
      title="Terms"
      intro="The terms that apply when you use the Furtado Property website. Please read them together with our Privacy & Disclaimer."
      updated="1 October 2026"
      sections={sections}
      other={{ href: "/privacy", label: "Read our Privacy & Disclaimer" }}
    />
  );
}
