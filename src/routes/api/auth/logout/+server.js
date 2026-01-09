import { json } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export async function POST() {
	return json(
		{ message: 'Logged out successfully' },
		{
			headers: {
				'Set-Cookie': 'auth_token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict'
			}
		}
	);
}
