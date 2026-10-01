import Image from "next/image";
import Link from "next/link";
import { miraLiving, type Spec } from "@/lib/projects";
import { photoProps } from "@/lib/photo";
import ConstructionProgress from "./ConstructionProgress";
import Gallery from "./Gallery";
import { LightboxProvider } from "./Lightbox";
import ui from "./ui.module.css";
import styles from "./MiraLiving.module.css";

// Mira Living, the development now selling and the page's commercial priority: the name in display type, a pinned
// scroll scene (photograph on the left, the words, the residences and the team scrolling past on the right), the
// construction track and the gallery. Everything it says comes from lib/projects.ts.

function Credits({ title, items }: { title: string; items: Spec[] }) {
  return (
    <div data-reveal="text" className={styles.credits}>
      <h3 className={ui.label}>{title}</h3>
      <dl>
        {items.map((item) => (
          <div key={item.label}>
            <dt>{item.label}</dt>
            <dd>{item.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

// What the pinned photograph shows beside each step: the front elevation, the living room, the kitchen.
const SCENE = [0, 1, 3];

export default function MiraLiving() {
  const m = miraLiving;
  const photos = m.gallery.map(photoProps);
  return (
    <section
      id="mira-living"
      data-screen-label="Mira Living"
      aria-labelledby="mira-living-title"
      className={styles.section}
    >
      <LightboxProvider photos={photos} label={`${m.name} gallery`}>
        <div className={ui.container}>
          <div data-reveal="text" className={ui.rule}>
            <p className={ui.label}>
              {m.salesStatus} · {m.location}
            </p>
            <p className={ui.label}>Completion {m.completion}</p>
          </div>
          <div className={styles.nameClip}>
            <h2 id="mira-living-title" data-reveal="heading" className={styles.name}>
              {m.name}
            </h2>
          </div>

          {/* A scroll scene (lib/site.js): the photograph stays pinned while the three steps scroll past it, and
              changes with the step crossing the middle of the screen. Below 1024px it simply stacks. */}
          <div data-scene="" data-dim="0.28" className={`${ui.grid} ${styles.scene}`}>
            <div className={styles.stage}>
              <div data-reveal="mask" className={styles.frame}>
                {SCENE.map((index, i) => (
                  <Image
                    key={photos[index].src}
                    data-scene-img={i}
                    src={photos[index].src}
                    alt={photos[index].alt}
                    fill
                    sizes="(max-width: 1023px) 100vw, (max-width: 1440px) 58vw, 800px"
                    placeholder="blur"
                    blurDataURL={photos[index].blurDataURL}
                  />
                ))}
              </div>
              <div aria-hidden className={styles.meter}>
                <span data-scene-bar="" />
              </div>
            </div>
            <div className={styles.steps}>
              <div data-scene-item="" className={styles.step}>
                <p data-reveal="text" className={styles.lede}>
                  {m.description}
                </p>
                <div data-reveal="text" data-delay="80" className={styles.actions}>
                  <Link href={m.href} className={ui.button} data-press="">
                    Discover {m.name}
                    <span aria-hidden>→</span>
                  </Link>
                  <Link href="/contact" className={ui.ghost} data-press="">
                    Request the brochure
                  </Link>
                </div>
                <p data-reveal="text" data-delay="160" className={styles.availability}>
                  {m.availabilityNote}
                </p>
              </div>
              <div data-scene-item="" className={styles.step}>
                <Credits title="The residences" items={m.specs} />
              </div>
              <div data-scene-item="" className={styles.step}>
                <Credits title="The team" items={m.team} />
              </div>
            </div>
          </div>

          <ConstructionProgress stages={m.stages} lastUpdated={m.lastUpdated} />
          <Gallery name={m.name} photos={photos} />
        </div>
      </LightboxProvider>
    </section>
  );
}
