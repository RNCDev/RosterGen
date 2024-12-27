/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    config.resolve.alias['@/components'] = __dirname + '/components';
    return config;
  },
  // Add any other necessary configurations
  experimental: {
    // Optional: Enable incremental static regeneration if needed
    // incrementalStatic: true
  }
}

module.exports = nextConfig
