import { json } from '@sveltejs/kit';
import { TimeLog } from '$lib/models/TimeLog.js';
import { getUserFromRequest } from '$lib/auth.js';

/** @type {import('./$types').RequestHandler} */
export async function GET({ request }) {
	try {
		const user = getUserFromRequest(request);
		if (!user) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const activeTimer = await TimeLog.findActiveTimer(user.userId);

		if (!activeTimer) {
			return json({ activeTimer: null });
		}

		return json({ activeTimer });
	} catch (error) {
		console.error('Get active timer error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
}
