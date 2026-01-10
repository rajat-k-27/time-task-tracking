// @ts-nocheck
import { json } from '@sveltejs/kit';
import { Task } from '$lib/models/Task.js';
import { getUserFromRequest } from '$lib/auth.js';

/** @type {import('./$types').RequestHandler} */
export async function GET({ request }) {
	try {
		const user = getUserFromRequest(request);
		if (!user) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const tasks = await Task.findByUserId(user.userId);
		return json({ tasks });
	} catch (error) {
		console.error('Get tasks error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	try {
		const user = getUserFromRequest(request);
		if (!user) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { title, description } = await request.json();

		// Validation
		if (!title || title.trim() === '') {
			return json({ error: 'Title is required' }, { status: 400 });
		}

		const task = await Task.create({
			userId: user.userId,
			title: title.trim(),
			description: description || '',
			status: 'Pending'
		});

		return json({ task }, { status: 201 });
	} catch (error) {
		console.error('Create task error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
}
