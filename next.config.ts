import type { NextConfig } from "next";

// Optional sub-path hosting, e.g. https://scai.iitd.ac.in/agentic-ai-workshop
// Set NEXT_PUBLIC_BASE_PATH=/agentic-ai-workshop at build time.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH?.replace(/\/+$/, "") || undefined;

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  basePath,
  poweredByHeader: false,
  // `standalone` output is used by the Docker image (see Dockerfile).
  output: process.env.NEXT_OUTPUT === "standalone" ? "standalone" : undefined,
  // Fonts read from disk by the social preview images.
  outputFileTracingIncludes: {
    "/opengraph-image": ["./assets/fonts/*.woff"],
    "/twitter-image": ["./assets/fonts/*.woff"],
  },
  cacheLife: {
    // Content managed from the admin panel. Saving in the admin expires the
    // relevant tags immediately; the time-based values are only a safety net
    // for edits made directly in the database.
    cms: { stale: 300, revalidate: 300, expire: 60 * 60 * 24 * 7 },
    // Used when the database could not be reached (e.g. during a build with no
    // database). Retries quickly so real content replaces the placeholders.
    fallback: { stale: 300, revalidate: 60, expire: 600 },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
