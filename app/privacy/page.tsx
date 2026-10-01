// Handwritten: not part of the design export (see scripts/convert.mjs).
import type { Metadata } from "next";
import Link from "next/link";
import LegalPage, { type LegalSection } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Privacy & Disclaimer — Furtado Property",
  description:
    "How Furtado Property collects, uses and protects your personal information, and the disclaimer that applies to the information on this website.",
};

const sections: LegalSection[] = [
  {
    id: "collect",
    title: "Information we collect",
    body: (
      <>
        <p>We only collect personal information you choose to give us. When you send an enquiry, this is:</p>
        <ul>
          <li>your first and last name;</li>
          <li>your email address and, if you provide it, your phone number;</li>
          <li>the development or topic you are enquiring about; and</li>
          <li>anything else you tell us in your message.</li>
        </ul>
        <p>
          We also receive the details you share when you phone us, email us or contact us through our social media
          pages. You can browse this website without telling us who you are.
        </p>
      </>
    ),
  },
  {
    id: "use",
    title: "How we use it",
    body: (
      <>
        <p>We use your personal information to:</p>
        <ul>
          <li>respond to your enquiry and provide the information you asked for;</li>
          <li>keep you informed about a development you have expressed interest in;</li>
          <li>manage our relationship with you, including any sale or purchase; and</li>
          <li>meet our legal and regulatory obligations.</li>
        </ul>
        <p>
          We will not send you marketing you have not asked for, and you can ask us to stop contacting you at any time.
        </p>
      </>
    ),
  },
  {
    id: "disclosure",
    title: "Who we share it with",
    body: (
      <>
        <p>We do not sell your personal information. We share it only where needed to deal with your enquiry, with:</p>
        <ul>
          <li>sales agents and consultants appointed to the development you enquired about;</li>
          <li>service providers who host this website and deliver enquiry emails on our behalf; and</li>
          <li>professional advisers, or other parties where the law requires or permits it.</li>
        </ul>
        <p>
          Some of our service providers store or process data outside Australia. Where that happens, we take reasonable
          steps to see that your information is handled in a way consistent with the Australian Privacy Principles.
        </p>
      </>
    ),
  },
  {
    id: "cookies",
    title: "Cookies and website data",
    body: (
      <>
        <p>
          This website does not use advertising or tracking cookies. It keeps a single entry in your browser&rsquo;s
          session storage to remember that the opening animation has played; it holds no personal information and is
          cleared when you close the tab.
        </p>
        <p>
          Like most websites, our hosting provider records standard technical information, such as IP address, browser
          type and pages requested, to keep the site secure and running.
        </p>
      </>
    ),
  },
  {
    id: "security",
    title: "Storage and security",
    body: (
      <p>
        We take reasonable steps to protect personal information from misuse, loss and unauthorised access, and we keep
        it only for as long as it is needed for the purposes above or as the law requires. No method of sending
        information over the internet is completely secure, so we cannot guarantee the security of anything you send
        us online.
      </p>
    ),
  },
  {
    id: "access",
    title: "Access, correction and complaints",
    body: (
      <>
        <p>
          You can ask to see the personal information we hold about you, ask us to correct it, or ask us to delete it.
          Contact us at <a href="mailto:info@furtadoproperty.com.au">info@furtadoproperty.com.au</a> or on{" "}
          <a href="tel:0418982517">0418 982 517</a>.
        </p>
        <p>
          If you have a concern about how we have handled your information, please tell us first so we can look into
          it. If you are not satisfied with our response, you can contact the Office of the Australian Information
          Commissioner at{" "}
          <a href="https://www.oaic.gov.au" target="_blank" rel="noopener noreferrer">
            oaic.gov.au
          </a>
          .
        </p>
      </>
    ),
  },
  {
    id: "disclaimer",
    title: "Disclaimer",
    body: (
      <>
        <p>
          The information on this website is a general guide only. It is not an offer or a contract, and it is not
          legal, financial or investment advice.
        </p>
        <ul>
          <li>
            <strong>Images and plans.</strong> Photographs, renders, floor plans and views are indicative. Some images
            are artist&rsquo;s impressions, and furniture, fittings and landscaping are shown for illustration.
          </li>
          <li>
            <strong>Details may change.</strong> Dimensions, areas, specifications, finishes, prices, availability,
            construction progress and completion dates are correct to the best of our knowledge when published and
            can change without notice.
          </li>
          <li>
            <strong>Make your own enquiries.</strong> Do not rely on this website when deciding to buy. Refer to the
            contract of sale and disclosure documents, and seek independent legal and financial advice.
          </li>
        </ul>
        <p>
          To the extent the law allows, Furtado Property is not liable for any loss arising from reliance on the
          information on this website. Nothing here excludes rights you have under the Australian Consumer Law. See
          also our <Link href="/terms">Terms</Link>.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    title: "Changes to this page",
    body: (
      <p>
        We may update this page from time to time. The current version is always the one published here, with the date
        it was last updated shown at the top.
      </p>
    ),
  },
];

export default function Page() {
  return (
    <LegalPage
      label="Privacy & Disclaimer"
      title="Privacy & Disclaimer"
      intro="How Furtado Property collects, uses and looks after your personal information, in line with the Privacy Act 1988 (Cth) and the Australian Privacy Principles, and the disclaimer that applies to what you read on this website."
      updated="1 October 2026"
      sections={sections}
      other={{ href: "/terms", label: "Read our Terms" }}
    />
  );
}
