import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [{
      protocol: 'https',
      hostname: 'ddragon.leagueoflegends.com',
      port: '',
    },
    {
      protocol: 'https',
      hostname: 'static.bigbrain.gg',
      port: '',
    },
    {
      protocol: 'https',
      hostname: 'raw.communitydragon.org',
      port: '',
    }
    ]
  },
};

export default nextConfig;
