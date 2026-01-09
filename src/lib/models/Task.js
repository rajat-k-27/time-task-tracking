import { getDb } from '$lib/db.js';
import { ObjectId } from 'mongodb';

/**
 * Task model
 */
export class Task {
	/**
	 * Create a new task
	 * @param {Object} taskData
	 * @param {string} taskData.userId
	 * @param {string} taskData.title
	 * @param {string} [taskData.description]
	 * @param {string} [taskData.status]
	 * @returns {Promise<Object>}
	 */
	static async create({ userId, title, description = '', status = 'Pending' }) {
		const db = await getDb();
		const result = await db.collection('tasks').insertOne({
			userId: new ObjectId(userId),
			title,
			description,
			status,
			createdAt: new Date(),
			updatedAt: new Date()
		});
		return { _id: result.insertedId, userId, title, description, status };
	}

	/**
	 * Find all tasks for a user
	 * @param {string} userId
	 * @returns {Promise<Array>}
	 */
	static async findByUserId(userId) {
		const db = await getDb();
		return await db
			.collection('tasks')
			.find({ userId: new ObjectId(userId) })
			.sort({ createdAt: -1 })
			.toArray();
	}

	/**
	 * Find task by ID
	 * @param {string} taskId
	 * @param {string} userId
	 * @returns {Promise<Object|null>}
	 */
	static async findById(taskId, userId) {
		const db = await getDb();
		return await db.collection('tasks').findOne({
			_id: new ObjectId(taskId),
			userId: new ObjectId(userId)
		});
	}

	/**
	 * Update a task
	 * @param {string} taskId
	 * @param {string} userId
	 * @param {Object} updates
	 * @returns {Promise<Object>}
	 */
	static async update(taskId, userId, updates) {
		const db = await getDb();
		const result = await db.collection('tasks').updateOne(
			{ _id: new ObjectId(taskId), userId: new ObjectId(userId) },
			{ $set: { ...updates, updatedAt: new Date() } }
		);
		return result;
	}

	/**
	 * Delete a task
	 * @param {string} taskId
	 * @param {string} userId
	 * @returns {Promise<Object>}
	 */
	static async delete(taskId, userId) {
		const db = await getDb();
		return await db.collection('tasks').deleteOne({
			_id: new ObjectId(taskId),
			userId: new ObjectId(userId)
		});
	}
}
