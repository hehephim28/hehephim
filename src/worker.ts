/**
 * Worker entrypoint - exports Durable Object classes and routes requests
 */
export { RoomDO } from './room-do';

interface Env {
    ROOMS: DurableObjectNamespace;
}

// Default export handles routing to Durable Objects
export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        const url = new URL(request.url);
        const path = url.pathname;

        // Add CORS headers for cross-origin WebSocket connections
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        };

        // Handle CORS preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }

        // Route /room/{roomId}/* to Durable Object
        const roomMatch = path.match(/^\/room\/([^/]+)(\/.*)?$/);
        if (roomMatch) {
            const roomId = roomMatch[1];
            const subPath = roomMatch[2] || '/';

            // Get DO instance by room ID
            const doId = env.ROOMS.idFromName(roomId);
            const stub = env.ROOMS.get(doId);

            // Build new URL for DO
            const doUrl = new URL(request.url);
            doUrl.pathname = subPath;

            // Forward request to DO
            const doRequest = new Request(doUrl.toString(), request);
            const response = await stub.fetch(doRequest);

            // Add CORS headers to response (for non-WebSocket responses)
            if (response.webSocket) {
                // WebSocket response - return as-is
                return response;
            }

            // Clone response with CORS headers
            const newHeaders = new Headers(response.headers);
            for (const [key, value] of Object.entries(corsHeaders)) {
                newHeaders.set(key, value);
            }
            return new Response(response.body, {
                status: response.status,
                statusText: response.statusText,
                headers: newHeaders,
            });
        }

        return new Response('HeHePhim DO Worker', {
            status: 200,
            headers: corsHeaders,
        });
    },
};
