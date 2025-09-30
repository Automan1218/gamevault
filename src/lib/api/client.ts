// src/lib/api/client.ts
import { ENV } from '@/config/env';
export class ApiClient {
    private baseURL: string;
    private authToken: string | null = null;

    constructor(baseURL: string) {
        this.baseURL = baseURL.replace(/\/$/, '');
    }

    setAuthToken(token: string): void {
        this.authToken = token;
        if (typeof window !== 'undefined') {
            localStorage.setItem('auth_token', token);
        }
    }

    getAuthToken(): string | null {
        if (this.authToken) return this.authToken;

        if (typeof window !== 'undefined') {
            this.authToken = localStorage.getItem('auth_token');
        }
        return this.authToken;
    }

    clearAuthToken(): void {
        this.authToken = null;
        if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
        }
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit & {
            params?: Record<string, unknown>;
        } = {}
    ): Promise<T> {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        try {
            const { params, ...requestConfig } = options;
            let url = `${this.baseURL}${endpoint}`;

            // Handle query parameters for GET requests
            if (params && Object.keys(params).length > 0) {
                const searchParams = new URLSearchParams();
                Object.entries(params).forEach(([key, value]) => {
                    if (value !== undefined && value !== null) {
                        searchParams.append(key, String(value));
                    }
                });
                if (searchParams.toString()) {
                    url += `?${searchParams.toString()}`;
                }
            }

            const token = this.getAuthToken();

            // Fix: Don't send body with GET/HEAD requests
            const method = requestConfig.method?.toUpperCase() || 'GET';
            const shouldHaveBody = !['GET', 'HEAD'].includes(method);

            const response = await fetch(url, {
                ...requestConfig,
                signal: controller.signal,
                mode: 'cors',
                credentials: 'omit',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` }),
                    ...requestConfig.headers,
                },
                // Only include body for non-GET/HEAD requests
                body: shouldHaveBody ? requestConfig.body : undefined,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                await this.handleErrorResponse(response);
            }

            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            } else {
                const text = await response.text();
                return (text ? JSON.parse(text) : {}) as T;
            }
        } catch (error) {
            clearTimeout(timeoutId);

            if (error instanceof Error) {
                if (error.name === 'AbortError') {
                    throw new Error('请求超时，请稍后重试');
                }
                throw error;
            }
            throw new Error('请求失败');
        }
    }

    private async handleErrorResponse(response: Response): Promise<never> {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
            // Response is not JSON
        }

        if (response.status === 401) {
            this.clearAuthToken();
            throw new Error('登录已过期，请重新登录');
        } else if (response.status === 403) {
            throw new Error('没有权限执行此操作');
        } else if (response.status === 404) {
            throw new Error('请求的资源不存在');
        } else if (response.status >= 500) {
            throw new Error('服务器错误，请稍后重试');
        }

        throw new Error(errorMessage);
    }

    // GET request
    async get<T>(endpoint: string, params?: Record<string, unknown>): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'GET',
            params,
        });
    }

    // POST request
    async post<T>(endpoint: string, data?: unknown): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    // PUT request
    async put<T>(endpoint: string, data?: unknown): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    // PATCH request
    async patch<T>(endpoint: string, data?: unknown): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PATCH',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    // DELETE request
    async delete<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'DELETE',
        });
    }

    // Fixed: authenticatedRequest with proper method specification
    async authenticatedRequest<T>(
        endpoint: string,
        data?: unknown,
        options: Omit<RequestInit, 'body'> & { params?: Record<string, unknown> } = {}
    ): Promise<T> {
        const token = this.getAuthToken();
        if (!token) {
            throw new Error('需要登录才能执行此操作');
        }

        // Default to POST if data is provided and no method specified
        const method = options.method || (data ? 'POST' : 'GET');

        return this.request<T>(endpoint, {
            ...options,
            method,
            body: data && !['GET', 'HEAD'].includes(method.toUpperCase())
                ? JSON.stringify(data)
                : undefined,
            headers: {
                'Authorization': `Bearer ${token}`,
                ...options.headers,
            },
        });
    }
}

export const apiClient = new ApiClient(ENV.FORUM_API_URL);