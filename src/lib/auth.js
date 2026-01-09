import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

/**
 * Hash a password
 * @param {string} password
 * @returns {Promise<string>}
 */
export async function hashPassword(password) {
	return await bcrypt.hash(password, 10);
}

/**
 * Compare password with hash
 * @param {string} password
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
export async function comparePassword(password, hash) {
	return await bcrypt.compare(password, hash);
}

/**
 * Generate JWT token
 * @param {Object} payload
 * @returns {string}
 */
export function generateToken(payload) {
	return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

/**
 * Verify JWT token
 * @param {string} token
 * @returns {Object|null}
 */
export function verifyToken(token) {
	try {
		return jwt.verify(token, JWT_SECRET);
	} catch (error) {
		return null;
	}
}

/**
 * Get user from request cookies
 * @param {Request} request
 * @returns {Object|null}
 */
export function getUserFromRequest(request) {
	const cookieHeader = request.headers.get('cookie');
	if (!cookieHeader) return null;

	const cookies = Object.fromEntries(
		cookieHeader.split('; ').map(c => {
			const [key, ...v] = c.split('=');
			return [key, v.join('=')];
		})
	);

	const token = cookies.auth_token;
	if (!token) return null;

	return verifyToken(token);
}
