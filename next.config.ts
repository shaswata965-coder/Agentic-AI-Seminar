import type { NextConfig } from "next";

// Optional sub-path hosting, e.g. https://scai.iitd.ac.in/agentic-ai-workshop
// Set NEXT_PUBLIC_BASE_PATH=/agentic-ai-workshop at build time.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH?.replace(/\/+$/, "") || undefined;

// Where the site may load things from. Scripts: the site itself (Next.js needs inline scripts for its
// statically generated pages, so they can't be limited by nonce) and Google Analytics. Frames: video and
// map embeds. Images: any https address, as image fields may link to one. Nothing may frame the site
// but itself (the admin's live preview), plugins are off, and forms post only to the site.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""} https://www.googletagmanager.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "media-src 'self' https:",
  "connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com",
  "frame-src 'self' https://www.youtube-nocookie.com https://player.vimeo.com https://www.google.com https://maps.google.com",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
].join("; ");

const securityHeaders = [
  // Browsers only honour it over HTTPS; once seen, they refuse plain HTTP to this host for a year.
  { key: "Strict-Transport-Security", value: "max-age=31536000" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()" },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  experimental: {
    // CSS goes into the page itself instead of separate files: the browser can draw as soon as the HTML
    // arrives, with no stylesheet requests to wait for (the home page's loading screen shows at once).
    inlineCss: true,
  },
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
    return [
      { source: "/:path*", headers: securityHeaders },
      // Not for uploaded files: /api/media/[id] sets the policy for each kind of file itself (SVGs are
      // sandboxed, PDFs must not be), and headers set here would replace the route's own.
      { source: "/((?!api/media/).*)", headers: [{ key: "Content-Security-Policy", value: csp }] },
    ];
  },
};

export default nextConfig;
