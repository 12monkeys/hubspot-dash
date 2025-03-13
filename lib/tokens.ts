import { MongoClient } from "mongodb";
import clientPromise from "./mongodb";

const DB_NAME = "hubspot-dash"; // Nombre de la base de datos
const COLLECTION_NAME = "verification-tokens"; // Nombre de la colección

interface TokenEntry {
  email: string;
  token: string;
  expires: Date;
}

// Guarda (o actualiza) el token para un email
export async function setToken(email: string, token: string): Promise<void> {
  try {
    console.log("=== Iniciando guardado de token ===");
    console.log("Conectando a MongoDB para guardar token...");
    const client: MongoClient = await clientPromise;
    console.log("Conexión establecida, accediendo a la base de datos:", DB_NAME);
    const db = client.db(DB_NAME);
    const collection = db.collection<TokenEntry>(COLLECTION_NAME);
    
    // Verificar si la colección existe
    const collections = await db.listCollections({ name: COLLECTION_NAME }).toArray();
    if (collections.length === 0) {
      console.log("Creando colección:", COLLECTION_NAME);
      await db.createCollection(COLLECTION_NAME);
    }
    
    const expirationDate = new Date(Date.now() + 3600000);
    console.log("Configurando token con expiración:", expirationDate);
    
    const result = await collection.updateOne(
      { email },
      { $set: { token, expires: expirationDate } },
      { upsert: true }
    );
    
    console.log("Resultado de la operación:", {
      acknowledged: result.acknowledged,
      modifiedCount: result.modifiedCount,
      upsertedCount: result.upsertedCount,
      matchedCount: result.matchedCount
    });
    
    // Verificar que el token se guardó correctamente
    const savedToken = await collection.findOne({ email });
    console.log("Token guardado verificado:", {
      exists: !!savedToken,
      email: savedToken?.email,
      expiresAt: savedToken?.expires
    });
  } catch (error) {
    console.error("Error detallado al guardar el token:", {
      name: error instanceof Error ? error.name : 'Unknown Error',
      message: error instanceof Error ? error.message : String(error),
      code: (error as any)?.code,
      stack: error instanceof Error ? error.stack : undefined,
      email
    });
    throw error;
  }
}

// Obtiene el token guardado para un email y lo valida
export async function getToken(email: string, token: string): Promise<TokenEntry | null> {
  try {
    console.log("=== Iniciando verificación de token ===");
    console.log("Conectando a MongoDB para verificar token...");
    const client: MongoClient = await clientPromise;
    console.log("Conexión establecida, accediendo a la base de datos:", DB_NAME);
    const db = client.db(DB_NAME);
    const collection = db.collection<TokenEntry>(COLLECTION_NAME);
    
    console.log("Buscando token para email:", email);
    const entry = await collection.findOne({ email, token });
    
    if (!entry) {
      console.log("No se encontró token para el email:", email);
      return null;
    }
    
    console.log("Token encontrado, verificando expiración");
    const now = new Date();
    const expirationDate = new Date(entry.expires);
    
    console.log("Información del token:", {
      email: entry.email,
      tokenExists: !!entry.token,
      expirationDate,
      now,
      hasExpired: now > expirationDate
    });
    
    if (now > expirationDate) {
      console.log("Token expirado. Fecha actual:", now, "Fecha expiración:", expirationDate);
      await collection.deleteOne({ email });
      console.log("Token expirado eliminado de la base de datos");
      return null;
    }
    
    console.log("Token válido y vigente");
    return entry;
  } catch (error) {
    console.error("Error detallado al verificar el token:", {
      name: error instanceof Error ? error.name : 'Unknown Error',
      message: error instanceof Error ? error.message : String(error),
      code: (error as any)?.code,
      stack: error instanceof Error ? error.stack : undefined,
      email,
      token
    });
    throw error;
  }
}

// Elimina el token para un email
export async function deleteToken(email: string): Promise<void> {
  try {
    console.log("=== Iniciando eliminación de token ===");
    console.log("Conectando a MongoDB para eliminar token...");
    const client: MongoClient = await clientPromise;
    console.log("Conexión establecida, accediendo a la base de datos:", DB_NAME);
    const db = client.db(DB_NAME);
    const collection = db.collection<TokenEntry>(COLLECTION_NAME);
    
    const result = await collection.deleteOne({ email });
    console.log("Resultado de eliminación:", {
      email,
      acknowledged: result.acknowledged,
      deletedCount: result.deletedCount
    });
    
    // Verificar que el token se eliminó
    const tokenExists = await collection.findOne({ email });
    console.log("Verificación post-eliminación:", {
      email,
      tokenEliminado: !tokenExists
    });
  } catch (error) {
    console.error("Error detallado al eliminar el token:", {
      name: error instanceof Error ? error.name : 'Unknown Error',
      message: error instanceof Error ? error.message : String(error),
      code: (error as any)?.code,
      stack: error instanceof Error ? error.stack : undefined,
      email
    });
    throw error;
  }
} 