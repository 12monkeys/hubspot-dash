import { PrismaClient } from '@prisma/client'

// PrismaClient es adjuntado al objeto `global` en entornos de desarrollo para prevenir
// múltiples instancias del cliente Prisma creadas durante hot-reloading
const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

// Si no estamos en producción, adjuntamos al objeto global para reutilización
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Función para conectar a la base de datos con reintentos
export async function connectToDatabase() {
  try {
    await prisma.$connect()
    console.log('Conexión a la base de datos establecida correctamente')
    return prisma
  } catch (error) {
    console.error('Error al conectar a la base de datos:', error)
    // Reintentar después de un breve retraso
    await new Promise(resolve => setTimeout(resolve, 1000))
    return connectToDatabase()
  }
}