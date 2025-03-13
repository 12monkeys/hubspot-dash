// Este archivo es una solución temporal para evitar errores de compilación relacionados con Prisma
// Se debe eliminar una vez que la migración a MongoDB esté completa

declare namespace PrismaNamespace {
  interface PrismaClient {
    verificationToken: {
      findFirst: (args: any) => Promise<any>;
      findUnique: (args: any) => Promise<any>;
      create: (args: any) => Promise<any>;
      update: (args: any) => Promise<any>;
      delete: (args: any) => Promise<any>;
      deleteMany: (args: any) => Promise<any>;
    };
    [key: string]: any;
  }
}

declare module '@prisma/client' {
  const PrismaClient: {
    new(options?: any): PrismaNamespace.PrismaClient;
  };
  export { PrismaClient };
} 