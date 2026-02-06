/**
 * POST /api/auth/login - User login
 */
import type { AppPagesFunction } from '../../lib/types';
import type { UserWithHash } from '../../lib/types';
import {
    verifyPassword,
    signJWT,
    createAuthCookie,
} from '../../lib/auth';

interface LoginBody {
    email: string;
    password: string;
}

export const onRequestPost: AppPagesFunction = async (ctx) => {
    try {
        const body = await ctx.request.json() as LoginBody;
        const { email, password } = body;

        // Validate input
        if (!email || !password) {
            return Response.json(
                { error: 'Missing fields', message: 'Email và mật khẩu là bắt buộc' },
                { status: 400 }
            );
        }

        // Find user by email
        const user = await ctx.env.DB.prepare(
            'SELECT id, email, username, password_hash, created_at FROM users WHERE email = ?'
        )
            .bind(email.toLowerCase())
            .first<UserWithHash>();

        if (!user) {
            return Response.json(
                { error: 'Invalid credentials', message: 'Email hoặc mật khẩu không đúng' },
                { status: 401 }
            );
        }

        // Verify password
        const isValid = await verifyPassword(password, user.password_hash);
        if (!isValid) {
            return Response.json(
                { error: 'Invalid credentials', message: 'Email hoặc mật khẩu không đúng' },
                { status: 401 }
            );
        }

        // Generate JWT
        const token = await signJWT(
            { userId: user.id, email: user.email, username: user.username },
            ctx.env.JWT_SECRET
        );

        const userData = {
            id: user.id,
            email: user.email,
            username: user.username,
            created_at: user.created_at,
        };

        return new Response(
            JSON.stringify({ success: true, user: userData, token }),
            {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Set-Cookie': createAuthCookie(token),
                },
            }
        );
    } catch (error: any) {
        console.error('Login error:', error);
        return Response.json(
            { error: 'Server error', message: 'Đã xảy ra lỗi, vui lòng thử lại' },
            { status: 500 }
        );
    }
};
