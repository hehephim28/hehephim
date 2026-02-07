/**
 * M3U8 Proxy endpoint
 * Proxies M3U8 requests to bypass CORS restrictions for watch party sync
 * 
 * Usage: GET /api/proxy/m3u8?url=<encoded_m3u8_url>
 */
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// Allowed M3U8 source domains (whitelist for security)
const ALLOWED_DOMAINS = [
    'kkphimplayer6.com',
    'phim1280.tv',
    'ophim.live',
    'kkphim.com',
    // Add more trusted domains as needed
];

function isAllowedDomain(url: string): boolean {
    try {
        const urlObj = new URL(url);
        return ALLOWED_DOMAINS.some(domain => urlObj.hostname.endsWith(domain));
    } catch {
        return false;
    }
}

function rewriteM3u8Content(content: string, baseUrl: string, proxyBaseUrl: string): string {
    // Parse the base URL to get the directory
    const urlObj = new URL(baseUrl);
    const basePath = urlObj.pathname.substring(0, urlObj.pathname.lastIndexOf('/') + 1);
    const baseUrlWithPath = `${urlObj.origin}${basePath}`;

    // Replace relative URLs with proxied absolute URLs
    const lines = content.split('\n');
    const rewrittenLines = lines.map(line => {
        const trimmed = line.trim();

        // Skip empty lines and comments (except for URI in EXT-X-KEY)
        if (!trimmed || trimmed.startsWith('#')) {
            // Check for embedded URIs in tags like #EXT-X-KEY:METHOD=AES-128,URI="..."
            if (trimmed.includes('URI="')) {
                return trimmed.replace(/URI="([^"]+)"/g, (match, uri) => {
                    const absoluteUri = uri.startsWith('http') ? uri : `${baseUrlWithPath}${uri}`;
                    const proxiedUri = `${proxyBaseUrl}?url=${encodeURIComponent(absoluteUri)}`;
                    return `URI="${proxiedUri}"`;
                });
            }
            return line;
        }

        // If it's a URL (segment file or playlist)
        if (trimmed.endsWith('.ts') || trimmed.endsWith('.m3u8') || trimmed.includes('.ts?') || trimmed.includes('.m3u8?')) {
            const absoluteUrl = trimmed.startsWith('http') ? trimmed : `${baseUrlWithPath}${trimmed}`;
            // Proxy ALL URLs including .ts segments (some servers block cross-origin requests)
            return `${proxyBaseUrl}?url=${encodeURIComponent(absoluteUrl)}`;
        }

        return line;
    });

    return rewrittenLines.join('\n');
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const targetUrl = searchParams.get('url');

    if (!targetUrl) {
        return NextResponse.json(
            { error: 'Missing url parameter' },
            { status: 400 }
        );
    }

    // Decode URL
    let decodedUrl: string;
    try {
        decodedUrl = decodeURIComponent(targetUrl);
    } catch {
        return NextResponse.json(
            { error: 'Invalid URL encoding' },
            { status: 400 }
        );
    }

    // Security check: only allow whitelisted domains
    if (!isAllowedDomain(decodedUrl)) {
        return NextResponse.json(
            { error: 'Domain not allowed' },
            { status: 403 }
        );
    }

    try {
        // Fetch the content
        const response = await fetch(decodedUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': '*/*',
                'Referer': new URL(decodedUrl).origin,
            },
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: `Failed to fetch: ${response.status}` },
                { status: response.status }
            );
        }

        const contentType = response.headers.get('content-type') || '';

        // Check if it's an M3U8 playlist
        const isM3u8 = contentType.includes('mpegurl') ||
            contentType.includes('m3u8') ||
            decodedUrl.endsWith('.m3u8') ||
            decodedUrl.includes('.m3u8?');

        // Check if it's a .ts segment (binary)
        const isTS = decodedUrl.endsWith('.ts') || decodedUrl.includes('.ts?');

        if (isM3u8) {
            // M3U8 playlists: read as text and rewrite URLs
            const content = await response.text();
            const proxyBaseUrl = `${request.nextUrl.origin}/api/proxy/m3u8`;
            const rewrittenContent = rewriteM3u8Content(content, decodedUrl, proxyBaseUrl);

            return new NextResponse(rewrittenContent, {
                status: 200,
                headers: {
                    'Content-Type': 'application/vnd.apple.mpegurl',
                    'Access-Control-Allow-Origin': '*',
                    'Cache-Control': 'public, max-age=5',
                },
            });
        }

        if (isTS) {
            // TS segments: read as binary and stream directly
            const buffer = await response.arrayBuffer();

            return new NextResponse(buffer, {
                status: 200,
                headers: {
                    'Content-Type': 'video/mp2t',
                    'Access-Control-Allow-Origin': '*',
                    'Cache-Control': 'public, max-age=3600',
                },
            });
        }

        // For other content, return as-is
        const content = await response.text();
        return new NextResponse(content, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'public, max-age=300',
            },
        });

    } catch (error: any) {
        console.error('Proxy error:', error);
        return NextResponse.json(
            { error: 'Proxy request failed', details: error.message },
            { status: 500 }
        );
    }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Max-Age': '86400',
        },
    });
}
