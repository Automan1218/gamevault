// src/lib/api/interceptor.ts
import { AuthApi } from './auth';

interface ApiRequest {
  url: string;
  options: RequestInit;
}

interface ApiResponse {
  ok: boolean;
  status: number;
  data?: any;
  error?: string;
}

class ApiInterceptor {
  private static instance: ApiInterceptor;
  private isRefreshing = false;
  private refreshPromise: Promise<boolean> | null = null;

  static getInstance(): ApiInterceptor {
    if (!ApiInterceptor.instance) {
      ApiInterceptor.instance = new ApiInterceptor();
    }
    return ApiInterceptor.instance;
  }

  // Request interceptor
  async requestInterceptor(request: ApiRequest): Promise<ApiRequest> {
    const token = AuthApi.getToken();
    
    if (token) {
      request.options.headers = {
        ...request.options.headers,
        'Authorization': `Bearer ${token}`,
      };
    }

    return request;
  }

  // Response interceptor
  async responseInterceptor(response: Response, originalRequest: ApiRequest): Promise<ApiResponse> {
    // If 401 error and not login/register request, try to refresh token
    if (response.status === 401 && !this.isAuthEndpoint(originalRequest.url)) {
      console.log('Token may have expired, trying to refresh authentication...');
      
      // Prevent duplicate refresh
      if (!this.isRefreshing) {
        this.isRefreshing = true;
        this.refreshPromise = this.refreshAuth();
      }

      const refreshSuccess = await this.refreshPromise;
      
      if (refreshSuccess) {
        // Refresh successful, resend original request
        console.log('Authentication status refreshed, resending request...');
        const newToken = AuthApi.getToken();
        if (newToken) {
          originalRequest.options.headers = {
            ...originalRequest.options.headers,
            'Authorization': `Bearer ${newToken}`,
          };
          
          const retryResponse = await fetch(originalRequest.url, originalRequest.options);
          return {
            ok: retryResponse.ok,
            status: retryResponse.status,
            data: retryResponse.ok ? await retryResponse.json() : undefined,
            error: retryResponse.ok ? undefined : `Request failed: ${retryResponse.status}`,
          };
        }
      }
      
      // Refresh failed, clear authentication status
      console.log('Authentication refresh failed, clearing authentication status...');
      localStorage.removeItem('auth_token');
      this.isRefreshing = false;
      this.refreshPromise = null;
      
      // If not on login page, redirect to login page
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth/login')) {
        window.location.href = '/auth/login?redirect=' + encodeURIComponent(window.location.pathname);
      }
    }

    return {
      ok: response.ok,
      status: response.status,
      data: response.ok ? await response.json() : undefined,
      error: response.ok ? undefined : `Request failed: ${response.status}`,
    };
  }

  // Check if it's an authentication-related endpoint
  private isAuthEndpoint(url: string): boolean {
    const authEndpoints = ['/auth/login', '/auth/register', '/auth/me'];
    return authEndpoints.some(endpoint => url.includes(endpoint));
  }

  // Refresh authentication status
  private async refreshAuth(): Promise<boolean> {
    try {
      const token = AuthApi.getToken();
      if (!token) {
        return false;
      }

      // Try calling /auth/me to verify token
      const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:8080/api'}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Authentication refresh failed:', error);
      return false;
    } finally {
      this.isRefreshing = false;
    }
  }
}

export const apiInterceptor = ApiInterceptor.getInstance();

// Wrapped fetch function that automatically applies interceptors
export async function interceptedFetch(url: string, options: RequestInit = {}): Promise<ApiResponse> {
  const interceptor = ApiInterceptor.getInstance();
  
  // Apply request interceptor
  const interceptedRequest = await interceptor.requestInterceptor({ url, options });
  
  try {
    // Send request
    const response = await fetch(interceptedRequest.url, interceptedRequest.options);
    
    // Apply response interceptor
    return await interceptor.responseInterceptor(response, interceptedRequest);
  } catch (error) {
    console.error('Request failed:', error);
    return {
      ok: false,
      status: 0,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}
