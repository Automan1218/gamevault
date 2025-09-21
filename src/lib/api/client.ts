// src/api/client.ts
import { ENV } from '@/config/env';

// Request configuration
interface RequestConfig extends RequestInit {
    timeout?: number;
}

// API Client class
export class ApiClient {
    private baseURL: string;
    private defaultTimeout: number;

    constructor() {
        this.baseURL = ENV.FORUM_API_URL;
        this.defaultTimeout = ENV.API_TIMEOUT;
    }

    // Generic request method with error handling
    private async request<T>(
        endpoint: string,
        config: RequestConfig = {}
    ): Promise<T> {
        const { timeout = this.defaultTimeout, ...requestConfig } = config;

        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                ...requestConfig,
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                    ...requestConfig.headers,
                },
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                    errorData.message ||
                    `HTTP error! status: ${response.status}`
                );
            }

            return await response.json();
        } catch (error) {
            clearTimeout(timeoutId);

            // 正确处理 unknown 类型的 error
            if (error instanceof Error) {
                if (error.name === 'AbortError') {
                    throw new Error('Request timeout');
                }
                console.error(`API request failed: ${endpoint}`, error.message);
                throw error;
            } else {
                // 处理非 Error 类型的错误
                console.error(`API request failed: ${endpoint}`, error);
                throw new Error('An unexpected error occurred');
            }
        }
    }

    // GET request
    async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
        const url = params ? `${endpoint}?${new URLSearchParams(params)}` : endpoint;
        return this.request<T>(url, { method: 'GET' });
    }

    // POST request
    async post<T>(endpoint: string, data?: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    // PUT request
    async put<T>(endpoint: string, data?: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    // DELETE request
    async delete<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: 'DELETE' });
    }

    // PATCH request
    async patch<T>(endpoint: string, data?: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PATCH',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    // Set authorization header
    setAuthToken(token: string) {
        // Store token for future requests
        localStorage.setItem('auth_token', token);
    }

    // Get authorization header
    private getAuthHeaders(): Record<string, string> {
        const token = localStorage.getItem('auth_token');
        return token ? { Authorization: `Bearer ${token}` } : {};
    }

    // Authenticated request
    async authenticatedRequest<T>(
        endpoint: string,
        config: RequestConfig = {}
    ): Promise<T> {
        const authHeaders = this.getAuthHeaders();
        return this.request<T>(endpoint, {
            ...config,
            headers: {
                ...authHeaders,
                ...config.headers,
            },
        });
    }
}

// Create singleton instance
export const apiClient = new ApiClient();