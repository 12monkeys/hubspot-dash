/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@tremor/react"],
  webpack: (config, { isServer }) => {
    // Añadir alias para reemplazar el módulo de Prisma con nuestro mock
    config.resolve.alias['@prisma/client'] = path.resolve(__dirname, './app/lib/prisma-mock.js');
    
    return config;
  },
  // Esta configuración solo aplica a rutas que usan PrismaClient
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  env: {
    DATABASE_URL: "file:./dev.db"
  }
}

module.exports = nextConfig 