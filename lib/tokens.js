import clientPromise from "./mongodb.js";

const DB_NAME = "hubspot-dash"; // Nombre de la base de datos
const COLLECTION_NAME = "verification-tokens"; // Nombre de la colección

// Guarda (o actualiza) el token para un email
export async function setToken(email, token) {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const collection = db.collection(COLLECTION_NAME);
  
  await collection.updateOne(
    { email },
    { $set: { token, expires: new Date(Date.now() + 3600000) } }, // 1 hora de expiración
    { upsert: true }
  );
}

// Obtiene el token guardado para un email y lo valida
export async function getToken(email, token) {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const collection = db.collection(COLLECTION_NAME);
  const entry = await collection.findOne({ email, token });
  
  if (!entry) return null;
  
  // Verificar si el token ha expirado
  if (new Date() > new Date(entry.expires)) {
    await collection.deleteOne({ email });
    return null;
  }
  
  return entry;
}

// Elimina el token para un email
export async function deleteToken(email) {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const collection = db.collection(COLLECTION_NAME);
  await collection.deleteOne({ email });
} 