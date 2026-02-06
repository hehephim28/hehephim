/**
 * POST /api/auth/login - User login
 */
import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

async function hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function signJWT(payload: object, secret: string): Promise<string> {
    const header = { alg: 'HS256', typ: 'JWT' };
    const now = Math.floor(Date.now() / 1000);
    const exp = now + 7 * 24 * 60 * 60;

    const fullPayload = { ...payload, iat: now, exp };

    const encoder = new TextEncoder();
    const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, '');
    const payloadB64 = btoa(JSON.stringify(fullPayload)).replace(/=/g, '');

    const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );

    const signature = await crypto.subtle.sign(
        'HMAC',
        key,
        encoder.encode(`${headerB64}.${payloadB64}`)
    );

    const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

    return `${headerB64}.${payloadB64}.${signatureB64}`;
}

function createAuthCookie(token: string): string {
    const maxAge = 7 * 24 * 60 * 60;
    return `auth_token=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${maxAge}`;
}

interface LoginBody {
    email: string;
    password: string;
}

interface UserRow {
    id: string;
    email: string;
    username: string;
    password_hash: string;
    created_at: number;
}

export async function POST(request: NextRequest) {
    try {
        const { env } = getRequestContext();
        const body = await request.json() as LoginBody;
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Missing fields', message: 'Email và mật khẩu là bắt buộc' },
                { status: 400 }
            );
        }

        const user = await env.DB.prepare(
            'SELECT id, email, username, password_hash, created_at FROM users WHERE email = ?'
        )
            .bind(email.toLowerCase())
            .first<UserRow>();

        if (!user) {
            return NextResponse.json(
                { error: 'Invalid credentials', message: 'Email hoặc mật khẩu không đúng' },
                { status: 401 }
            );
        }

        const passwordHash = await hashPassword(password);
        if (passwordHash !== user.password_hash) {
            return NextResponse.json(
                { error: 'Invalid credentials', message: 'Email hoặc mật khẩu không đúng' },
                { status: 401 }
            );
        }

        const token = await signJWT(
            { userId: user.id, email: user.email, username: user.username },
            env.JWT_SECRET
        );

        const userData = {
            id: user.id,
            email: user.email,
            username: user.username,
            created_at: user.created_at,
        };

        return new NextResponse(
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
        return NextResponse.json(
            { error: 'Server error', message: 'Đã xảy ra lỗi, vui lòng thử lại' },
            { status: 500 }
        );
    }
}
