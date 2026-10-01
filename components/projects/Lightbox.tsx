"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { KeyboardEvent, MouseEvent, ReactNode } from "react";
import Image from "next/image";
import type { PhotoProps } from "@/lib/photo";
import styles from "./Lightbox.module.css";

// The gallery's enlarged view. A native <dialog> opened with showModal(): the browser keeps focus inside it, closes
// it on Escape and hands focus back to the photograph that opened it. Left and right arrows (and Home / End) move
// between photographs; each caption is the photograph's alt text.
const OpenLightbox = createContext<(index: number) => void>(() => {});

export function LightboxProvider({
  photos,
  label,
  children,
}: {
  photos: PhotoProps[];
  label: string;
  children: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState(0);
  // The large photograph is only mounted (and fetched) once the lightbox has been opened.
  const [used, setUsed] = useState(false);

  const open = useCallback((i: number) => {
    setIndex(i);
    setUsed(true);
    dialog.current?.showModal();
    document.documentElement.style.overflow = "hidden";
  }, []);
  const step = (by: number) => setIndex((i) => (i + by + photos.length) % photos.length);

  useEffect(() => {
    const el = dialog.current;
    const release = () => {
      document.documentElement.style.overflow = "";
    };
    el?.addEventListener("close", release);
    return () => {
      el?.removeEventListener("close", release);
      release();
    };
  }, []);

  const onKeyDown = (e: KeyboardEvent) => {
    const keys: Record<string, number> = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: photos.length - 1 };
    const to = keys[e.key];
    if (to === undefined) return;
    e.preventDefault();
    setIndex((to + photos.length) % photos.length);
  };
  // A click on the dark surround (anything that is not the photograph or a control) closes.
  const onClick = (e: MouseEvent) => {
    if ((e.target as HTMLElement).hasAttribute("data-surround")) dialog.current?.close();
  };

  const photo = photos[index];
  return (
    <OpenLightbox.Provider value={open}>
      {children}
      <dialog ref={dialog} className={styles.dialog} aria-label={label} onKeyDown={onKeyDown} onClick={onClick}>
        <div className={styles.bar}>
          <p className={styles.count}>
            {index + 1} / {photos.length}
          </p>
          <button type="button" className={styles.close} onClick={() => dialog.current?.close()}>
            Close
          </button>
        </div>
        <div className={styles.stage} data-surround="">
          <button type="button" className={styles.nav} aria-label="Previous image" onClick={() => step(-1)}>
            <span aria-hidden>←</span>
          </button>
          <figure className={styles.figure} data-surround="">
            <div
              className={styles.frame}
              style={{ aspectRatio: `${photo.width} / ${photo.height}`, "--ratio": photo.width / photo.height } as React.CSSProperties}
            >
              {used && (
                <Image
                  key={photo.src}
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="100vw"
                  placeholder="blur"
                  blurDataURL={photo.blurDataURL}
                />
              )}
            </div>
            <figcaption className={styles.caption} aria-live="polite">
              {photo.alt}
            </figcaption>
          </figure>
          <button type="button" className={styles.nav} aria-label="Next image" onClick={() => step(1)}>
            <span aria-hidden>→</span>
          </button>
        </div>
      </dialog>
    </OpenLightbox.Provider>
  );
}

// A photograph that opens the lightbox at its place in the gallery.
export function LightboxTrigger({
  index,
  label,
  className,
  children,
}: {
  index: number;
  label: string;
  className?: string;
  children: ReactNode;
}) {
  const open = useContext(OpenLightbox);
  return (
    <button
      type="button"
      className={`${styles.trigger} ${className ?? ""}`}
      aria-haspopup="dialog"
      aria-label={`Enlarge image: ${label}`}
      onClick={() => open(index)}
    >
      {children}
    </button>
  );
}
