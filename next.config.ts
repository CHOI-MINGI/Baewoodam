import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'jcsdasmgtoyvudfxzayu.supabase.co',
        pathname: '/storage/v1/object/public/**',
      }
    ],
    dangerouslyAllowSVG: true,
    unoptimized: true,
  }
};

export default nextConfig;