import type { NextConfig } from "next";
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  // pwa configuration
  // why: next-pwa requires webpack, not turbopack
  // how: set turbopack to undefined to force webpack
  // syntax: turbopack: undefined
  turbopack: undefined,
};

// wrap config with pwa
// why: enables progressive web app features
// how: withPWA() wrapper adds service worker and manifest support
// syntax: export default withPWA(nextConfig)
export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
})(nextConfig);
