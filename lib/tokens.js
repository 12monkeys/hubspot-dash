import clientPromise from "./mongodb.js";

const DB_NAME = "hubspot-dash"; // Nombre de la base de datos
const COLLECTION_NAME = "verification-tokens"; // Nombre de la colección

// Guarda (o actualiza) el token para un email
export async function setToken(email, token) {
  try {
    console.log("Iniciando proceso de guardado de token");
    console.log("Conectando a MongoDB para guardar token...");
    const client = await clientPromise;
    console.log("Conexión establecida, accediendo a la base de datos:", DB_NAME);
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    const expirationDate = new Date(Date.now() + 3600000);
    console.log("Configurando token con expiración:", expirationDate);
    
    await collection.updateOne(
      { email },
      { $set: { token, expires: expirationDate } },
      { upsert: true }
    );
    console.log("Token guardado exitosamente para:", email);
  } catch (error) {
    console.error("Error detallado al guardar el token:", {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    throw error;
  }
}

// Obtiene el token guardado para un email y lo valida
export async function getToken(email, token) {
  try {
    console.log("Iniciando verificación de token");
    console.log("Conectando a MongoDB para verificar token...");
    const client = await clientPromise;
    console.log("Conexión establecida, accediendo a la base de datos:", DB_NAME);
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    console.log("Buscando token para email:", email);
    const entry = await collection.findOne({ email, token });
    
    if (!entry) {
      console.log("No se encontró token para el email:", email);
      return null;
    }
    
    console.log("Token encontrado, verificando expiración");
    const now = new Date();
    const expirationDate = new Date(entry.expires);
    
    if (now > expirationDate) {
      console.log("Token expirado. Fecha actual:", now, "Fecha expiración:", expirationDate);
      await collection.deleteOne({ email });
      return null;
    }
    
    console.log("Token válido y vigente");
    return entry;
  } catch (error) {
    console.error("Error detallado al verificar el token:", {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    throw error;
  }
}

// Elimina el token para un email
export async function deleteToken(email) {
  try {
    console.log("Iniciando eliminación de token");
    console.log("Conectando a MongoDB para eliminar token...");
    const client = await clientPromise;
    console.log("Conexión establecida, accediendo a la base de datos:", DB_NAME);
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    const result = await collection.deleteOne({ email });
    console.log("Resultado de eliminación:", {
      email,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error("Error detallado al eliminar el token:", {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    throw error;
  }
} 