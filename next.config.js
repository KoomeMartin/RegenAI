// const path = require('path');

// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   distDir: process.env.NEXT_DIST_DIR || '.next',
//   output: process.env.NEXT_OUTPUT_MODE,
//   experimental: {
//     outputFileTracingRoot: path.join(__dirname, '../'),
//   },
//   eslint: {
//     ignoreDuringBuilds: true,
//   },
//   typescript: {
//     ignoreBuildErrors: false,
//   },
//   images: { unoptimized: true },
// };

// module.exports = nextConfig;



/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep ESLint checks, but skip during production builds
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Keep TypeScript strict, but fail the build if there are type errors
  typescript: {
    ignoreBuildErrors: false,
  },

  // Images settings (optional: unoptimized for external domains)
  images: {
    unoptimized: true,
  },

  // Optional: Future-proof experimental flags can be added here
  experimental: {
    // Example: enable server components or app directory features
    // appDir: true
  },
};

module.exports = nextConfig;
