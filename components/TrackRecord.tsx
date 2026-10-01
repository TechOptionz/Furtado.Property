import Link from "next/link";
import { communities, groups, homesIn, totals } from "@/lib/track-record";
import styles from "./TrackRecord.module.css";

// The communities Furtado Property has managed (lib/track-record.ts), as two handwritten sections that
// scripts/convert.mjs places into the generated pages and numbers the export's sections around:
//   TrackRecordSummary  /about, 04 of 06: four figure cards, a link to the full record and a ticker of the names
//   TrackRecordHome     /, 07 of 12: one figure, one sentence, and a strip in which each community is a block as wide
//                       as its share of the homes (a block names itself on hover)
// The full record, every community on a shared 2008–2024 time axis, is components/projects/TrackRecordSection.tsx
// on /projects (#track-record), which both of these link to.
// Motion is the shared vocabulary (lib/site.js, components/CountUp.tsx): data-reveal for entrances, data-reveal="rule"
// to draw each block from its left edge, data-count for figures. The ticker is a CSS animation.

const WORDS = [
  "Zero",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
  "Twenty",
];
const word = (n: number) => WORDS[n] ?? String(n);

// The summary's cards: each figure with the line that explains it.
const [complexes, villages] = groups;
const CARDS = [
  {
    label: "Communities managed",
    figure: totals.communities,
    detail: `${word(totals.complexes)} residential complexes and ${word(totals.villages).toLowerCase()} over-50s villages`,
  },
  {
    label: "Units and apartments",
    figure: totals.homes,
    detail: `${homesIn(complexes)} in residential complexes, ${homesIn(villages)} in over-50s villages`,
  },
  {
    label: "Suburbs and towns",
    figure: totals.locations,
    detail: "From Brisbane’s northside to Ipswich, Gympie and Toowoomba",
  },
  {
    label: "Years on site",
    figure: totals.to - totals.from,
    detail: `Managing day to day, from ${totals.from} to ${totals.to}`,
  },
];

export function TrackRecordSummary() {
  const ticker = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined}>
      {communities.map((c) => (
        <li key={c.name}>
          {c.name}
          <span>
            {c.homes} {c.unit}
          </span>
        </li>
      ))}
    </ul>
  );
  return (
    <section data-screen-label="Track record" className={styles.summary}>
      <div className={styles.container}>
        <div className={styles.summaryHead}>
          <div>
            <div data-reveal="text" className={styles.eyebrow}>
              <span>04 / 06</span>
              <span data-reveal="rule" />
              Track record
            </div>
            <h2 data-reveal="heading" data-delay="80" className={styles.heading}>
              {`${word(totals.communities)} communities managed across `}
              <span>South East Queensland.</span>
            </h2>
          </div>
          <div>
            <p data-reveal="text" data-delay="160" className={styles.lead}>
              From {totals.from} to {totals.to}, Furtado Property managed residential complexes and over-50s villages on
              site. That experience of how homes are lived in and looked after informs the ones we develop today.
            </p>
            <Link
              href="/projects#track-record"
              data-reveal="text"
              data-delay="240"
              data-press=""
              className={styles.more}
            >
              See the full track record<span>→</span>
            </Link>
          </div>
        </div>
        <dl className={styles.cards}>
          {CARDS.map((c, i) => (
            <div key={c.label} data-reveal="text" data-delay={i * 80} data-card="" className={styles.card}>
              <dt>{c.label}</dt>
              <dd data-count="">{c.figure}</dd>
              <dd>{c.detail}</dd>
            </div>
          ))}
        </dl>
      </div>
      {/* The names pass by twice over so the loop has no seam; the second copy is decoration only. */}
      <div data-reveal="text" data-delay="200" className={styles.ticker}>
        <div>
          {ticker(false)}
          {ticker(true)}
        </div>
      </div>
    </section>
  );
}

export function TrackRecordHome() {
  return (
    <section data-screen-label="Track record" className={styles.home}>
      <div className={styles.container}>
        <div className={styles.homeGrid}>
          <div>
            <div data-reveal="text" className={styles.eyebrow}>
              <span>07 / 11</span>
              <span data-reveal="rule" />
              Track record
            </div>
            <p data-reveal="text" data-delay="80" className={styles.numeral}>
              <span data-count="">{totals.homes}</span>
            </p>
            <p data-reveal="text" data-delay="160" className={styles.numeralNote}>
              homes managed across {word(totals.communities).toLowerCase()} communities
            </p>
          </div>
          <div>
            <h2 data-reveal="heading" className={styles.heading}>
              {`${word(totals.to - totals.from)} years managing the places people `}
              <span>call home.</span>
            </h2>
            <p data-reveal="text" data-delay="80" className={styles.lead}>
              From {totals.from} to {totals.to}, Furtado Property managed {word(totals.complexes).toLowerCase()}{" "}
              residential complexes and {word(totals.villages).toLowerCase()} over-50s villages across South East
              Queensland. That experience now shapes the homes we build.
            </p>
            <Link
              href="/projects#track-record"
              data-reveal="text"
              data-delay="160"
              data-press=""
              className={styles.more}
            >
              See the full track record<span>→</span>
            </Link>
          </div>
        </div>
        <div className={styles.share}>
          <div data-reveal="text" className={styles.shareHead}>
            {word(totals.communities)} communities, each sized by its homes
          </div>
          <ul className={styles.strip}>
            {groups.map((g, gi) =>
              g.communities.map((c) => (
                <li key={c.name} data-kind={gi} style={{ flexGrow: c.homes }}>
                  <span data-reveal="rule" data-delay={communities.indexOf(c) * 70} />
                  <span className={styles.tip}>
                    {c.name}
                    <b>
                      {c.homes} {c.unit}
                    </b>
                  </span>
                </li>
              )),
            )}
          </ul>
          <ul data-reveal="text" data-delay="300" className={styles.legend}>
            {groups.map((g, gi) => (
              <li key={g.title} data-kind={gi}>
                <i aria-hidden />
                {g.title}
                <span>
                  {g.communities.length} communities · {homesIn(g)} homes
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
