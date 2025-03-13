/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@tremor/react'],
  experimental: {
    esmExternals: true
  }
};

module.exports = nextConfig; 