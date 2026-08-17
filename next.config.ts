import type { NextConfig } from "next";

const assetsHostname =
  process.env.NEXT_PUBLIC_ASSETS_HOSTNAME?.trim() || "assets.example.com";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: assetsHostname,
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
