import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    disableStaticImages: true,
    unoptimized: true,
  },
};

export default nextConfig;
