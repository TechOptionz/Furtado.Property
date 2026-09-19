// Handwritten: this page is no longer compiled from ../Contact.dc.html (see scripts/convert.mjs).
import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import ContactForm from "./ContactForm";
import styles from "./contact.module.css";

export const metadata: Metadata = {
  title: "Contact — Furtado Property",
  description:
    "Interested in one of our developments or want to learn more? Call 0418 982 517 or email info@furtadoproperty.com.au.",
};

const socials = [
  ["Instagram", "https://instagram.com/furtadoproperty"],
  ["Facebook", "https://facebook.com/furtadoproperty"],
  ["LinkedIn", "https://linkedin.com/company/furtadoproperty"],
];

export default function Page() {
  return (
    <main data-screen-label="Contact">
      {/* Hero. data-video-hero keeps the site header clear over the image until it has scrolled past (SiteHeader). */}
      <section data-screen-label="Hero" data-video-hero className={styles.hero}>
        <div className={styles.heroMedia}>
          <Image
            fill
            preload
            sizes="100vw"
            src="/uploads/front.jpg"
            alt="Mira Living seen from the street at dusk"
            className={styles.heroImg}
          />
        </div>
        <div className={styles.heroShade} />
        <div className={styles.heroInner}>
          <p className={`${styles.eyebrow} ${styles.onDark} hero-in`}>
            <span className={`${styles.eyebrowRule} hero-rule`} />
            Contact
          </p>
          <h1 className={styles.heroTitle}>
            <span className="hero-line">
              <span>Get in touch.</span>
            </span>
          </h1>
          <p className={`${styles.heroSecond} hero-in`} style={{ "--d": ".35s" } as CSSProperties}>
            We would love to hear from you.
          </p>
          <p className={`${styles.heroText} hero-in`} style={{ "--d": ".5s" } as CSSProperties}>
            Interested in one of our developments or want to learn more? Enquiries are answered within one business day.
          </p>
        </div>
      </section>

      {/* Direct contact, image and enquiry form as one composition */}
      <section data-screen-label="Enquiry" className={styles.main}>
        <div className={`${styles.container} ${styles.grid}`}>
          <div className={styles.info}>
            <p className={styles.eyebrow} data-reveal="text">
              <span className={styles.eyebrowRule} data-reveal="rule" />
              Speak with us
            </p>
            <h2 className={`${styles.heading} ${styles.maskLine}`}>
              <span data-reveal="text" data-delay="80">
                Let&rsquo;s start a conversation.
              </span>
            </h2>
            <div className={styles.details}>
              <div className={styles.item} data-reveal="text" data-delay="140">
                <span className={styles.rule} data-reveal="rule" data-delay="140" />
                <h3 className={styles.label}>Phone</h3>
                <p className={styles.value}>
                  <a href="tel:0418982517">0418 982 517</a>
                </p>
              </div>
              <div className={styles.item} data-reveal="text" data-delay="200">
                <span className={styles.rule} data-reveal="rule" data-delay="200" />
                <h3 className={styles.label}>Email</h3>
                <p className={`${styles.value} ${styles.email}`}>
                  <a href="mailto:info@furtadoproperty.com.au">info@furtadoproperty.com.au</a>
                </p>
              </div>
              <div className={styles.item} data-reveal="text" data-delay="260">
                <span className={styles.rule} data-reveal="rule" data-delay="260" />
                <h3 className={styles.label}>Region</h3>
                <p className={styles.value}>South East Queensland</p>
              </div>
              <div className={styles.item} data-reveal="text" data-delay="320">
                <span className={styles.rule} data-reveal="rule" data-delay="320" />
                <h3 className={styles.label}>Follow</h3>
                <ul className={styles.socials}>
                  {socials.map(([name, href]) => (
                    <li key={name}>
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Furtado Property on ${name} (opens in a new tab)`}
                      >
                        {name}
                        <span aria-hidden="true">↗</span>
                      </a>
                    </li>
                  ))}
                </ul>
                <p className={styles.handle}>@furtadoproperty</p>
              </div>
            </div>
            <figure className={styles.figure}>
              <div className={styles.frame}>
                <Image
                  fill
                  sizes="(min-width: 1440px) 500px, (min-width: 900px) 36vw, 92vw"
                  data-reveal="image"
                  data-delay="200"
                  src="/uploads/lobby.jpg"
                  alt="Mira Living entrance with signage"
                  className={styles.frameImg}
                />
                <figcaption className={styles.caption}>
                  <strong>Mira Living</strong>
                  <span>Bargara Esplanade, QLD</span>
                </figcaption>
              </div>
            </figure>
          </div>

          <div className={styles.panel} data-reveal="text" data-delay="260">
            <p className={styles.eyebrow}>
              <span className={styles.eyebrowRule} />
              Enquire
            </p>
            <h2 className={styles.heading}>Send an enquiry</h2>
            <p className={styles.lede}>
              Tell us what you are looking for and our team will be in touch within one business day.
            </p>
            <ContactForm />
          </div>
        </div>
      </section>

      {/* Closing band */}
      <section data-screen-label="Mira Living" className={styles.closing}>
        <div className={styles.closingMedia}>
          <Image
            fill
            sizes="(min-width: 900px) 50vw, 100vw"
            data-reveal="image"
            src="/uploads/mira-living-room-balcony-ocean-view.webp"
            alt="Mira Living apartment living room opening to a balcony with ocean views"
            className={styles.closingImg}
          />
        </div>
        <div className={styles.container}>
          <div className={styles.closingText}>
            <p className={`${styles.eyebrow} ${styles.onDark}`} data-reveal="text">
              <span className={styles.eyebrowRule} data-reveal="rule" />
              Building Dreams, Creating Homes
            </p>
            <h2 className={`${styles.closingTitle} ${styles.maskLine}`}>
              <span data-reveal="text" data-delay="80">
                Explore Mira Living.
              </span>
            </h2>
            <p className={styles.closingLede} data-reveal="text" data-delay="160">
              Discover twenty-five coastal residences in Bargara.
            </p>
            <div data-reveal="text" data-delay="240">
              <Link href="/projects/mira-living" className={styles.cta}>
                Discover Mira Living
                <span className={styles.arrow} aria-hidden="true">
                  →
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
