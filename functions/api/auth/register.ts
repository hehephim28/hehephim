/**
 * POST /api/auth/register - User registration
 */
import type { AppPagesFunction } from '../../lib/types';
import {
    hashPassword,
    signJWT,
    createAuthCookie,
    isValidEmail,
    isValidUsername,
    isValidPassword,
    generateUserId,
} from '../../lib/auth';

interface RegisterBody {
    email: string;
    password: string;
    username: string;
}

export const onRequestPost: AppPagesFunction = async (ctx) => {
    try {
        const body = await ctx.request.json() as RegisterBody;
        const { email, password, username } = body;

        // Validate input
        if (!email || !password || !username) {
            return Response.json(
                { error: 'Missing fields', message: 'Email, mật khẩu và tên người dùng là bắt buộc' },
                { status: 400 }
            );
        }

        if (!isValidEmail(email)) {
            return Response.json(
                { error: 'Invalid email', message: 'Email không hợp lệ' },
                { status: 400 }
            );
        }

        if (!isValidUsername(username)) {
            return Response.json(
                { error: 'Invalid username', message: 'Tên người dùng phải từ 3-30 ký tự, chỉ chứa chữ cái, số và dấu gạch dưới' },
                { status: 400 }
            );
        }

        if (!isValidPassword(password)) {
            return Response.json(
                { error: 'Invalid password', message: 'Mật khẩu phải có ít nhất 6 ký tự' },
                { status: 400 }
            );
        }

        // Check if email or username already exists
        const existingUser = await ctx.env.DB.prepare(
            'SELECT id FROM users WHERE email = ? OR username = ?'
        )
            .bind(email.toLowerCase(), username.toLowerCase())
            .first();

        if (existingUser) {
            return Response.json(
                { error: 'User exists', message: 'Email hoặc tên người dùng đã tồn tại' },
                { status: 409 }
            );
        }

        // Hash password and create user
        const passwordHash = await hashPassword(password);
        const userId = generateUserId();
        const createdAt = Date.now();

        await ctx.env.DB.prepare(
            'INSERT INTO users (id, email, username, password_hash, created_at) VALUES (?, ?, ?, ?, ?)'
        )
            .bind(userId, email.toLowerCase(), username, passwordHash, createdAt)
            .run();

        // Generate JWT
        const token = await signJWT(
            { userId, email: email.toLowerCase(), username },
            ctx.env.JWT_SECRET
        );

        const user = {
            id: userId,
            email: email.toLowerCase(),
            username,
            created_at: createdAt,
        };

        return new Response(
            JSON.stringify({ success: true, user, token }),
            {
                status: 201,
                headers: {
                    'Content-Type': 'application/json',
                    'Set-Cookie': createAuthCookie(token),
                },
            }
        );
    } catch (error: any) {
        console.error('Register error:', error);
        return Response.json(
            { error: 'Server error', message: 'Đã xảy ra lỗi, vui lòng thử lại' },
            { status: 500 }
        );
    }
};
