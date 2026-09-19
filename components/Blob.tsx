// Soft drifting glow behind the page heroes. It is a radial gradient rather than a blurred disc: the look is the
// same, without a 70px blur filter being re-rasterised while it moves. The drift runs on larger screens only and is
// switched off under prefers-reduced-motion (globals.css).
export default function Blob() {
  return (
    <div
      aria-hidden
      className="blob-drift"
      style={{
        position: "absolute",
        top: "-35vh",
        left: "calc(-10vw - 15vh)",
        width: "100vh",
        height: "100vh",
        background: "radial-gradient(closest-side,rgba(181,145,104,.2) 40%,rgba(181,145,104,.09) 70%,transparent)",
        pointerEvents: "none",
      }}
    />
  );
}
