import { MongoClient } from "mongodb";

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

// Use a deferred Promise so the MONGO_URI check only rejects at await-time,
// never throws synchronously at module-import time.
// This allows Next.js to statically analyse force-dynamic routes without crashing.
const clientPromise: Promise<MongoClient> = new Promise((resolve, reject) => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    reject(new Error("MONGO_URI environment variable is not set"));
    return;
  }

  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      const client = new MongoClient(uri);
      global._mongoClientPromise = client.connect();
    }
    global._mongoClientPromise!.then(resolve).catch(reject);
  } else {
    const client = new MongoClient(uri);
    client.connect().then(resolve).catch(reject);
  }
});

export default clientPromise;
