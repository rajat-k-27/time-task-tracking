import { json } from '@sveltejs/kit';
import { TimeLog } from '$lib/models/TimeLog.js';
import { Task } from '$lib/models/Task.js';
import { getUserFromRequest } from '$lib/auth.js';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	try {
		const user = getUserFromRequest(request);
		if (!user) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { taskId } = await request.json();

		// Validate task exists and belongs to user
		const task = await Task.findById(taskId, user.userId);
		if (!task) {
			return json({ error: 'Task not found' }, { status: 404 });
		}

		// Check if task is completed
		if (task.status === 'Completed') {
			return json({ error: 'Cannot start timer for completed tasks' }, { status: 400 });
		}

		// Check if there's already an active timer
		const activeTimer = await TimeLog.findActiveTimer(user.userId);
		if (activeTimer) {
			return json({ error: 'Stop the current timer before starting a new one' }, { status: 400 });
		}

		// Create new time log
		const timeLog = await TimeLog.create({
			userId: user.userId,
			taskId,
			startTime: new Date()
		});

		// Update task status to "In Progress" if it's pending
		if (task.status === 'Pending') {
			await Task.update(taskId, user.userId, { status: 'In Progress' });
		}

		return json({ timeLog }, { status: 201 });
	} catch (error) {
		console.error('Start timer error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
}
