/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Suppress common development warnings
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Suppress browser extension warnings in development
      config.devtool = 'eval-cheap-module-source-map';
    }
    return config;
  },
  
  // Experimental features
  experimental: {
    // Reduce noise from React DevTools
    optimizePackageImports: ['lucide-react'],
  },
};

module.exports = nextConfig;
