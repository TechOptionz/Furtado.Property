import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    // Widths next/image may generate. Phones land on 640–1080 (390px at 2–3x), laptops on 1280–1920; nothing above
    // 2400 exists because no source photograph is larger (scripts/optimize-assets.mjs).
    deviceSizes: [480, 640, 828, 1080, 1280, 1600, 1920, 2400],
    imageSizes: [160, 256, 384],
    qualities: [75],
    // Optimised variants are kept for a month; the sources only change when someone replaces a photograph.
    minimumCacheTTL: 2678400,
  },
  async headers() {
    return [
      {
        source: "/:dir(video|assets|uploads)/:file*",
        headers: [{ key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=86400" }],
      },
    ];
  },
};

export default nextConfig;
