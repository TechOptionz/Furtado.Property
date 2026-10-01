// Shared layout of the legal pages (/privacy, /terms): a title block, a contents list that stays in view on wide
// screens, and the numbered sections. Handwritten, not part of the design export.
import type { ReactNode } from "react";
import Link from "next/link";
import styles from "./legal.module.css";

export type LegalSection = { id: string; title: string; body: ReactNode };

export default function LegalPage({
  label,
  title,
  intro,
  updated,
  sections,
  other,
}: {
  label: string;
  title: string;
  intro: string;
  updated: string;
  sections: LegalSection[];
  other: { href: string; label: string };
}) {
  return (
    <main data-screen-label={label} className={styles.page}>
      <div className={styles.container}>
        <header className={styles.head}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowRule} />
            Legal
          </p>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.intro}>{intro}</p>
          <p className={styles.updated}>Last updated {updated}</p>
        </header>

        <div className={styles.layout}>
          <nav aria-label="On this page" className={styles.contents}>
            <h2 className={styles.contentsLabel}>On this page</h2>
            <ol>
              {sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`}>{s.title}</a>
                </li>
              ))}
            </ol>
            <Link href={other.href} className={styles.other}>
              {other.label}
              <span aria-hidden="true">→</span>
            </Link>
          </nav>

          <div className={styles.body}>
            {sections.map((s, i) => (
              <section key={s.id} id={s.id} className={styles.section}>
                <h2 className={styles.heading}>
                  <span className={styles.num}>{String(i + 1).padStart(2, "0")}</span>
                  {s.title}
                </h2>
                {s.body}
              </section>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
