"use client";
import { useEffect, useRef, type CSSProperties } from "react";
import { sharpenLogo } from "@/lib/site";

// The supplied logo PNGs have hairline strokes; sharpenLogo redraws them at display size (see lib/site.js).
export default function Logo({
  src,
  alt,
  color,
  height,
  style,
}: {
  src: string;
  alt: string;
  color: string;
  height: number;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLImageElement>(null);
  useEffect(() => {
    sharpenLogo(ref.current, color, height);
  }, [color, height]);
  // eslint-disable-next-line @next/next/no-img-element
  return <img ref={ref} src={src} alt={alt} style={style} />;
}
