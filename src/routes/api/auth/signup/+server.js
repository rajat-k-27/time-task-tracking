// @ts-nocheck
import { json } from '@sveltejs/kit';
import { User } from '$lib/models/User.js';
import { hashPassword, generateToken } from '$lib/auth.js';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	try {
		const { email, password, name } = await request.json();

		// Validation
		if (!email || !password || !name) {
			return json({ error: 'All fields are required' }, { status: 400 });
		}

		if (password.length < 6) {
			return json({ error: 'Password must be at least 6 characters' }, { status: 400 });
		}

		// Check if user exists
		const existingUser = await User.findByEmail(email);
		if (existingUser) {
			return json({ error: 'User already exists' }, { status: 400 });
		}

		// Hash password and create user
		const hashedPassword = await hashPassword(password);
		const user = await User.create({
			email,
			password: hashedPassword,
			name
		});

		// Generate token
		const token = generateToken({ userId: user._id.toString(), email: user.email });

		return json(
			{ user: { id: user._id, email: user.email, name: user.name } },
			{
				status: 201,
				headers: {
					'Set-Cookie': `auth_token=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Strict`
				}
			}
		);
	} catch (error) {
		console.error('Signup error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
}
