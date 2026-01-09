import { json } from '@sveltejs/kit';
import { Task } from '$lib/models/Task.js';
import { getUserFromRequest } from '$lib/auth.js';

/** @type {import('./$types').RequestHandler} */
export async function GET({ request, params }) {
	try {
		const user = getUserFromRequest(request);
		if (!user) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const task = await Task.findById(params.id, user.userId);
		if (!task) {
			return json({ error: 'Task not found' }, { status: 404 });
		}

		return json({ task });
	} catch (error) {
		console.error('Get task error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
}

/** @type {import('./$types').RequestHandler} */
export async function PUT({ request, params }) {
	try {
		const user = getUserFromRequest(request);
		if (!user) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const updates = await request.json();

		// Validate task exists and belongs to user
		const task = await Task.findById(params.id, user.userId);
		if (!task) {
			return json({ error: 'Task not found' }, { status: 404 });
		}

		// Prevent editing completed tasks
		if (task.status === 'Completed') {
			return json({ error: 'Cannot edit completed tasks' }, { status: 400 });
		}

		// Build allowed updates
		const allowedUpdates = {};
		if (updates.title !== undefined) allowedUpdates.title = updates.title.trim();
		if (updates.description !== undefined) allowedUpdates.description = updates.description;
		if (updates.status !== undefined) {
			if (['Pending', 'In Progress', 'Completed'].includes(updates.status)) {
				allowedUpdates.status = updates.status;
			}
		}

		await Task.update(params.id, user.userId, allowedUpdates);

		const updatedTask = await Task.findById(params.id, user.userId);
		return json({ task: updatedTask });
	} catch (error) {
		console.error('Update task error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
}

/** @type {import('./$types').RequestHandler} */
export async function DELETE({ request, params }) {
	try {
		const user = getUserFromRequest(request);
		if (!user) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const task = await Task.findById(params.id, user.userId);
		if (!task) {
			return json({ error: 'Task not found' }, { status: 404 });
		}

		// Prevent deleting completed tasks
		if (task.status === 'Completed') {
			return json({ error: 'Cannot delete completed tasks' }, { status: 400 });
		}

		await Task.delete(params.id, user.userId);
		return json({ message: 'Task deleted successfully' });
	} catch (error) {
		console.error('Delete task error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
}
