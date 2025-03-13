import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("Debes definir la variable de entorno MONGODB_URI");
}

console.log("Configurando conexión a MongoDB...");

let client;
let clientPromise;

async function connect() {
  try {
    console.log("Intentando conectar a MongoDB...");
    const client = new MongoClient(uri, {
      connectTimeoutMS: 10000, // 10 segundos de timeout
      socketTimeoutMS: 45000,  // 45 segundos de timeout
    });
    const connection = await client.connect();
    console.log("Conexión a MongoDB establecida correctamente");
    return connection;
  } catch (error) {
    console.error("Error al conectar con MongoDB:", error);
    throw error;
  }
}

if (process.env.NODE_ENV === "development") {
  // En desarrollo, usar una variable global para preservar la conexión
  if (!global._mongoClientPromise) {
    console.log("Creando nueva conexión en desarrollo...");
    client = new MongoClient(uri, {
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    global._mongoClientPromise = connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // En producción, se crea una nueva conexión
  console.log("Creando nueva conexión en producción...");
  client = new MongoClient(uri, {
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  });
  clientPromise = connect();
}

// Manejar errores de conexión
clientPromise.catch(error => {
  console.error("Error en la promesa de conexión a MongoDB:", error);
});

export default clientPromise; 