import { MongoClient } from "mongodb";

const uri = process.env.MONGO_URI;

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

if (uri) {
  try {
    if (process.env.NODE_ENV === "development") {
      // In dev, preserve the connection across hot reloads to avoid multiple clients
      const globalWithMongo = global as typeof globalThis & {
        _mongoClient?: MongoClient;
        _mongoClientPromise?: Promise<MongoClient>;
      };
      if (!globalWithMongo._mongoClient) {
        client = new MongoClient(uri, { serverSelectionTimeoutMS: 3000 });
        globalWithMongo._mongoClient = client;
        globalWithMongo._mongoClientPromise = client.connect().catch((err) => {
          console.warn("[AI Studio] MongoDB not connected — using fallback:", err?.message ?? err);
          return client as MongoClient;
        });
      }
      client = globalWithMongo._mongoClient;
      clientPromise = globalWithMongo._mongoClientPromise!;
    } else {
      client = new MongoClient(uri, { serverSelectionTimeoutMS: 3000 });
      clientPromise = client.connect().catch((err) => {
        console.warn("[AI Studio] MongoDB not connected — using fallback:", err?.message ?? err);
        return client as MongoClient;
      });
    }
  } catch (err) {
    console.warn("[AI Studio] MongoDB initialization failed — using fallback:", err);
    client = null;
    clientPromise = null;
  }
} else {
  console.warn("[AI Studio] MONGO_URI not set — using in-memory database fallback");
}

export { client, clientPromise };
