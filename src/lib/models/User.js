import { getDb } from '$lib/db.js';
import { ObjectId } from 'mongodb';

/**
 * User model
 */
export class User {
	/**
	 * Create a new user
	 * @param {Object} userData
	 * @param {string} userData.email
	 * @param {string} userData.password - hashed password
	 * @param {string} userData.name
	 * @returns {Promise<Object>}
	 */
	static async create({ email, password, name }) {
		const db = await getDb();
		const result = await db.collection('users').insertOne({
			email,
			password,
			name,
			createdAt: new Date()
		});
		return { _id: result.insertedId, email, name };
	}

	/**
	 * Find user by email
	 * @param {string} email
	 * @returns {Promise<Object|null>}
	 */
	static async findByEmail(email) {
		const db = await getDb();
		return await db.collection('users').findOne({ email });
	}

	/**
	 * Find user by ID
	 * @param {string} userId
	 * @returns {Promise<Object|null>}
	 */
	static async findById(userId) {
		const db = await getDb();
		return await db.collection('users').findOne({ _id: new ObjectId(userId) });
	}
}
