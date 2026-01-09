import { json } from '@sveltejs/kit';
import { TimeLog } from '$lib/models/TimeLog.js';
import { getUserFromRequest } from '$lib/auth.js';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	try {
		const user = getUserFromRequest(request);
		if (!user) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Find active timer
		const activeTimer = await TimeLog.findActiveTimer(user.userId);
		if (!activeTimer) {
			return json({ error: 'No active timer found' }, { status: 404 });
		}

		// Calculate duration
		const endTime = new Date();
		const duration = Math.floor((endTime - new Date(activeTimer.startTime)) / 1000); // in seconds

		// Stop the timer
		await TimeLog.stopTimer(activeTimer._id.toString(), endTime, duration);

		return json({
			message: 'Timer stopped successfully',
			duration
		});
	} catch (error) {
		console.error('Stop timer error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
}
