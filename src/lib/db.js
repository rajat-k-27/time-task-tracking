import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/timetracking';

let client;
let clientPromise;

if (!global._mongoClientPromise) {
	client = new MongoClient(MONGODB_URI);
	global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

/**
 * Get MongoDB database instance
 * @returns {Promise<import('mongodb').Db>}
 */
export async function getDb() {
	const client = await clientPromise;
	return client.db();
}

export { clientPromise };
