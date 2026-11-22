import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_HOSTNAME!,
      },
      {
        protocol: "https",
        hostname: process.env.NEXT_PUBLIC_GOOGLE_STORAGE_HOSTNAME!,
      },
    ],
  },
};

export default nextConfig;
