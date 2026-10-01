import Image from "next/image";
import type { PhotoProps } from "@/lib/photo";
import { LightboxTrigger } from "./Lightbox";
import ui from "./ui.module.css";
import styles from "./MiraLiving.module.css";

// The gallery under Mira Living: four photographs in two even rows (wide beside narrow, then narrow beside wide),
// and a scroll-snap row to swipe through on phones. Every photograph opens the lightbox at its own place, with its
// alt text as the caption.
const SIZES = [
  "(max-width: 639px) 82vw, (max-width: 1023px) 45vw, (max-width: 1440px) 55vw, 750px",
  "(max-width: 639px) 82vw, (max-width: 1023px) 45vw, (max-width: 1440px) 40vw, 530px",
  "(max-width: 639px) 82vw, (max-width: 1023px) 45vw, (max-width: 1440px) 40vw, 530px",
  "(max-width: 639px) 82vw, (max-width: 1023px) 45vw, (max-width: 1440px) 55vw, 750px",
];

export default function Gallery({ name, photos }: { name: string; photos: PhotoProps[] }) {
  return (
    <div className={styles.gallery}>
      <div data-reveal="text" className={ui.rule}>
        <h3 className={ui.label}>Gallery</h3>
        <p className={styles.updated}>Select an image to enlarge</p>
      </div>
      <ul className={styles.photos} aria-label={`${name} gallery`}>
        {photos.map((photo, i) => (
          <li key={photo.src}>
            <figure>
              <LightboxTrigger index={i} label={photo.alt}>
                <Image
                  {...photo}
                  alt={photo.alt}
                  data-reveal="mask"
                  data-delay={(i % 2) * 80}
                  sizes={SIZES[i % SIZES.length]}
                  placeholder="blur"
                />
              </LightboxTrigger>
              <figcaption>{photo.alt}</figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </div>
  );
}
