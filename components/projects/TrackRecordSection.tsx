import type { CSSProperties } from "react";
import { groups, homesIn, totals } from "@/lib/projects";
import ui from "./ui.module.css";
import styles from "./TrackRecordSection.module.css";

// The full track record on /projects (the summary on /about and the strip on the home page stay in
// components/TrackRecord.tsx, and link here by #track-record). Underneath it is a plain table, one row per community
// with every fact as text; the Gantt bars on the shared 2008–2024 axis are decoration laid over it and hidden from
// assistive technology. The roles are spelled out because the rows are laid out with CSS grid, which some browsers
// take as a reason to drop table semantics. On phones each row stacks, with a small bar under the name.

const WORDS = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve"];
const word = (n: number) => WORDS[n] ?? String(n);

const FIGURES = [
  { figure: totals.communities, label: "Communities" },
  { figure: totals.homes, label: "Homes" },
  { figure: totals.villages, label: "Over-50s villages" },
  { figure: totals.locations, label: "Suburbs and towns" },
];

// Shared time axis: a tick every four years, positions as a fraction of the span.
const SPAN = totals.to - totals.from;
const TICKS = Array.from({ length: Math.floor(SPAN / 4) + 1 }, (_, i) => totals.from + i * 4);
const at = (year: number) => (year - totals.from) / SPAN;

export default function TrackRecordSection() {
  return (
    <section
      id="track-record"
      data-screen-label="Track record"
      aria-labelledby="track-record-title"
      className={`${ui.dark} ${styles.band}`}
    >
      <div className={ui.container}>
        <div data-reveal="text" className={ui.rule}>
          <p className={ui.label}>Track record</p>
          <p className={ui.label}>
            {totals.from} – {totals.to}
          </p>
        </div>
        <div className={`${ui.grid} ${styles.intro}`}>
          <h2 id="track-record-title" data-reveal="heading" className={ui.title}>
            {word(totals.communities)} communities and {totals.homes} homes, managed on site.
          </h2>
          <p data-reveal="text" data-delay="80" className={ui.body}>
            From {totals.from} to {totals.to}, Furtado Property managed {word(totals.complexes).toLowerCase()}{" "}
            residential complexes and {word(totals.villages).toLowerCase()} over-50s villages across South East
            Queensland. Each has since been sold to a new operator.
          </p>
        </div>

        <dl className={styles.figures}>
          {FIGURES.map((f, i) => (
            <div key={f.label} data-reveal="text" data-delay={i * 80}>
              <dt>{f.label}</dt>
              <dd data-count="">{f.figure}</dd>
            </div>
          ))}
        </dl>

        <table role="table" className={styles.table}>
          <caption className={ui.srOnly}>
            Communities managed by Furtado Property, {totals.from} to {totals.to}
          </caption>
          <thead role="rowgroup">
            <tr role="row">
              <th role="columnheader" scope="col">
                Community
              </th>
              <th role="columnheader" scope="col" className={styles.axis}>
                <span className={ui.srOnly}>Years under management</span>
                <span aria-hidden className={styles.ticks}>
                  {TICKS.map((y) => (
                    <span key={y} style={{ "--at": at(y) } as CSSProperties}>
                      {y}
                    </span>
                  ))}
                </span>
              </th>
              <th role="columnheader" scope="col">
                Homes
              </th>
              <th role="columnheader" scope="col">
                Outcome
              </th>
            </tr>
          </thead>
          {groups.map((g) => (
            <tbody key={g.title} role="rowgroup">
              <tr role="row" data-reveal="text" className={styles.group}>
                <th role="columnheader" scope="rowgroup" colSpan={4}>
                  {g.title}{" "}
                  <span>
                    <span className={ui.srOnly}>(</span>
                    {g.communities.length} · {homesIn(g)} homes
                    <span className={ui.srOnly}>)</span>
                  </span>
                </th>
              </tr>
              {g.communities.map((c, i) => (
                <tr key={c.name} role="row" tabIndex={0} data-reveal="text" data-delay={Math.min(i, 5) * 60}>
                  <th role="rowheader" scope="row" className={styles.name}>
                    {c.name}
                    <span>{c.street ? `${c.street}, ${c.suburb}` : c.suburb}</span>
                  </th>
                  <td
                    role="cell"
                    className={styles.years}
                    style={{ "--from": at(c.from), "--to": at(c.to) } as CSSProperties}
                  >
                    <span aria-hidden className={styles.track}>
                      <span data-reveal="rule" data-delay={Math.min(i, 5) * 60 + 200} />
                    </span>
                    <span className={styles.period}>
                      {c.from}–{c.to}
                    </span>
                  </td>
                  <td role="cell" className={styles.homes}>
                    <b data-count="">{c.homes}</b> {c.unit}
                  </td>
                  <td role="cell" className={styles.sold}>
                    Sold to {c.soldTo}
                  </td>
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      </div>
    </section>
  );
}
