import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("Debes definir la variable de entorno MONGODB_URI");
}

let client;
let clientPromise;

if (process.env.NODE_ENV === "development") {
  // En desarrollo, usar una variable global para preservar la conexión
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // En producción, se crea una nueva conexión
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export default clientPromise; 