/**
 * POST /api/auth/register - User registration
 */
import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

// Simple password hashing using Web Crypto API
async function hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Generate JWT using Web Crypto API
async function signJWT(payload: object, secret: string): Promise<string> {
    const header = { alg: 'HS256', typ: 'JWT' };
    const now = Math.floor(Date.now() / 1000);
    const exp = now + 7 * 24 * 60 * 60; // 7 days

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

function generateUserId(): string {
    return crypto.randomUUID();
}

function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidUsername(username: string): boolean {
    return /^[a-zA-Z0-9_]{3,30}$/.test(username);
}

function isValidPassword(password: string): boolean {
    return password.length >= 6;
}

function createAuthCookie(token: string): string {
    const maxAge = 7 * 24 * 60 * 60;
    return `auth_token=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${maxAge}`;
}

interface RegisterBody {
    email: string;
    password: string;
    username: string;
}

export async function POST(request: NextRequest) {
    try {
        const { env } = getRequestContext();
        const body = await request.json() as RegisterBody;
        const { email, password, username } = body;

        // Validate input
        if (!email || !password || !username) {
            return NextResponse.json(
                { error: 'Missing fields', message: 'Email, mật khẩu và tên người dùng là bắt buộc' },
                { status: 400 }
            );
        }

        if (!isValidEmail(email)) {
            return NextResponse.json(
                { error: 'Invalid email', message: 'Email không hợp lệ' },
                { status: 400 }
            );
        }

        if (!isValidUsername(username)) {
            return NextResponse.json(
                { error: 'Invalid username', message: 'Tên người dùng phải từ 3-30 ký tự, chỉ chứa chữ cái, số và dấu gạch dưới' },
                { status: 400 }
            );
        }

        if (!isValidPassword(password)) {
            return NextResponse.json(
                { error: 'Invalid password', message: 'Mật khẩu phải có ít nhất 6 ký tự' },
                { status: 400 }
            );
        }

        // Check if email or username already exists
        const existingUser = await env.DB.prepare(
            'SELECT id FROM users WHERE email = ? OR username = ?'
        )
            .bind(email.toLowerCase(), username.toLowerCase())
            .first();

        if (existingUser) {
            return NextResponse.json(
                { error: 'User exists', message: 'Email hoặc tên người dùng đã tồn tại' },
                { status: 409 }
            );
        }

        // Hash password and create user
        const passwordHash = await hashPassword(password);
        const userId = generateUserId();
        const createdAt = Date.now();

        await env.DB.prepare(
            'INSERT INTO users (id, email, username, password_hash, created_at) VALUES (?, ?, ?, ?, ?)'
        )
            .bind(userId, email.toLowerCase(), username, passwordHash, createdAt)
            .run();

        // Generate JWT
        const token = await signJWT(
            { userId, email: email.toLowerCase(), username },
            env.JWT_SECRET
        );

        const user = {
            id: userId,
            email: email.toLowerCase(),
            username,
            created_at: createdAt,
        };

        return new NextResponse(
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
        return NextResponse.json(
            { error: 'Server error', message: 'Đã xảy ra lỗi, vui lòng thử lại' },
            { status: 500 }
        );
    }
}
