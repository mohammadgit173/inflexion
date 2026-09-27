import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import path from "node:path";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  // Hides the round "N" badge Next shows in development (it never appears in
  // production). Compile and runtime errors are still surfaced.
  devIndicators: false,
  // Pin the workspace root; otherwise Turbopack walks up and finds a stray
  // package-lock.json in the home directory.
  turbopack: { root: path.resolve(".") },
  images: {
    // YouTube video thumbnails for the intro video facade.
    remotePatterns: [{ protocol: "https", hostname: "i.ytimg.com" }],
  },
};

export default withNextIntl(nextConfig);
