"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";

const cover: CSSProperties = { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" };

const pill: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "10px",
  borderRadius: "999px",
  border: "1px solid rgba(255,255,255,.2)",
  background: "rgba(32,35,31,.55)",
  color: "#FCFAF6",
};

// The Mira Living film in the hero's photo card. A muted 20-second highlight loop (public/video/mira-loop-*.mp4,
// cut from the full film) plays silently in the card once the page has loaded and the card is on screen; it fades in
// over the poster (the loop's first frame) and pauses whenever the card leaves the screen. The button on the card
// opens the full film with sound (public/video/mira-film-*.mp4, 1:19) in a dialog with the browser's own controls.
// Like the other films, the silent loop is skipped under prefers-reduced-motion and for data-saving visitors, who
// keep the poster; the full film is only ever fetched when a visitor asks for it.
const LOOP = { phone: "/video/mira-loop-540.mp4", wide: "/video/mira-loop-900.mp4" };
const FILM = { phone: "/video/mira-film-720.mp4", wide: "/video/mira-film-1080.mp4" };
const phone = () => matchMedia("(max-width: 900px)").matches;

export default function MiraFilm() {
  const loopRef = useRef<HTMLVideoElement>(null);
  const filmRef = useRef<HTMLVideoElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  // Set up by the effect below; closeFilm uses it so the loop only resumes while the card is on screen.
  const resume = useRef<() => void>(() => {});
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const v = loopRef.current;
    if (!v) return;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || conn?.saveData || /2g/.test(conn?.effectiveType || ""))
      return;
    let visible = false;
    let loaded = false;
    let ready = false;
    const play = () => {
      if (ready && visible && loaded && !dialogRef.current?.open) v.play().catch(() => {});
    };
    resume.current = play;
    const load = () => {
      if (loaded) return;
      loaded = true;
      v.src = phone() ? LOOP.phone : LOOP.wide;
      v.addEventListener("playing", () => setShown(true), { once: true });
      play();
    };
    // The loop must not compete with the page's own images, so it waits for the load event.
    let idle = 0;
    const onLoad = () => {
      ready = true;
      idle = window.setTimeout(load, 200);
    };
    if (document.readyState === "complete") onLoad();
    else addEventListener("load", onLoad, { once: true });
    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        if (visible) play();
        else v.pause();
      },
      { threshold: 0.2 },
    );
    io.observe(v.parentElement!);
    return () => {
      io.disconnect();
      clearTimeout(idle);
      removeEventListener("load", onLoad);
      resume.current = () => {};
    };
  }, []);

  const openFilm = () => {
    const d = dialogRef.current;
    const f = filmRef.current;
    if (!d || !f) return;
    loopRef.current?.pause();
    if (!f.src) f.src = phone() ? FILM.phone : FILM.wide;
    d.showModal();
    f.play().catch(() => {});
  };
  const closeFilm = () => {
    const d = dialogRef.current;
    const f = filmRef.current;
    if (!d || !f) return;
    f.pause();
    if (d.open) d.close();
    resume.current();
  };

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element -- a single pre-sized poster, like the home hero's */}
      <img
        src="/video/mira-film-poster.webp"
        alt="Mira Living on the Bargara headland, from the film"
        width={1600}
        height={900}
        fetchPriority="high"
        decoding="async"
        data-reveal="mask"
        data-delay="200"
        style={{ ...cover, display: "block", backgroundColor: "#8fb6c4" }}
      />
      <video
        ref={loopRef}
        muted
        loop
        playsInline
        preload="none"
        aria-hidden
        tabIndex={-1}
        style={{ ...cover, opacity: shown ? 1 : 0, transition: "opacity 1.2s ease-out" }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(0deg,rgba(18,32,29,.55) 0%,rgba(18,32,29,0) 45%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "20px",
          right: "20px",
          bottom: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
        }}
      >
        <span
          className="glass mira-film-tag"
          style={{
            ...pill,
            whiteSpace: "nowrap",
            padding: "8px 14px",
            fontSize: "var(--fs-72)",
            fontWeight: 600,
            letterSpacing: ".18em",
            textTransform: "uppercase",
          }}
        >
          <span className="live-dot" />
          The film · 1:19
        </span>
        <button
          type="button"
          className="glass"
          data-press=""
          onClick={openFilm}
          aria-haspopup="dialog"
          aria-label="Watch the Mira Living film with sound"
          style={{
            ...pill,
            padding: "0 18px 0 6px",
            minHeight: "44px",
            whiteSpace: "nowrap",
            fontSize: "var(--fs-86)",
            fontWeight: 600,
            letterSpacing: ".01em",
            cursor: "pointer",
          }}
        >
          <span
            aria-hidden
            style={{
              display: "inline-grid",
              placeItems: "center",
              width: "32px",
              height: "32px",
              borderRadius: "999px",
              background: "#D3B995",
              color: "#20231F",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 14 14" fill="currentColor">
              <path d="M4 2l8 5-8 5z" />
            </svg>
          </span>
          Watch the film
        </button>
      </div>
      <dialog ref={dialogRef} className="film-dialog" aria-label="The Mira Living film" onClose={closeFilm}>
        <div className="film-dialog-frame">
          <video
            ref={filmRef}
            controls
            playsInline
            preload="none"
            poster="/video/mira-film-poster.webp"
            width={1920}
            height={1080}
            style={{ display: "block", width: "100%", height: "100%", background: "#0f1c1a" }}
          />
          <button
            type="button"
            className="glass film-dialog-close"
            data-press=""
            onClick={closeFilm}
            aria-label="Close the film"
            style={{ ...pill, justifyContent: "center", width: "44px", height: "44px", padding: 0, cursor: "pointer" }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
              <path d="M2 2l10 10M12 2L2 12" />
            </svg>
          </button>
        </div>
      </dialog>
    </>
  );
}
