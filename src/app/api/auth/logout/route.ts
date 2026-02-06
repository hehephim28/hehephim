/**
 * POST /api/auth/logout - User logout
 */
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST() {
    return new NextResponse(
        JSON.stringify({ success: true }),
        {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Set-Cookie': 'auth_token=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0',
            },
        }
    );
}
