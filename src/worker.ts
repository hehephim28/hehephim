/**
 * Worker entrypoint - exports Durable Object classes
 * Required for Cloudflare to recognize DO classes
 */
export { RoomDO } from './room-do';

// Default export required for ES Module workers
export default {
    async fetch(request: Request, env: any): Promise<Response> {
        // This worker only provides Durable Objects
        // All routing is handled by Pages Functions
        return new Response('HeHePhim DO Worker', { status: 200 });
    },
};
