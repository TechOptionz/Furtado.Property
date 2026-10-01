import Image from "next/image";
import Link from "next/link";
import { UPCOMING_STAGES, upcomingDisclaimer, upcomingProjects } from "@/lib/projects";
import { photoProps } from "@/lib/photo";
import ui from "./ui.module.css";
import styles from "./UpcomingProjects.module.css";

// The pipeline: three level cards of equal height (a scroll-snap row to swipe or arrow through below 1024px), each
// with its image tagged as an indicative render and a four-step indicator of where the project stands.
export default function UpcomingProjects() {
  return (
    <section data-screen-label="Upcoming projects" aria-labelledby="upcoming-title" className={styles.section}>
      <div className={ui.container}>
        <div data-reveal="text" className={ui.rule}>
          <p className={ui.label}>In the pipeline</p>
        </div>
        <div className={`${ui.grid} ${styles.intro}`}>
          <h2 id="upcoming-title" data-reveal="heading" className={ui.title}>
            New releases are announced here first.
          </h2>
          <div>
            <p data-reveal="text" data-delay="80" className={ui.body}>
              Three developments are moving through site selection, design and planning. Register your interest to hear
              about them before they are released.
            </p>
            <Link href="/contact" data-reveal="text" data-delay="160" data-press="" className={ui.button}>
              Register interest
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>

        {/* Focusable so the row can be scrolled with the arrow keys where it overflows. */}
        <div role="region" aria-label="Upcoming projects" tabIndex={0} className={styles.scroller}>
          <ul className={styles.cards}>
            {upcomingProjects.map((project, i) => {
              const image = photoProps(project.image);
              const current = UPCOMING_STAGES.indexOf(project.stage);
              return (
                <li key={project.name} data-reveal="text" data-delay={i * 100}>
                  <article>
                    <div className={styles.image}>
                      <Image
                        {...image}
                        alt={image.alt}
                        sizes="(max-width: 639px) 80vw, (max-width: 1023px) 46vw, (max-width: 1440px) 30vw, 410px"
                        placeholder="blur"
                      />
                      <span>Indicative render</span>
                    </div>
                    <h3>{project.name}</h3>
                    <p className={styles.meta}>
                      <span className={ui.srOnly}>Type: </span>
                      {project.type}
                      <span aria-hidden> · </span>
                      <span className={ui.srOnly}>. Location: </span>
                      {project.location}
                    </p>
                    <p className={styles.description}>{project.description}</p>
                    <ol className={styles.stages} aria-label={`${project.name} stage`}>
                      {UPCOMING_STAGES.map((stage, s) => (
                        <li
                          key={stage}
                          data-state={s < current ? "done" : s === current ? "current" : "next"}
                          aria-current={s === current ? "step" : undefined}
                        >
                          {stage}
                          {s < current && <span className={ui.srOnly}> (complete)</span>}
                          {s === current && <span className={ui.srOnly}> (current stage)</span>}
                        </li>
                      ))}
                    </ol>
                  </article>
                </li>
              );
            })}
          </ul>
        </div>
        <p data-reveal="text" className={styles.finePrint}>
          {upcomingDisclaimer}
        </p>
      </div>
    </section>
  );
}
