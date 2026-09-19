// Soft drifting glow behind the page heroes. The drift is switched off under prefers-reduced-motion in globals.css.
export default function Blob() {
  return (
    <div
      aria-hidden
      className="blob-drift"
      style={{
        position: "absolute",
        top: "-20vh",
        left: "-10vw",
        width: "70vh",
        height: "70vh",
        borderRadius: "50%",
        background: "rgba(181,145,104,.22)",
        filter: "blur(70px)",
        pointerEvents: "none",
      }}
    />
  );
}
