/**
 * TypeScript types for Cloudflare Pages Functions environment
 */

export interface Env {
    DB: D1Database;
    ROOMS: DurableObjectNamespace;
    JWT_SECRET: string;
}

export interface User {
    id: string;
    email: string;
    username: string;
    created_at: number;
}

export interface UserWithHash extends User {
    password_hash: string;
}

export type AppPagesFunction<P extends string = any> = PagesFunction<Env, P>;
