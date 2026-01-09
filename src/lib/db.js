import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/timetracking';

// Optimized MongoDB options for Vercel serverless
const options = {
	maxPoolSize: 10,
	minPoolSize: 1,
	serverSelectionTimeoutMS: 5000,
	socketTimeoutMS: 45000,
	connectTimeoutMS: 10000,
	maxIdleTimeMS: 60000
};

let client;
let clientPromise;

if (!global._mongoClientPromise) {
	client = new MongoClient(MONGODB_URI, options);
	global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

/**
 * Get MongoDB database instance
 * @returns {Promise<import('mongodb').Db>}
 */
export async function getDb() {
	try {
		const client = await clientPromise;
		return client.db();
	} catch (error) {
		console.error('DB connection error:', error);
		global._mongoClientPromise = null;
		throw error;
	}
}

export { clientPromise };
