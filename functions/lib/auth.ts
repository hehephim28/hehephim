/**
 * Auth utilities for Cloudflare Workers
 * Uses Web Crypto API for password hashing and JWT
 */

import type { Env, User, UserWithHash } from './types';

// ============ Password Hashing (PBKDF2) ============

const SALT_LENGTH = 16;
const ITERATIONS = 100000;
const KEY_LENGTH = 32;

/**
 * Generate a random salt
 */
function generateSalt(): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
}

/**
 * Convert ArrayBuffer to hex string
 */
function bufferToHex(buffer: ArrayBuffer): string {
    return Array.from(new Uint8Array(buffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
}

/**
 * Convert hex string to Uint8Array
 */
function hexToBuffer(hex: string): Uint8Array {
    const matches = hex.match(/.{1,2}/g) || [];
    return new Uint8Array(matches.map((byte) => parseInt(byte, 16)));
}

/**
 * Hash password using PBKDF2
 * Returns: salt$hash (both as hex)
 */
export async function hashPassword(password: string): Promise<string> {
    const salt = generateSalt();
    const encoder = new TextEncoder();

    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        'PBKDF2',
        false,
        ['deriveBits']
    );

    const derivedBits = await crypto.subtle.deriveBits(
        {
            name: 'PBKDF2',
            salt,
            iterations: ITERATIONS,
            hash: 'SHA-256',
        },
        keyMaterial,
        KEY_LENGTH * 8
    );

    return `${bufferToHex(salt)}$${bufferToHex(derivedBits)}`;
}

/**
 * Verify password against stored hash
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
    const [saltHex, hashHex] = storedHash.split('$');
    if (!saltHex || !hashHex) return false;

    const salt = hexToBuffer(saltHex);
    const encoder = new TextEncoder();

    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        'PBKDF2',
        false,
        ['deriveBits']
    );

    const derivedBits = await crypto.subtle.deriveBits(
        {
            name: 'PBKDF2',
            salt,
            iterations: ITERATIONS,
            hash: 'SHA-256',
        },
        keyMaterial,
        KEY_LENGTH * 8
    );

    const derivedHex = bufferToHex(derivedBits);
    return derivedHex === hashHex;
}

// ============ JWT (Simple implementation) ============

interface JWTPayload {
    userId: string;
    email: string;
    username: string;
    exp: number;
    iat: number;
}

/**
 * Base64url encode
 */
function base64urlEncode(data: string | ArrayBuffer): string {
    const str = typeof data === 'string'
        ? btoa(data)
        : btoa(String.fromCharCode(...new Uint8Array(data)));
    return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Base64url decode
 */
function base64urlDecode(str: string): string {
    const padded = str + '='.repeat((4 - (str.length % 4)) % 4);
    const base64 = padded.replace(/-/g, '+').replace(/_/g, '/');
    return atob(base64);
}

/**
 * Sign JWT token
 */
export async function signJWT(
    payload: { userId: string; email: string; username: string },
    secret: string,
    expiresInHours: number = 24 * 7 // 7 days default
): Promise<string> {
    const header = { alg: 'HS256', typ: 'JWT' };
    const now = Math.floor(Date.now() / 1000);

    const fullPayload: JWTPayload = {
        ...payload,
        iat: now,
        exp: now + expiresInHours * 3600,
    };

    const headerB64 = base64urlEncode(JSON.stringify(header));
    const payloadB64 = base64urlEncode(JSON.stringify(fullPayload));
    const message = `${headerB64}.${payloadB64}`;

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
    const signatureB64 = base64urlEncode(signature);

    return `${message}.${signatureB64}`;
}

/**
 * Verify and decode JWT token
 */
export async function verifyJWT(token: string, secret: string): Promise<JWTPayload | null> {
    try {
        const [headerB64, payloadB64, signatureB64] = token.split('.');
        if (!headerB64 || !payloadB64 || !signatureB64) return null;

        const message = `${headerB64}.${payloadB64}`;
        const encoder = new TextEncoder();

        const key = await crypto.subtle.importKey(
            'raw',
            encoder.encode(secret),
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['verify']
        );

        // Decode signature
        const sigPadded = signatureB64 + '='.repeat((4 - (signatureB64.length % 4)) % 4);
        const sigBase64 = sigPadded.replace(/-/g, '+').replace(/_/g, '/');
        const sigBinary = atob(sigBase64);
        const signature = new Uint8Array(sigBinary.length);
        for (let i = 0; i < sigBinary.length; i++) {
            signature[i] = sigBinary.charCodeAt(i);
        }

        const isValid = await crypto.subtle.verify(
            'HMAC',
            key,
            signature,
            encoder.encode(message)
        );

        if (!isValid) return null;

        const payload: JWTPayload = JSON.parse(base64urlDecode(payloadB64));

        // Check expiration
        if (payload.exp < Math.floor(Date.now() / 1000)) {
            return null;
        }

        return payload;
    } catch {
        return null;
    }
}

// ============ Request Helpers ============

/**
 * Extract token from Authorization header or cookie
 */
export function extractToken(request: Request): string | null {
    // Try Authorization header first
    const authHeader = request.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
        return authHeader.slice(7);
    }

    // Try cookie
    const cookies = request.headers.get('Cookie') || '';
    const match = cookies.match(/auth_token=([^;]+)/);
    return match ? match[1] : null;
}

/**
 * Get authenticated user from request
 */
export async function getUser(
    request: Request,
    env: Env
): Promise<User | null> {
    const token = extractToken(request);
    if (!token) return null;

    const payload = await verifyJWT(token, env.JWT_SECRET);
    if (!payload) return null;

    // Optionally verify user still exists in DB
    const user = await env.DB.prepare(
        'SELECT id, email, username, created_at FROM users WHERE id = ?'
    )
        .bind(payload.userId)
        .first<User>();

    return user;
}

/**
 * Require authentication - returns user or error response
 */
export async function requireAuth(
    request: Request,
    env: Env
): Promise<{ user: User } | { error: Response }> {
    const user = await getUser(request, env);

    if (!user) {
        return {
            error: Response.json(
                { error: 'Unauthorized', message: 'Bạn cần đăng nhập' },
                { status: 401 }
            ),
        };
    }

    return { user };
}

// ============ Validation Helpers ============

export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export function isValidUsername(username: string): boolean {
    // 3-30 chars, alphanumeric and underscore only
    const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
    return usernameRegex.test(username);
}

export function isValidPassword(password: string): boolean {
    // Minimum 6 characters
    return password.length >= 6;
}

// ============ Response Helpers ============

export function createAuthCookie(token: string): string {
    // Max age: 7 days
    const maxAge = 7 * 24 * 60 * 60;
    return `auth_token=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`;
}

export function clearAuthCookie(): string {
    return 'auth_token=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0';
}

/**
 * Generate a random short ID for rooms
 */
export function generateRoomId(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let result = '';
    const randomValues = crypto.getRandomValues(new Uint8Array(6));
    for (let i = 0; i < 6; i++) {
        result += chars[randomValues[i] % chars.length];
    }
    return result;
}

/**
 * Generate UUID v4
 */
export function generateUserId(): string {
    return crypto.randomUUID();
}
