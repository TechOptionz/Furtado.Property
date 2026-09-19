import type { CSSProperties } from "react";

// The supplied logo PNGs have hairline strokes that vanish at header size; scripts/optimize-assets.mjs renders solid,
// slightly thickened versions once (logo-ink for light backgrounds, logo-light for dark). Both are 469:132 / 597:168,
// i.e. the same 3.55:1 shape, so width and height here only reserve the space.
const FILES: Record<string, string> = {
  "/assets/logo-dark.png": "/assets/logo-ink.webp",
  "/assets/logo-white.png": "/assets/logo-light.webp",
};

export default function Logo({
  src,
  alt,
  height,
  style,
}: {
  src: string;
  alt: string;
  color?: string;
  height: number;
  style?: CSSProperties;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={FILES[src] || src}
      alt={alt}
      width={Math.round(height * 3.553)}
      height={height}
      decoding="async"
      style={style}
    />
  );
}
