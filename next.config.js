/** @type {import('next').NextConfig} */
// Versión sin Prisma - Usando solo MongoDB directamente

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@tremor/react"],
  // Esta configuración solo aplica a rutas que usan PrismaClient
  experimental: {
    serverComponentsExternalPackages: [],
  }
}

module.exports = nextConfig 