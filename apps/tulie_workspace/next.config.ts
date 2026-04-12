import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@tailwindcss/postcss",
    "@tailwindcss/node",
    "lightningcss",
  ],
  transpilePackages: [
    "date-fns",
    "@floating-ui/react-dom",
    "@floating-ui/dom",
    "@floating-ui/utils",
    "@floating-ui/core",
  ],
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {},
};

export default nextConfig;
