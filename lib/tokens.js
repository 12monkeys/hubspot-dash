import clientPromise from "./mongodb.js";

const DB_NAME = "hubspot-dash"; // Nombre de la base de datos
const COLLECTION_NAME = "verification-tokens"; // Nombre de la colección

// Guarda (o actualiza) el token para un email
export async function setToken(email, token) {
  try {
    console.log("Intentando guardar token para:", email);
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    await collection.updateOne(
      { email },
      { $set: { token, expires: new Date(Date.now() + 3600000) } }, // 1 hora de expiración
      { upsert: true }
    );
    console.log("Token guardado correctamente para:", email);
  } catch (error) {
    console.error("Error al guardar el token:", error);
    throw error;
  }
}

// Obtiene el token guardado para un email y lo valida
export async function getToken(email, token) {
  try {
    console.log("Verificando token para:", email);
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    const entry = await collection.findOne({ email, token });
    console.log("Resultado de búsqueda de token:", entry ? "encontrado" : "no encontrado");
    
    if (!entry) {
      console.log("No se encontró el token para:", email);
      return null;
    }
    
    // Verificar si el token ha expirado
    if (new Date() > new Date(entry.expires)) {
      console.log("Token expirado para:", email);
      await collection.deleteOne({ email });
      return null;
    }
    
    console.log("Token válido para:", email);
    return entry;
  } catch (error) {
    console.error("Error al verificar el token:", error);
    throw error;
  }
}

// Elimina el token para un email
export async function deleteToken(email) {
  try {
    console.log("Eliminando token para:", email);
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    await collection.deleteOne({ email });
    console.log("Token eliminado correctamente para:", email);
  } catch (error) {
    console.error("Error al eliminar el token:", error);
    throw error;
  }
} 