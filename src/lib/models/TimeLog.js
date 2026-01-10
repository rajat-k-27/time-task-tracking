import { getDb } from '$lib/db.js';
import { ObjectId } from 'mongodb';

/**
 * TimeLog model
 */
export class TimeLog {
	/**
	 * Create a new time log entry
	 * @param {Object} logData
	 * @param {string} logData.userId
	 * @param {string} logData.taskId
	 * @param {Date} logData.startTime
	 * @param {Date | null} [logData.endTime]
	 * @param {number} [logData.duration]
	 * @returns {Promise<Object>}
	 */
	static async create({ userId, taskId, startTime, endTime = null, duration = 0 }) {
		const db = await getDb();
		const result = await db.collection('timelogs').insertOne({
			userId: new ObjectId(userId),
			taskId: new ObjectId(taskId),
			startTime,
			endTime: /** @type {Date | null} */ (endTime),
			duration,
			createdAt: new Date()
		});
		return { _id: result.insertedId, userId, taskId, startTime, endTime, duration };
	}

	/**
	 * Find active timer for a user (returns first active timer)
	 * @param {string} userId
	 * @returns {Promise<Object|null>}
	 */
	static async findActiveTimer(userId) {
		const db = await getDb();
		return await db.collection('timelogs').findOne({
			userId: new ObjectId(userId),
			endTime: null
		});
	}

	/**
	 * Find all active timers for a user
	 * @param {string} userId
	 * @returns {Promise<any[]>}
	 */
	static async findAllActiveTimers(userId) {
		const db = await getDb();
		return await db
			.collection('timelogs')
			.find({
				userId: new ObjectId(userId),
				endTime: null
			})
			.toArray();
	}

	/**
	 * Find active timer for a specific task
	 * @param {string} userId
	 * @param {string} taskId
	 * @returns {Promise<Object|null>}
	 */
	static async findActiveTimerForTask(userId, taskId) {
		const db = await getDb();
		return await db.collection('timelogs').findOne({
			userId: new ObjectId(userId),
			taskId: new ObjectId(taskId),
			endTime: null
		});
	}

	/**
	 * Stop a timer
	 * @param {string} logId
	 * @param {Date} endTime
	 * @param {number} duration
	 * @returns {Promise<Object>}
	 */
	static async stopTimer(logId, endTime, duration) {
		const db = await getDb();
		return await db.collection('timelogs').updateOne(
			{ _id: new ObjectId(logId) },
			{ $set: { endTime, duration } }
		);
	}

	/**
	 * Get all time logs for a task
	 * @param {string} taskId
	 * @param {string} userId
	 * @returns {Promise<any[]>}
	 */
	static async findByTaskId(taskId, userId) {
		const db = await getDb();
		return await db
			.collection('timelogs')
			.find({
				taskId: new ObjectId(taskId),
				userId: new ObjectId(userId)
			})
			.sort({ startTime: -1 })
			.toArray();
	}

	/**
	 * Get time logs for a specific date range
	 * @param {string} userId
	 * @param {Date} startDate
	 * @param {Date} endDate
	 * @returns {Promise<any[]>}
	 */
	static async findByDateRange(userId, startDate, endDate) {
		const db = await getDb();
		return await db
			.collection('timelogs')
			.find({
				userId: new ObjectId(userId),
				startTime: { $gte: startDate, $lte: endDate }
			})
			.sort({ startTime: -1 })
			.toArray();
	}

	/**
	 * Get total time for a task
	 * @param {string} taskId
	 * @param {string} userId
	 * @returns {Promise<number>}
	 */
	static async getTotalTimeForTask(taskId, userId) {
		const db = await getDb();
		const result = await db
			.collection('timelogs')
			.aggregate([
				{
					$match: {
						taskId: new ObjectId(taskId),
						userId: new ObjectId(userId),
						endTime: { $ne: null }
					}
				},
				{
					$group: {
						_id: null,
						totalDuration: { $sum: '$duration' }
					}
				}
			])
			.toArray();

		return result.length > 0 ? result[0].totalDuration : 0;
	}
}
