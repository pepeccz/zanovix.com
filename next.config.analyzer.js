// Import the bundle analyzer
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

// Import the main config
const nextConfig = require('./next.config');

// Export the combined config
module.exports = withBundleAnalyzer(nextConfig);
