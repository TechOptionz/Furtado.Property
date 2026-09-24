import type { CSSProperties } from "react";

// The brand's logo files (FURTADO_Logo-01/-02, kept in ../uploads/image-originals) have hairline strokes that vanish
// at header size; scripts/optimize-assets.mjs crops their padding and renders solid, slightly thickened versions once
// (logo-ink for light backgrounds, logo-light for dark). Both come out as the same 4.0:1 shape (the script prints the
// ratio), so width and height here only reserve the space.
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
      width={Math.round(height * 4.007)}
      height={height}
      decoding="async"
      style={style}
    />
  );
}
