"use client";
import variants from "./image-variants.json";

// next/image loader (next.config.ts): photographs are served from the files scripts/image-variants.mjs rendered
// ahead of time instead of being encoded on request. The URL names the WebP; browsers that accept AVIF are handed
// the .avif beside it by a rewrite in next.config.ts. Widths above the photograph's own resolve to its largest file.
const known = variants as Record<string, { w: number; v: string }>;

export default function imageLoader({ src, width }: { src: string; width: number }) {
  const photo = known[src];
  if (!photo) return src;
  const name = src.slice(src.lastIndexOf("/") + 1).replace(/\.\w+$/, "");
  return `/img/${name}-${Math.min(width, photo.w)}.${photo.v}.webp`;
}
