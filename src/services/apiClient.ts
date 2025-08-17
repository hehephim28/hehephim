import { API_BASE_URL } from '../constants/api';

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

type Json = Record<string, any> | any[] | null;

function buildUrl(baseURL: string, path: string, params?: Record<string, any>) {
  const isAbs = /^https?:\/\//i.test(path);
  const url = new URL(isAbs ? path : `${baseURL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v === undefined || v === null) return;
      if (Array.isArray(v)) v.forEach(item => url.searchParams.append(k, String(item)));
      else url.searchParams.set(k, String(v));
    });
  }
  return url.toString();
}

function sleep(ms: number) {
  return new Promise(res => setTimeout(res, ms));
}

function isRetryable(status?: number, err?: unknown) {
  // Retry network errors (TypeError from fetch) & 429/5xx
  if (err instanceof TypeError) return true;
  if (!status) return false;
  return status === 429 || status >= 500;
}

export class ApiClient {
  constructor(private baseURL: string = API_BASE_URL) {}

  private async fetchWithRetry<T = Json>(
    path: string,
    init: RequestInit = {},
    retries = 2
  ): Promise<T> {
    const controller = new AbortController();
    const timeout = (init as any).__timeoutMs ?? 15000; // 15s mặc định
    const id = setTimeout(() => controller.abort(), timeout);

    // Gộp headers—đừng set User-Agent ở Edge
    const headers: HeadersInit = {
      Accept: 'application/json',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...(init.headers || {}),
    };

    const url = buildUrl(this.baseURL, path, (init as any).__params);

    try {
      const res = await fetch(url, { ...init, headers, signal: controller.signal });

      // 204/205 → không có body
      if (res.status === 204 || res.status === 205) return undefined as T;

      if (!res.ok) {
        // đọc text để debug khi backend trả HTML/ lỗi khác JSON
        const text = await res.text().catch(() => '');
        const err: ApiError = {
          message: `HTTP ${res.status}: ${res.statusText}${text ? ` – ${text.slice(0, 200)}` : ''}`,
          status: res.status,
          code: String(res.status),
        };
        if (retries > 0 && isRetryable(res.status)) {
          const attempt = 3 - retries + 1;
          const delay = Math.min(1000 * attempt + Math.random() * 250, 3000);
          await sleep(delay);
          return this.fetchWithRetry<T>(path, init, retries - 1);
        }
        throw err;
      }

      // Cố parse JSON, fallback text
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        return (await res.json()) as T;
      }
      // nếu backend không trả JSON như kỳ vọng:
      return (await res.text()) as unknown as T;
    } catch (e: any) {
      // Abort / network
      const netErr: ApiError = {
        message: e?.name === 'AbortError' ? 'Request timeout' : (e?.message || 'Network error'),
        code: e?.name === 'AbortError' ? 'TIMEOUT' : 'NETWORK_ERROR',
      };
      if (retries > 0 && isRetryable(undefined, e)) {
        const attempt = 3 - retries + 1;
        const delay = Math.min(1000 * attempt + Math.random() * 250, 3000);
        await sleep(delay);
        return this.fetchWithRetry<T>(path, init, retries - 1);
      }
      throw netErr;
    } finally {
      clearTimeout(id);
    }
  }

  // GET
  get<T = Json>(path: string, params?: Record<string, any>, init?: Omit<RequestInit, 'method'>) {
    return this.fetchWithRetry<T>(path, { ...init, method: 'GET', __params: params } as any);
  }

  // POST
  post<T = Json>(path: string, data?: any, init?: Omit<RequestInit, 'method' | 'body'>) {
    return this.fetchWithRetry<T>(path, {
      ...init,
      method: 'POST',
      body: data !== undefined ? JSON.stringify(data) : undefined,
    });
  }

  // PUT
  put<T = Json>(path: string, data?: any, init?: Omit<RequestInit, 'method' | 'body'>) {
    return this.fetchWithRetry<T>(path, {
      ...init,
      method: 'PUT',
      body: data !== undefined ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE
  delete<T = Json>(path: string, init?: Omit<RequestInit, 'method'>) {
    return this.fetchWithRetry<T>(path, { ...init, method: 'DELETE' });
  }

  // Ảnh: KHÔNG dùng /_next/image trên Cloudflare Pages (unoptimized)
  getOptimizedImageUrl(originalUrl: string): string {
    if (!originalUrl) return '';
    // Giữ nguyên URL gốc để Cloudflare CDN cache
    return originalUrl;
  }
}

// Singleton
export const apiClient = new ApiClient();
