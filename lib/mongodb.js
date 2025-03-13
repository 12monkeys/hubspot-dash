import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("Debes definir la variable de entorno MONGODB_URI");
}

console.log("Configurando conexión a MongoDB...");
console.log("URI de conexión (parcial):", uri.split('@')[1]); // Solo mostramos la parte después del @ por seguridad

let client;
let clientPromise;

async function connect() {
  try {
    console.log("Iniciando conexión a MongoDB...");
    console.log("Opciones de conexión:", {
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000
    });

    const client = new MongoClient(uri, {
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    console.log("Cliente MongoDB creado, intentando conectar...");
    const connection = await client.connect();
    console.log("Conexión establecida correctamente");
    
    // Verificar la conexión
    const adminDb = connection.db().admin();
    const serverInfo = await adminDb.serverStatus();
    console.log("Información del servidor MongoDB:", {
      version: serverInfo.version,
      uptime: serverInfo.uptime,
      connections: serverInfo.connections
    });

    return connection;
  } catch (error) {
    console.error("Error detallado al conectar con MongoDB:", {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    throw error;
  }
}

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    console.log("Creando nueva conexión en desarrollo...");
    client = new MongoClient(uri, {
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    global._mongoClientPromise = connect();
  } else {
    console.log("Utilizando conexión existente en desarrollo");
  }
  clientPromise = global._mongoClientPromise;
} else {
  console.log("Creando nueva conexión en producción...");
  client = new MongoClient(uri, {
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  });
  clientPromise = connect();
}

// Manejar errores de conexión
clientPromise.catch(error => {
  console.error("Error en la promesa de conexión a MongoDB:", {
    name: error.name,
    message: error.message,
    code: error.code
  });
});

export default clientPromise; 