/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: [
    "clerx-ai.vercel.app",
    "schools-pacific-result-reflect.trycloudflare.com",
    "*.trycloudflare.com",
    "localhost:3000",
    "localhost",
  ],
  turbopack: {
    resolveAlias: {
      canvas: "./src/lib/empty-module.js",
    },
  },
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    config.resolve.fallback = {
      ...config.resolve.fallback,
      canvas: false,
      fs: false,
    };
    return config;
  },
};

export default nextConfig;
