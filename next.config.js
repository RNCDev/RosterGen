/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Explicitly resolve @/components
    config.resolve.alias['@/components'] = path.resolve(__dirname, 'components');
    config.resolve.alias['@/components/RosterGenerator'] = path.resolve(__dirname, 'components/RosterGenerator.js');
    return config;
  },
  // Ensure correct module resolution
  experimental: {
    serverComponentsExternalPackages: ['@vercel/postgres']
  }
}

module.exports = nextConfig
