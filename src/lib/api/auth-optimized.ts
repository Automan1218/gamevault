// src/lib/api/auth-optimized.ts
import { ENV } from '@/config/env';
import { User, LoginRequest, RegisterRequest, LoginResponse, ChangePasswordRequest, ChangeEmailRequest } from '@/types/api';

export class AuthApiOptimized {
    // 获取token
    static getToken(): string | null {
        if (typeof window === 'undefined') {
            return null;
        }
        return localStorage.getItem('auth_token');
    }

    // 优化的认证请求方法，使用拦截器
    private static async authRequest<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${ENV.AUTH_API_URL}${endpoint}`;
        
        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...options.headers,
                },
            });

            if (!response.ok) {
                let errorMessage = `请求失败: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch {
                    // 无法解析错误响应
                }
                throw new Error(errorMessage);
            }

            const text = await response.text();
            if (!text) return {} as T;

            return JSON.parse(text);
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('网络请求失败');
        }
    }

    // 登录
    static async login(credentials: LoginRequest): Promise<LoginResponse> {
        const response = await this.authRequest<LoginResponse>('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });
        return response;
    }

    // 注册
    static async register(userData: RegisterRequest): Promise<LoginResponse> {
        const response = await this.authRequest<LoginResponse>('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
        return response;
    }

    // 获取当前用户信息（带token）
    static async getCurrentUser(): Promise<User> {
        const token = this.getToken();
        if (!token) {
            throw new Error('未找到认证token');
        }

        const response = await this.authRequest<User>('/auth/me', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        return response;
    }

    // 登出
    static async logout(): Promise<void> {
        try {
            await this.authRequest('/auth/logout', {
                method: 'POST',
            });
        } catch (error) {
            console.warn('登出API调用失败:', error);
            // 即使API调用失败，也要清除本地token
        } finally {
            localStorage.removeItem('auth_token');
        }
    }

    // 检查邮箱是否已存在
    static async checkEmail(email: string): Promise<{ exists: boolean }> {
        return this.authRequest<{ exists: boolean }>(`/auth/check-email?email=${encodeURIComponent(email)}`);
    }

    // 检查用户名是否已存在
    static async checkUsername(username: string): Promise<{ exists: boolean }> {
        return this.authRequest<{ exists: boolean }>(`/auth/check-username?username=${encodeURIComponent(username)}`);
    }

    // 修改密码
    static async changePassword(request: ChangePasswordRequest): Promise<void> {
        const token = this.getToken();
        if (!token) {
            throw new Error('未找到认证token');
        }

        await this.authRequest('/auth/change-password', {
            method: 'POST',
            body: JSON.stringify(request),
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
    }

    // 修改邮箱
    static async changeEmail(request: ChangeEmailRequest): Promise<void> {
        const token = this.getToken();
        if (!token) {
            throw new Error('未找到认证token');
        }

        await this.authRequest('/auth/change-email', {
            method: 'POST',
            body: JSON.stringify(request),
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
    }

    // 验证邮箱
    static async verifyEmail(token: string): Promise<void> {
        const response = await fetch(`${ENV.AUTH_API_URL}/auth/verify-email?token=${encodeURIComponent(token)}`, {
            method: 'GET',
        });

        if (!response.ok) {
            throw new Error('邮箱验证失败');
        }
    }

    // 简化的认证检查（仅检查token存在性）
    static isAuthenticatedSync(): boolean {
        if (typeof window === 'undefined') {
            return false;
        }
        return !!this.getToken();
    }

    // 异步认证检查（仅在需要时调用）
    static async isAuthenticated(): Promise<boolean> {
        if (typeof window === 'undefined') {
            return false;
        }
        
        const token = this.getToken();
        if (!token) {
            return false;
        }

        try {
            await this.getCurrentUser();
            return true;
        } catch (error) {
            localStorage.removeItem('auth_token');
            return false;
        }
    }
}
