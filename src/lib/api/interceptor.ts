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

  // 请求拦截器
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

  // 响应拦截器
  async responseInterceptor(response: Response, originalRequest: ApiRequest): Promise<ApiResponse> {
    // 如果是401错误且不是登录/注册请求，尝试刷新token
    if (response.status === 401 && !this.isAuthEndpoint(originalRequest.url)) {
      console.log('Token可能已过期，尝试刷新认证状态...');
      
      // 防止重复刷新
      if (!this.isRefreshing) {
        this.isRefreshing = true;
        this.refreshPromise = this.refreshAuth();
      }

      const refreshSuccess = await this.refreshPromise;
      
      if (refreshSuccess) {
        // 刷新成功，重新发送原请求
        console.log('认证状态已刷新，重新发送请求...');
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
            error: retryResponse.ok ? undefined : `请求失败: ${retryResponse.status}`,
          };
        }
      }
      
      // 刷新失败，清除认证状态
      console.log('认证刷新失败，清除认证状态...');
      localStorage.removeItem('auth_token');
      this.isRefreshing = false;
      this.refreshPromise = null;
      
      // 如果不是在登录页面，重定向到登录页
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth/login')) {
        window.location.href = '/auth/login?redirect=' + encodeURIComponent(window.location.pathname);
      }
    }

    return {
      ok: response.ok,
      status: response.status,
      data: response.ok ? await response.json() : undefined,
      error: response.ok ? undefined : `请求失败: ${response.status}`,
    };
  }

  // 检查是否是认证相关的端点
  private isAuthEndpoint(url: string): boolean {
    const authEndpoints = ['/auth/login', '/auth/register', '/auth/me'];
    return authEndpoints.some(endpoint => url.includes(endpoint));
  }

  // 刷新认证状态
  private async refreshAuth(): Promise<boolean> {
    try {
      const token = AuthApi.getToken();
      if (!token) {
        return false;
      }

      // 尝试调用 /auth/me 来验证token
      const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:8080/api'}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      return response.ok;
    } catch (error) {
      console.error('认证刷新失败:', error);
      return false;
    } finally {
      this.isRefreshing = false;
    }
  }
}

export const apiInterceptor = ApiInterceptor.getInstance();

// 封装的fetch函数，自动应用拦截器
export async function interceptedFetch(url: string, options: RequestInit = {}): Promise<ApiResponse> {
  const interceptor = ApiInterceptor.getInstance();
  
  // 应用请求拦截器
  const interceptedRequest = await interceptor.requestInterceptor({ url, options });
  
  try {
    // 发送请求
    const response = await fetch(interceptedRequest.url, interceptedRequest.options);
    
    // 应用响应拦截器
    return await interceptor.responseInterceptor(response, interceptedRequest);
  } catch (error) {
    console.error('请求失败:', error);
    return {
      ok: false,
      status: 0,
      error: error instanceof Error ? error.message : '网络错误',
    };
  }
}
