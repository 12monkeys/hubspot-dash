/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@tremor/react"],
  experimental: {
    serverComponentsExternalPackages: []
  }
};

module.exports = nextConfig; 