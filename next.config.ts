import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Photographs are rendered ahead of time (scripts/image-variants.mjs) and lib/image-loader.ts points next/image
    // at those files, so nothing is encoded while a visitor waits.
    loader: "custom",
    loaderFile: "./lib/image-loader.ts",
    // Widths next/image may ask for. Phones land on 640–1080 (390px at 2–3x), laptops on 1280–1920; nothing above
    // 2400 exists because no source photograph is larger (scripts/optimize-assets.mjs). Keep WIDTHS in
    // scripts/image-variants.mjs in step with these.
    deviceSizes: [480, 640, 828, 1080, 1280, 1600, 1920, 2400],
    imageSizes: [160, 256, 384],
  },
  async rewrites() {
    return {
      // The loader names the WebP; a browser that accepts AVIF gets the smaller file rendered beside it.
      beforeFiles: [
        {
          source: "/img/:file(.+)\\.webp",
          has: [{ type: "header", key: "accept", value: ".*image/avif.*" }],
          destination: "/img/:file.avif",
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
  async headers() {
    return [
      {
        source: "/:dir(video|assets|uploads)/:file*",
        headers: [{ key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=86400" }],
      },
      {
        // File names carry a hash of their source, so they never change; Vary keeps a CDN from handing the AVIF to
        // a browser that asked for WebP.
        source: "/img/:file*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
          { key: "Vary", value: "Accept" },
        ],
      },
    ];
  },
};

export default nextConfig;
