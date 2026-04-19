import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
