import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  typescript:{
    ignoreBuildErrors: true
  },
  
  experimental: {
    serverActions: {
      bodySizeLimit: "100MB"
    }
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'encrypted-tbn0.gstatic.com',
      },
      {
        protocol: 'https',
        hostname: 'cloud.appwrite.io',
      }
    ]
  }
};

export default nextConfig;