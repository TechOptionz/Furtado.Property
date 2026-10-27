import Image from "next/image";
import Link from "next/link";
import { UPCOMING_STAGES, upcomingDisclaimer, upcomingProjects, type Spec, type UpcomingProject } from "@/lib/projects";
import { photoProps } from "@/lib/photo";
import ui from "./ui.module.css";
import styles from "./UpcomingProjects.module.css";

// The pipeline: each upcoming project as a numbered, ruled entry. The renders fill the left seven columns (the lead
// opening with a mask, the supporting views beneath it); the name, the headline figures, the team and a four-step
// stage track hold the right four and stay put while the renders scroll past. A project without renders yet shows a
// reserved panel in their place. Everything it says comes from lib/projects.ts.

const WORDS = ["No", "One", "Two", "Three", "Four", "Five", "Six"];

function Figures({ items, name }: { items: Spec[]; name: string }) {
  if (!items.length) return null;
  return (
    <dl data-reveal="text" data-delay="120" className={styles.figures} aria-label={`${name} at a glance`}>
      {items.map((f) => (
        <div key={f.label}>
          <dd>{f.value}</dd>
          <dt>{f.label}</dt>
        </div>
      ))}
    </dl>
  );
}

function Team({ items }: { items: Spec[] }) {
  if (!items.length) return null;
  return (
    <div data-reveal="text" data-delay="180" className={styles.team}>
      <h4 className={ui.label}>The team</h4>
      <dl>
        {items.map((t) => (
          <div key={t.label}>
            <dt>{t.label}</dt>
            <dd>{t.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function Stages({ project }: { project: UpcomingProject }) {
  const current = UPCOMING_STAGES.indexOf(project.stage);
  return (
    <div data-reveal="text" data-delay="240" className={styles.progress}>
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
      {project.stageNote && <p className={styles.stageNote}>{project.stageNote}</p>}
    </div>
  );
}

function Media({ project }: { project: UpcomingProject }) {
  if (!project.lead) {
    return (
      <div data-reveal="text" className={styles.reserved} aria-hidden>
        <span className={styles.reservedNumber}>{project.number}</span>
        <p>
          <span>Renders to follow</span>
          Details to be announced
        </p>
      </div>
    );
  }
  const lead = photoProps(project.lead);
  const details = project.details.map(photoProps);
  return (
    <>
      <figure className={styles.lead}>
        <div data-reveal="mask">
          <Image
            {...lead}
            alt={lead.alt}
            sizes="(max-width: 1023px) 100vw, (max-width: 1440px) 58vw, 800px"
            placeholder="blur"
          />
        </div>
        <figcaption>Indicative render</figcaption>
      </figure>
      {details.length > 0 && (
        <ul className={styles.details} aria-label={`${project.name} views`}>
          {details.map((d, i) => (
            <li key={d.src}>
              <div data-reveal="image" data-delay={160 + i * 120}>
                <Image
                  {...d}
                  alt={d.alt}
                  sizes="(max-width: 1023px) 50vw, (max-width: 1440px) 28vw, 390px"
                  placeholder="blur"
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export default function UpcomingProjects() {
  const count = upcomingProjects.length;
  const countWord = WORDS[count] ?? String(count);
  return (
    <section data-screen-label="Upcoming projects" aria-labelledby="upcoming-title" className={styles.section}>
      <div className={ui.container}>
        <div data-reveal="text" className={ui.rule}>
          <p className={ui.label}>In the pipeline</p>
          <p className={ui.label}>
            {countWord} {count === 1 ? "development" : "developments"} · Brisbane
          </p>
        </div>
        <div className={`${ui.grid} ${styles.intro}`}>
          <h2 id="upcoming-title" data-reveal="heading" className={ui.title}>
            New releases are announced here first.
          </h2>
          <div>
            <p data-reveal="text" data-delay="80" className={ui.body}>
              {countWord} Brisbane developments are moving through design and planning. Register your interest to hear
              about them before they are released.
            </p>
            <Link href="/contact" data-reveal="text" data-delay="160" data-press="" className={ui.button}>
              Register interest
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>

        <ol className={styles.entries}>
          {upcomingProjects.map((project) => (
            <li key={project.name} className={styles.entry}>
              <article aria-labelledby={`upcoming-${project.number}`} className={`${ui.grid} ${styles.layout}`}>
                <div className={styles.media}>
                  <Media project={project} />
                </div>
                <div className={styles.text}>
                  <p data-reveal="text" className={styles.number} aria-hidden>
                    {project.number}
                  </p>
                  <h3 id={`upcoming-${project.number}`} data-reveal="heading" className={styles.name}>
                    {project.name}
                  </h3>
                  <p data-reveal="text" data-delay="60" className={styles.meta}>
                    <span className={ui.srOnly}>Type: </span>
                    {project.type}
                    <span aria-hidden> · </span>
                    <span className={ui.srOnly}>. Location: </span>
                    {project.location}
                  </p>
                  <p data-reveal="text" data-delay="90" className={styles.description}>
                    {project.description}
                  </p>
                  <Figures items={project.figures} name={project.name} />
                  <Team items={project.team} />
                  <Stages project={project} />
                  <Link
                    href="/contact"
                    data-reveal="text"
                    data-delay="300"
                    className={`${ui.link} ${styles.register}`}
                  >
                    Register interest in {project.name}
                    <span aria-hidden>→</span>
                  </Link>
                </div>
              </article>
            </li>
          ))}
        </ol>

        <p data-reveal="text" className={styles.finePrint}>
          {upcomingDisclaimer}
        </p>
      </div>
    </section>
  );
}
