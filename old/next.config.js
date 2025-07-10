/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Increase memory limit for webpack
    workerThreads: false,
    cpus: 1,
  },
  // Disable source maps in development to save memory
  productionBrowserSourceMaps: false,
  // Optimize webpack config
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Reduce memory usage in development
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
        },
      };
    }
    return config;
  },
  // Images
  images: {
    remotePatterns: [{
      protocol: 'https',
      hostname: 'ddragon.leagueoflegends.com',
      port: '',
    }, {
      protocol: 'https',
      hostname: 'static.bigbrain.gg',
      port: '',
    }]
  },
};

module.exports = nextConfig;