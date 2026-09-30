import type { CSSProperties } from "react";
import Link from "next/link";
import { communities, groups, homesIn, totals } from "@/lib/track-record";
import styles from "./TrackRecord.module.css";

// The communities Furtado Property has managed (lib/track-record.ts), as two handwritten sections that
// scripts/convert.mjs places into the generated pages and numbers the export's sections around:
//   TrackRecord         /projects, 04 of 05: figures, then every community on a shared 2008–2024 time axis
//   TrackRecordSummary  /about, 04 of 06: the figures, a link to the full record and a ticker of the names
// Motion is the shared vocabulary (lib/site.js, components/CountUp.tsx): data-reveal for entrances, data-reveal="rule"
// to draw each bar from its start year, data-count for figures. The ticker is a CSS animation.

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
];
const word = (n: number) => WORDS[n] ?? String(n);

const STATS = [
  { figure: totals.communities, label: "Communities managed" },
  { figure: totals.homes, label: "Units and apartments" },
  { figure: totals.villages, label: "Over-50s villages" },
  { figure: totals.locations, label: "Suburbs and towns" },
];

function Stats() {
  return (
    <dl className={styles.stats}>
      {STATS.map((s, i) => (
        <div key={s.label} data-reveal="text" data-delay={i * 80} className={styles.stat}>
          <dt>{s.label}</dt>
          <dd data-count="">{s.figure}</dd>
        </div>
      ))}
    </dl>
  );
}

// Time axis shared by every row: a tick every four years.
const SPAN = totals.to - totals.from;
const TICKS = Array.from({ length: Math.floor(SPAN / 4) + 1 }, (_, i) => totals.from + i * 4);
const at = (year: number) => `${((year - totals.from) / SPAN) * 100}%`;

export default function TrackRecord() {
  return (
    <section
      id="track-record"
      data-screen-label="Track record"
      className={styles.band}
      style={{ "--tick": at(TICKS[1]) } as CSSProperties}
    >
      <div className={styles.container}>
        <div data-reveal="text" className={styles.bar}>
          <span>04 / 05 · Track record</span>
          <span>
            {totals.from} — {totals.to}
          </span>
        </div>
        <div className={styles.intro}>
          <div>
            <h2 data-reveal="heading" className={styles.heading}>
              {`${word(totals.communities)} communities and `}
              <span>{totals.homes} homes</span>, managed on site.
            </h2>
            <p data-reveal="text" data-delay="80" className={styles.lead}>
              From {totals.from} to {totals.to}, Furtado Property managed {word(totals.complexes).toLowerCase()}{" "}
              residential complexes and {word(totals.villages).toLowerCase()} over-50s villages across South East
              Queensland, from Brisbane’s northside to Ipswich, Gympie and Toowoomba. Each has since been sold to a new
              operator.
            </p>
          </div>
          <Stats />
        </div>
        {groups.map((g, gi) => {
          // Rows are numbered straight through both groups.
          const before = groups.slice(0, gi).reduce((n, earlier) => n + earlier.communities.length, 0);
          return (
            <div key={g.title} className={styles.group}>
              <div data-reveal="text" className={styles.groupHead}>
                <h3>{g.title}</h3>
                <span>
                  <b data-count="">{g.communities.length}</b> {g.communities.length === 1 ? g.singular : g.plural}
                  {" · "}
                  <b data-count="">{homesIn(g)}</b> homes
                </span>
              </div>
              <div className={`${styles.row} ${styles.axis}`} aria-hidden>
                <span className={styles.axisNote}>Years under management</span>
                <span className={styles.ticks}>
                  {TICKS.map((y) => (
                    <span key={y} style={{ left: at(y) }}>
                      {y}
                    </span>
                  ))}
                </span>
              </div>
              <ol className={styles.rows} start={before + 1}>
                {g.communities.map((c, i) => (
                  <li key={c.name} data-reveal="text" data-delay={Math.min(i, 5) * 60} className={styles.row}>
                    <div className={styles.name}>
                      <span className={styles.no}>{String(before + i + 1).padStart(2, "0")}</span>
                      <div>
                        <h4>{c.name}</h4>
                        <p>{c.street ? `${c.street}, ${c.suburb}` : c.suburb}</p>
                      </div>
                    </div>
                    <div className={styles.track} aria-hidden>
                      <span
                        data-reveal="rule"
                        data-delay={Math.min(i, 5) * 60 + 200}
                        style={{ left: at(c.from), width: `calc(${at(c.to)} - ${at(c.from)})` }}
                      />
                    </div>
                    <div className={styles.period}>
                      <span>
                        {c.from} – {c.to}
                      </span>
                      <span>Sold to {c.soldTo}</span>
                    </div>
                    <div className={styles.homes}>
                      <b data-count="">{c.homes}</b> {c.unit}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          );
        })}
      </div>
    </section>
  );
}

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
      <div className={`${styles.container} ${styles.summaryGrid}`}>
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
          <p data-reveal="text" data-delay="160" className={styles.lead}>
            From {totals.from} to {totals.to}, Furtado Property managed residential complexes and over-50s villages on
            site, from Brisbane’s northside to Gympie and Toowoomba: {totals.homes} homes in all. That experience of how
            homes are lived in and looked after informs the ones we develop today.
          </p>
          <Link href="/projects#track-record" data-reveal="text" data-delay="240" data-press="" className={styles.more}>
            See the full track record<span>→</span>
          </Link>
        </div>
        <Stats />
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
