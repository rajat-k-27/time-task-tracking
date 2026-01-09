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

		const activeTimers = await TimeLog.findAllActiveTimers(user.userId);

		return json({ activeTimers: activeTimers || [] });
	} catch (error) {
		console.error('Get active timer error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
}
