import { json } from '@sveltejs/kit';
import { TimeLog } from '$lib/models/TimeLog.js';
import { Task } from '$lib/models/Task.js';
import { getUserFromRequest } from '$lib/auth.js';
import { ObjectId } from 'mongodb';

/** @type {import('./$types').RequestHandler} */
export async function GET({ request, url }) {
	try {
		const user = getUserFromRequest(request);
		if (!user) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Get date from query params (default to today)
		const dateParam = url.searchParams.get('date');
		const targetDate = dateParam ? new Date(dateParam) : new Date();

		// Set to start and end of day
		const startOfDay = new Date(targetDate);
		startOfDay.setHours(0, 0, 0, 0);

		const endOfDay = new Date(targetDate);
		endOfDay.setHours(23, 59, 59, 999);

		// Get time logs for the day
		const timeLogs = await TimeLog.findByDateRange(user.userId, startOfDay, endOfDay);

		// Get unique task IDs from time logs
		const taskIdsFromLogs = [...new Set(timeLogs.map((log) => log.taskId.toString()))];

		// Get all user tasks
		const allTasks = await Task.findByUserId(user.userId);
		
		// Get tasks worked on (with time logs) + tasks created today
		const tasksWorkedOn = allTasks.filter((task) => {
			const taskCreatedToday = new Date(task.createdAt) >= startOfDay && new Date(task.createdAt) <= endOfDay;
			const hasTimeLogs = taskIdsFromLogs.includes(task._id.toString());
			return hasTimeLogs || taskCreatedToday;
		});

		// Calculate total time
		const totalTime = timeLogs
			.filter((log) => log.endTime !== null)
			.reduce((sum, log) => sum + log.duration, 0);

		// Calculate active time (from active timer if it started today)
		const activeTimer = timeLogs.find((log) => log.endTime === null);
		let activeTime = 0;
		if (activeTimer) {
			activeTime = Math.floor((new Date() - new Date(activeTimer.startTime)) / 1000);
		}

		// Status breakdown
		const statusBreakdown = {
			Completed: tasksWorkedOn.filter((t) => t.status === 'Completed').length,
			'In Progress': tasksWorkedOn.filter((t) => t.status === 'In Progress').length,
			Pending: tasksWorkedOn.filter((t) => t.status === 'Pending').length
		};

		return json({
			date: targetDate.toISOString().split('T')[0],
			tasksWorkedOn,
			totalTime: totalTime + activeTime,
			statusBreakdown,
			timeLogs,
			activeTimer
		});
	} catch (error) {
		console.error('Get summary error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
}
