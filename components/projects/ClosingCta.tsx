import Image from "next/image";
import Link from "next/link";
import { closing } from "@/lib/projects";
import { photoProps } from "@/lib/photo";
import ui from "./ui.module.css";
import styles from "./ClosingCta.module.css";

// The page's close: the question in large type over the pool photograph, edge to edge. The overlay is a flat 74%
// of #121a17, which keeps the cream type above 4.5:1 even where the photograph underneath is white.
export default function ClosingCta() {
  const image = photoProps(closing.image);
  return (
    <section data-screen-label="CTA" aria-labelledby="closing-title" className={`${ui.dark} ${styles.cta}`}>
      <Image
        src={image.src}
        alt=""
        fill
        sizes="100vw"
        placeholder="blur"
        blurDataURL={image.blurDataURL}
        className={styles.image}
      />
      <div className={`${ui.container} ${styles.content}`}>
        <p data-reveal="text" className={ui.label}>
          Enquire
        </p>
        <h2 id="closing-title" data-reveal="heading" className={styles.heading}>
          Interested in one of our developments?
        </h2>
        <div data-reveal="text" data-delay="120" className={styles.actions}>
          <Link href="/contact" className={ui.button} data-press="">
            Enquire now
            <span aria-hidden>→</span>
          </Link>
          <a href={closing.phone.href} className={styles.phone}>
            <span className={ui.srOnly}>Call </span>
            {closing.phone.label}
          </a>
        </div>
      </div>
    </section>
  );
}
