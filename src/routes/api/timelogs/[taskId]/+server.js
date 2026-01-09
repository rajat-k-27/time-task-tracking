import { json } from '@sveltejs/kit';
import { TimeLog } from '$lib/models/TimeLog.js';
import { getUserFromRequest } from '$lib/auth.js';

/** @type {import('./$types').RequestHandler} */
export async function GET({ request, params }) {
	try {
		const user = getUserFromRequest(request);
		if (!user) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const timeLogs = await TimeLog.findByTaskId(params.taskId, user.userId);
		const totalTime = await TimeLog.getTotalTimeForTask(params.taskId, user.userId);

		return json({ timeLogs, totalTime });
	} catch (error) {
		console.error('Get time logs error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
}
