import { MongoClient } from "mongodb";

declare global {
  var _mongoClientPromise: Promise<MongoClient>;
}

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("Debes definir la variable de entorno MONGODB_URI");
}

// Ya que hemos verificado que uri no es undefined, TypeScript lo sabrá para el resto del archivo
const MONGODB_URI: string = uri;

console.log("=== Configuración de MongoDB ===");
console.log("URI de conexión (parcial):", MONGODB_URI.split('@')[1]); // Solo mostramos la parte después del @ por seguridad
console.log("Ambiente:", process.env.NODE_ENV);

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

async function connect(): Promise<MongoClient> {
  try {
    console.log("=== Iniciando conexión a MongoDB ===");
    console.log("Opciones de conexión:", {
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 10000,
      heartbeatFrequencyMS: 10000
    });

    const client = new MongoClient(MONGODB_URI, {
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 10000,
      heartbeatFrequencyMS: 10000
    });

    console.log("Cliente MongoDB creado, intentando conectar...");
    const connection = await client.connect();
    console.log("Conexión inicial establecida correctamente");
    
    // Verificar la conexión
    try {
      const adminDb = connection.db().admin();
      const serverInfo = await adminDb.serverStatus();
      console.log("Información del servidor MongoDB:", {
        version: serverInfo.version,
        uptime: serverInfo.uptime,
        connections: serverInfo.connections,
        ok: serverInfo.ok
      });
    } catch (statusError) {
      console.error("Error al obtener estado del servidor:", statusError);
    }

    // Verificar la base de datos específica
    try {
      const db = connection.db("hubspot-dash");
      await db.command({ ping: 1 });
      console.log("Base de datos 'hubspot-dash' accesible");
      
      // Listar colecciones
      const collections = await db.listCollections().toArray();
      console.log("Colecciones disponibles:", collections.map(c => c.name));
    } catch (dbError) {
      console.error("Error al verificar la base de datos:", dbError);
    }

    return connection;
  } catch (error) {
    console.error("Error detallado al conectar con MongoDB:", {
      name: error instanceof Error ? error.name : 'Unknown Error',
      message: error instanceof Error ? error.message : String(error),
      code: (error as any)?.code,
      stack: error instanceof Error ? error.stack : undefined,
      uri: MONGODB_URI.includes('@') ? MONGODB_URI.split('@')[1] : 'URI format error'
    });
    throw error;
  }
}

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    console.log("Creando nueva conexión en desarrollo...");
    client = new MongoClient(MONGODB_URI, {
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 10000,
      heartbeatFrequencyMS: 10000
    });
    global._mongoClientPromise = connect();
  } else {
    console.log("Utilizando conexión existente en desarrollo");
  }
  clientPromise = global._mongoClientPromise;
} else {
  console.log("Creando nueva conexión en producción...");
  client = new MongoClient(MONGODB_URI, {
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    serverSelectionTimeoutMS: 10000,
    heartbeatFrequencyMS: 10000
  });
  clientPromise = connect();
}

// Manejar errores de conexión
clientPromise.catch(error => {
  console.error("Error en la promesa de conexión a MongoDB:", {
    name: error instanceof Error ? error.name : 'Unknown Error',
    message: error instanceof Error ? error.message : String(error),
    code: (error as any)?.code,
    stack: error instanceof Error ? error.stack : undefined
  });
});

export default clientPromise; 