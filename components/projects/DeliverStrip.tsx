import Link from "next/link";
import { deliverySteps } from "@/lib/projects";
import ui from "./ui.module.css";
import styles from "./DeliverStrip.module.css";

// "How we deliver", condensed into two columns: the heading and the link to /about on the left, the four steps as
// a ruled list on the right (number, name, one line), each rule drawing in as it arrives.
export default function DeliverStrip() {
  return (
    <section data-screen-label="How we deliver" aria-labelledby="deliver-title" className={styles.section}>
      <div className={`${ui.container} ${ui.grid} ${styles.layout}`}>
        <div className={styles.intro}>
          <p data-reveal="text" className={ui.label}>
            How we deliver
          </p>
          <h2 id="deliver-title" data-reveal="heading" className={styles.heading}>
            Involved from site selection through to final delivery.
          </h2>
          <Link href="/about" data-reveal="text" data-delay="120" className={ui.link}>
            How we work
            <span aria-hidden>→</span>
          </Link>
        </div>
        <ol className={styles.steps}>
          {deliverySteps.map((step, i) => (
            <li key={step.name} data-reveal="text" data-delay={i * 90}>
              <span aria-hidden data-reveal="rule" data-delay={120 + i * 90} className={styles.line} />
              <span aria-hidden className={styles.number}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3>{step.name}</h3>
              <p>{step.line}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
