// src/lib/api/client.ts
import { ENV } from '@/config/env';

interface RequestConfig extends RequestInit {
    timeout?: number;
}

export class ApiClient {
    private baseURL: string;
    private defaultTimeout: number;
    private authToken: string | null = null;
    constructor() {

        this.baseURL = ENV.FORUM_API_URL;
        this.defaultTimeout = ENV.API_TIMEOUT;

        // 调试日志
        console.log('[API Client] Initialized with:', {
            baseURL: this.baseURL,
            timeout: this.defaultTimeout
        });
    }

    private async request<T>(
        endpoint: string,
        config: RequestConfig = {}
    ): Promise<T> {
        const { timeout = this.defaultTimeout, ...requestConfig } = config;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const url = `${this.baseURL}${endpoint}`;
        console.log('[API Request]', requestConfig.method || 'GET', url); // 调试日志

        try {
            const token = this.getAuthToken();

            const response = await fetch(url, {
                ...requestConfig,
                signal: controller.signal,
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                    ...requestConfig.headers,
                },
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                let errorMessage = `HTTP error! status: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch {
                    // 无法解析错误响应
                }
                console.error('[API Error]', url, errorMessage);
                throw new Error(errorMessage);
            }

            const text = await response.text();
            if (!text) {
                return {} as T;
            }

            try {
                return JSON.parse(text);
            } catch {
                console.warn('[API Warning] Response is not JSON:', text);
                return text as unknown as T;
            }
        } catch (error) {
            clearTimeout(timeoutId);

            if (error instanceof Error) {
                if (error.name === 'AbortError') {
                    throw new Error('请求超时');
                }
                if (error.message.includes('Failed to fetch')) {
                    console.error('[API Error] CORS/Network error:', error);
                    throw new Error('无法连接到服务器，请检查网络或联系管理员');
                }
                throw error;
            }

            throw new Error('发生未知错误');
        }
    }

    async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
        const url = params ? `${endpoint}?${new URLSearchParams(params)}` : endpoint;
        return this.request<T>(url, { method: 'GET' });
    }

    async post<T>(endpoint: string, data?: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    async put<T>(endpoint: string, data?: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    async delete<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: 'DELETE' });
    }

    async patch<T>(endpoint: string, data?: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PATCH',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    // Token 管理
    setAuthToken(token: string) {
        this.authToken = token;
        if (typeof window !== 'undefined') {
            localStorage.setItem('auth_token', token);
            console.log('[Auth] Token saved');
        }
    }

    getAuthToken(): string | null {
        if (this.authToken) return this.authToken;
        if (typeof window !== 'undefined') {
            return localStorage.getItem('auth_token');
        }
        return null;
    }

    clearAuthToken() {
        this.authToken = null;
        if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
            console.log('[Auth] Token cleared');
        }
    }

    isAuthenticated(): boolean {
        return !!this.getAuthToken();
    }

    // 需要认证的请求
    async authenticatedRequest<T>(
        endpoint: string,
        config: RequestConfig = {}
    ): Promise<T> {
        const token = this.getAuthToken();
        if (!token) {
            throw new Error('未登录，请先登录');
        }

        return this.request<T>(endpoint, {
            ...config,
            headers: {
                'Authorization': `Bearer ${token}`,
                ...config.headers,
            },
        });
    }
}

export const apiClient = new ApiClient();