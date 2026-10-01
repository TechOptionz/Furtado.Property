import type { CSSProperties } from "react";
import Image from "next/image";
import { hero } from "@/lib/projects";
import { photoProps } from "@/lib/photo";
import ui from "./ui.module.css";
import styles from "./ProjectsHero.module.css";

// The page's opening: the Bargara aerial edge to edge and a full screen tall, the headline over it, then the four
// figures on the page colour. data-video-hero keeps the site header clear over the photograph until it has scrolled
// past (SiteHeader). The photograph is the largest thing on screen at load, so it is preloaded and never hidden; it
// drifts and the words lift away as the hero scrolls out (CSS scroll timelines, where the browser has them), and the
// words rise in with a CSS animation that needs no JavaScript. Whole-number figures count up once (CountUp).
const delay = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

export default function ProjectsHero() {
  const image = photoProps(hero.image);
  return (
    <>
      <section data-screen-label="Hero" data-video-hero className={`${ui.dark} ${styles.hero}`}>
        <div className={styles.media}>
          <Image
            src={image.src}
            alt={image.alt}
            fill
            preload
            fetchPriority="high"
            sizes="100vw"
            placeholder="blur"
            blurDataURL={image.blurDataURL}
          />
        </div>
        <div className={`${ui.container} ${styles.content}`}>
          <p className={`${ui.label} ${styles.in}`}>Our projects</p>
          <h1 className={`${styles.headline} ${styles.in}`} style={delay(80)}>
            Creating homes designed for longevity across South East Queensland.
          </h1>
          <div className={`${styles.foot} ${styles.in}`} style={delay(180)}>
            <p className={ui.body}>{hero.lead}</p>
            <a href="#mira-living" className={styles.cue}>
              Scroll
              <span aria-hidden />
            </a>
          </div>
        </div>
      </section>
      <div className={ui.container}>
        <dl className={styles.stats}>
          {hero.stats.map((stat, i) => (
            <div key={stat.label} data-reveal="text" data-delay={i * 80}>
              <dt>{stat.label}</dt>
              <dd data-count={stat.count ? "" : undefined}>{stat.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </>
  );
}
