import 'dotenv/config';
import { getDb } from '$lib/db.js';

let indexesCreated = false;

// Setup database indexes once
async function setupIndexes() {
	if (indexesCreated) return;
	try {
		const db = await getDb();
		await Promise.all([
			db.collection('tasks').createIndex({ userId: 1, createdAt: -1 }),
			db.collection('timelogs').createIndex({ userId: 1, endTime: 1 }),
			db.collection('timelogs').createIndex({ userId: 1, taskId: 1, endTime: 1 }),
			db.collection('users').createIndex({ email: 1 }, { unique: true })
		]);
		indexesCreated = true;
	} catch (err) {
		console.error('Index setup error:', err);
	}
}

export async function handle({ event, resolve }) {
	setupIndexes(); // Non-blocking
	const response = await resolve(event);
	response.headers.set('X-Content-Type-Options', 'nosniff');
	return response;
}
