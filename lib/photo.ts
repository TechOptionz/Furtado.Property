import placeholders from "./image-placeholders.json";
import type { Photo } from "./projects";

// What next/image needs for a photograph in public/uploads: its size and a 16px blur, both written to
// lib/image-placeholders.json by scripts/image-variants.mjs (npm run variants, and before every build).
const known = placeholders as Record<string, { width: number; height: number; blur: string }>;

export type PhotoProps = Photo & { width: number; height: number; blurDataURL: string };

export function photoProps({ src, alt }: Photo): PhotoProps {
  const meta = known[src];
  if (!meta) throw new Error(`${src} is not in lib/image-placeholders.json; run "npm run variants"`);
  return { src, alt, width: meta.width, height: meta.height, blurDataURL: meta.blur };
}
