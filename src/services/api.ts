import axios, { AxiosError } from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';
import { API_BASE_URL } from '../constants/api';

// Error response interface
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

// Create base API client
class ApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string = API_BASE_URL) {
    this.client = axios.create({
      baseURL,
      timeout: 30000, // 30 seconds timeout - phimapi.com can be slow
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add request timestamp for debugging
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('❌ API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log(`✅ API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error: AxiosError) => {
        const apiError = this.handleError(error);
        console.error('❌ API Response Error:', apiError);
        return Promise.reject(apiError);
      }
    );
  }

  private handleError(error: AxiosError): ApiError {
    if (error.response) {
      // Server responded with error status
      return {
        message: (error.response.data as any)?.msg || error.message || 'Server error occurred',
        status: error.response.status,
        code: error.code,
      };
    } else if (error.request) {
      // Request was made but no response received
      return {
        message: 'Network error - unable to reach server',
        code: error.code,
      };
    } else {
      // Something else happened
      return {
        message: error.message || 'An unexpected error occurred',
        code: error.code,
      };
    }
  }

  // Generic GET method with retry logic
  async get<T>(url: string, params?: Record<string, any>, retries = 2): Promise<T> {
    try {
      const response = await this.client.get<T>(url, { params });
      return response.data;
    } catch (error) {
      if (retries > 0 && this.isRetryableError(error)) {
        console.log(`⚠️ Retrying request to ${url}, attempts left: ${retries}`);
        await this.delay(1000 * (3 - retries)); // Progressive delay
        return this.get<T>(url, params, retries - 1);
      }
      throw error;
    }
  }

  // Check if error is retryable
  private isRetryableError(error: any): boolean {
    return error.code === 'ECONNRESET' || 
           error.code === 'ETIMEDOUT' || 
           error.code === 'ENOTFOUND' ||
           (error.response && error.response.status >= 500);
  }

  // Delay utility
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Generic POST method
  async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.post<T>(url, data);
    return response.data;
  }

  // Generic PUT method
  async put<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.put<T>(url, data);
    return response.data;
  }

  // Generic DELETE method
  async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete<T>(url);
    return response.data;
  }

  // Get optimized image URL
  getOptimizedImageUrl(originalUrl: string): string {
    if (!originalUrl) return '';
    
    // Use PhimAPI's WebP conversion service
    return `${API_BASE_URL}/image.php?url=${encodeURIComponent(originalUrl)}`;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export class for testing
export { ApiClient };
