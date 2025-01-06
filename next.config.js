/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Explicitly resolve components
    config.resolve.alias['@/components'] = path.resolve(__dirname, 'components');
    config.resolve.alias['@/app/components'] = path.resolve(__dirname, 'src/app/components');
    config.resolve.alias['@/types'] = path.resolve(__dirname, 'src/types');
    config.resolve.alias['@/lib'] = path.resolve(__dirname, 'src/lib');
    return config;
  },
  // Ensure correct module resolution
  experimental: {
    serverComponentsExternalPackages: ['@vercel/postgres']
  }
}

module.exports = nextConfig
