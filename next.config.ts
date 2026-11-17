import type { NextConfig } from "next";
import { CONFIG } from "./lib/config";

// NOTE: The Content-Security-Policy below uses 'unsafe-inline' for scripts.
// Next.js injects inline bootstrap/hydration scripts, and GA/AdSense also rely on
// inline snippets, so a nonce-based policy would require threading a nonce through
// every script tag (including third-party ones we do not control). 'unsafe-inline'
// for scripts is the simplest option that keeps the app functional; styles also use
// 'unsafe-inline' because Tailwind/shadcn emit inline style attributes.
const newsletterHost = (() => {
  try {
    return new URL(CONFIG.NEWSLETTER_ACTION_URL).origin;
  } catch {
    return "https://formspree.io";
  }
})();

const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' " +
    (process.env.NODE_ENV !== "production" ? "'unsafe-eval' " : "") +
    "https://www.googletagmanager.com https://www.google-analytics.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://adservice.google.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: https://i.ytimg.com https://www.google-analytics.com https://www.googletagmanager.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net",
  "connect-src 'self' https://www.google-analytics.com https://www.googletagmanager.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net " +
    newsletterHost,
  "frame-src https://www.youtube-nocookie.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com",
  "base-uri 'self'",
  "form-action 'self' " + newsletterHost,
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Content-Security-Policy", value: csp },
];

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // NOTE: i.ytimg.com hosts the trailer facade thumbnail (spec §4.6). The other
    // settings allow serving our own local placeholder SVGs through next/image;
    // they contain no scripts, so the hardened CSP + sandbox keep them safe.
    remotePatterns: [{ protocol: "https", hostname: "i.ytimg.com" }],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  async headers() {
    return [
      {
        // Strict MIME checking (nosniff) breaks static assets served with
        // text/plain by some dev/proxy setups. Exclude _next/static so the
        // browser is lenient with CSS/JS MIME types while keeping nosniff
        // for HTML documents and API responses.
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
