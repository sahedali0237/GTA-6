import { MongoClient } from "mongodb";

const uri = process.env.MONGO_URI;

if (!uri) {
  throw new Error("MONGO_URI is not defined in environment variables");
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  // In dev, preserve the connection across hot reloads to avoid multiple clients
  const globalWithMongo = global as typeof globalThis & {
    _mongoClient?: MongoClient;
    _mongoClientPromise?: Promise<MongoClient>;
  };
  if (!globalWithMongo._mongoClient) {
    client = new MongoClient(uri);
    globalWithMongo._mongoClient = client;
    globalWithMongo._mongoClientPromise = client.connect();
  }
  client = globalWithMongo._mongoClient;
  clientPromise = globalWithMongo._mongoClientPromise!;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export { client, clientPromise };
