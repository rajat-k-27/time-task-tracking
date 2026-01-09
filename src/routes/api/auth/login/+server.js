import { json } from '@sveltejs/kit';
import { User } from '$lib/models/User.js';
import { comparePassword, generateToken } from '$lib/auth.js';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	try {
		const { email, password } = await request.json();

		// Validation
		if (!email || !password) {
			return json({ error: 'Email and password are required' }, { status: 400 });
		}

		// Find user
		const user = await User.findByEmail(email);
		if (!user) {
			return json({ error: 'Invalid credentials' }, { status: 401 });
		}

		// Check password
		const isPasswordValid = await comparePassword(password, user.password);
		if (!isPasswordValid) {
			return json({ error: 'Invalid credentials' }, { status: 401 });
		}

		// Generate token
		const token = generateToken({ userId: user._id.toString(), email: user.email });

		return json(
			{ user: { id: user._id, email: user.email, name: user.name } },
			{
				headers: {
					'Set-Cookie': `auth_token=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Strict`
				}
			}
		);
	} catch (error) {
		console.error('Login error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
}
