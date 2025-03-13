// Este es un archivo de "shim" que reemplaza al cliente de Prisma
// para interceptar las llamadas y redirigirlas a MongoDB.
import clientPromise from './mongodb';

class MockPrismaClient {
  constructor() {
    console.log("🔄 Inicializando MockPrismaClient para redirigir a MongoDB");
    this.client = null;
    this.db = null;
    this.verificationToken = {
      findFirst: async (args) => {
        console.log("🔄 Interceptando llamada a prisma.verificationToken.findFirst");
        console.log("🔄 Argumentos:", JSON.stringify(args));
        try {
          if (!this.client) {
            console.log("🔄 Conectando a MongoDB...");
            this.client = await clientPromise;
            this.db = this.client.db("hubspot-dash");
            console.log("🔄 Conexión a MongoDB establecida");
          }

          const collection = this.db.collection("verification-tokens");
          
          // Convertir la consulta de Prisma a formato MongoDB
          let query = {};
          if (args.where) {
            if (args.where.identifier) {
              query.identifier = args.where.identifier;
            }
            if (args.where.token) {
              query.token = args.where.token;
            }
            if (args.where.expires) {
              query.expires = args.where.expires;
            }
          }

          console.log("🔄 Consulta MongoDB:", JSON.stringify(query));
          const result = await collection.findOne(query);
          console.log("🔄 Resultado:", result ? "Token encontrado" : "Token no encontrado");
          
          return result;
        } catch (error) {
          console.error("🔄 Error en MockPrismaClient.verificationToken.findFirst:", error);
          throw error;
        }
      },
      findUnique: async (args) => {
        console.log("🔄 Interceptando llamada a prisma.verificationToken.findUnique");
        return this.verificationToken.findFirst(args);
      },
      create: async (args) => {
        console.log("🔄 Interceptando llamada a prisma.verificationToken.create");
        console.log("🔄 Argumentos:", JSON.stringify(args));
        try {
          if (!this.client) {
            this.client = await clientPromise;
            this.db = this.client.db("hubspot-dash");
          }

          const collection = this.db.collection("verification-tokens");
          const data = args.data;
          
          const result = await collection.insertOne(data);
          console.log("🔄 Token creado en MongoDB:", result.insertedId);
          
          return { ...data, id: result.insertedId };
        } catch (error) {
          console.error("🔄 Error en MockPrismaClient.verificationToken.create:", error);
          throw error;
        }
      },
      delete: async (args) => {
        console.log("🔄 Interceptando llamada a prisma.verificationToken.delete");
        console.log("🔄 Argumentos:", JSON.stringify(args));
        try {
          if (!this.client) {
            this.client = await clientPromise;
            this.db = this.client.db("hubspot-dash");
          }

          const collection = this.db.collection("verification-tokens");
          let query = {};
          if (args.where) {
            if (args.where.identifier) {
              query.identifier = args.where.identifier;
            }
            if (args.where.token) {
              query.token = args.where.token;
            }
          }
          
          const result = await collection.deleteOne(query);
          console.log("🔄 Token eliminado de MongoDB:", result.deletedCount > 0);
          
          return { count: result.deletedCount };
        } catch (error) {
          console.error("🔄 Error en MockPrismaClient.verificationToken.delete:", error);
          throw error;
        }
      },
      deleteMany: async (args) => {
        console.log("🔄 Interceptando llamada a prisma.verificationToken.deleteMany");
        console.log("🔄 Argumentos:", JSON.stringify(args));
        try {
          if (!this.client) {
            this.client = await clientPromise;
            this.db = this.client.db("hubspot-dash");
          }

          const collection = this.db.collection("verification-tokens");
          let query = {};
          if (args.where) {
            if (args.where.identifier) {
              query.identifier = args.where.identifier;
            }
            if (args.where.token) {
              query.token = args.where.token;
            }
            if (args.where.expires) {
              query.expires = args.where.expires;
            }
          }
          
          const result = await collection.deleteMany(query);
          console.log("🔄 Tokens eliminados de MongoDB:", result.deletedCount);
          
          return { count: result.deletedCount };
        } catch (error) {
          console.error("🔄 Error en MockPrismaClient.verificationToken.deleteMany:", error);
          throw error;
        }
      }
    };
  }
}

// Exportamos el constructor de la misma manera que lo hace Prisma
export const PrismaClient = MockPrismaClient; 