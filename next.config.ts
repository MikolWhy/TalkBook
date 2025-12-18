import type { NextConfig } from "next";
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  // pwa configuration
  // why: next-pwa requires webpack, not turbopack
  // how: set turbopack to undefined to force webpack
  // syntax: turbopack: undefined
  turbopack: undefined,

  // Note: SWC minification is now the default in Next.js 16+ (no need to specify swcMinify)

  // Webpack configuration for better caching
  webpack: (config, { dev }) => {
    // Enable filesystem caching for faster rebuilds in development
    if (dev) {
      config.cache = {
        type: 'filesystem',
        // Webpack will automatically track this config file for changes
      };
    }

    return config;
  },
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
