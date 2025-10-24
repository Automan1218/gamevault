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

            // Check if it's FormData, don't set Content-Type if so
            const isFormData = requestConfig.body instanceof FormData;
            const defaultHeaders: Record<string, string> = isFormData 
                ? { 'Accept': 'application/json' }
                : { 'Content-Type': 'application/json', 'Accept': 'application/json' };

            const headers: Record<string, string> = {
                ...defaultHeaders,
                ...(token && { 'Authorization': `Bearer ${token}` }),
                ...(requestConfig.headers as Record<string, string>),
            };

            const response = await fetch(url, {
                ...requestConfig,
                signal: controller.signal,
                mode: 'cors',
                credentials: 'omit',
                headers,
                // Only include body for non-GET/HEAD requests
                body: shouldHaveBody ? requestConfig.body : undefined,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                await this.handleErrorResponse(response);
            }

            const contentType = response.headers.get('content-type');
            let jsonData;
            if (contentType && contentType.includes('application/json')) {
                jsonData = await response.json();
            } else {
                const text = await response.text();
                jsonData = text ? JSON.parse(text) : {};
            }

            // Handle backend BaseResponse wrapper format
            // If response contains code and data fields, extract data
            if (jsonData && typeof jsonData === 'object' && 'code' in jsonData && 'data' in jsonData) {
                if (jsonData.code === 0) {
                    return jsonData.data as T;
                } else {
                    // Handle business errors
                    throw new Error(jsonData.message || 'Request failed');
                }
            }

            return jsonData as T;
        } catch (error) {
            clearTimeout(timeoutId);

            if (error instanceof Error) {
                if (error.name === 'AbortError') {
                    throw new Error('Request timeout, please try again later');
                }
                throw error;
            }
            throw new Error('Request failed');
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
            throw new Error('Login expired, please login again');
        } else if (response.status === 403) {
            throw new Error('No permission to perform this operation');
        } else if (response.status === 404) {
            throw new Error('Requested resource does not exist');
        } else if (response.status >= 500) {
            throw new Error('Server error, please try again later');
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
    async post<T>(endpoint: string, data?: unknown, options: RequestInit & { params?: Record<string, unknown> } = {}): Promise<T> {
        const { params, ...requestConfig } = options;
        
        // If it's FormData, don't set Content-Type, let browser set it automatically
        const isFormData = data instanceof FormData;
        const headers = isFormData 
            ? { ...requestConfig.headers }
            : { 
                'Content-Type': 'application/json',
                ...requestConfig.headers 
              };
        
        return this.request<T>(endpoint, {
            method: 'POST',
            body: data ? (isFormData ? data : JSON.stringify(data)) : undefined,
            headers,
            params,
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
            throw new Error('Login required to perform this operation');
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

// Authentication service client - for user authentication, profiles, order queries, game library, etc.
export const authApiClient = new ApiClient(ENV.AUTH_API_URL);

// Shop service client - for game store, shopping cart, payment, activation codes, etc.
export const shopApiClient = new ApiClient(ENV.SHOP_API_URL);

// Forum service client - for forum posts, replies, likes, etc.
export const forumApiClient = new ApiClient(ENV.FORUM_API_URL);

// Chatroom service client - for group chats, friends, messages, etc.
export const chatroomApiClient = new ApiClient(ENV.CHATROOM_API_URL);

// File service client - for file upload, download, management, etc.
export const fileApiClient = new ApiClient(ENV.FILE_API_URL);

// Default API client (maintain backward compatibility, uses authentication service)
export const apiClient = authApiClient;