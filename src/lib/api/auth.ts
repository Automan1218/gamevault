// src/api/auth.ts
import { apiClient } from './client';
import {
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    User
} from '@/types/api';
import { ENV } from '@/config/env';

export class AuthApi {
    private static async authRequest<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${ENV.AUTH_API_URL}${endpoint}`;
        console.log('Auth request to:', url);

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
                let errorMessage = `认证失败: ${response.status}`;
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
                console.error('Auth request failed:', error);
                throw error;
            }
            throw new Error('认证请求失败');
        }
    }
    // User login
    static async login(credentials: LoginRequest): Promise<LoginResponse> {
        try {
            const response = await this.authRequest<LoginResponse>('/auth/login', {
                method: 'POST',
                body: JSON.stringify(credentials)
            });
            // Store token in client
            if (response.token) {
                apiClient.setAuthToken(response.token);
            }

            return response;
        } catch (error) {
            console.error('Login failed:', error);
            throw new Error('登录失败，请检查用户名和密码');
        }
    }

    // User registration
    static async register(userData: RegisterRequest): Promise<LoginResponse> {
        try {
            const response = await this.authRequest<LoginResponse>('/auth/register', {
                method: 'POST',
                body: JSON.stringify(userData)
            });

            // Store token in client
            if (response.token) {
                apiClient.setAuthToken(response.token);
            }

            return response;
        } catch (error) {
            console.error('Registration failed:', error);
            throw new Error('注册失败，请检查输入信息');
        }
    }

    // User logout
    static async logout(): Promise<void> {
        try {
            await apiClient.post('/auth/logout');
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            // Always clear local token
            localStorage.removeItem('auth_token');
        }
    }

    // Get current user info
    static async getCurrentUser(): Promise<User> {
        try {
            const response = await apiClient.authenticatedRequest<User>('/auth/me');
            return response;
        } catch (error) {
            console.error('Failed to get current user:', error);
            throw new Error('获取用户信息失败');
        }
    }

    // Refresh token
    static async refreshToken(): Promise<LoginResponse> {
        try {
            const response = await apiClient.authenticatedRequest<LoginResponse>('/auth/refresh');

            // Update token in client
            if (response.token) {
                apiClient.setAuthToken(response.token);
            }

            return response;
        } catch (error) {
            console.error('Token refresh failed:', error);
            throw new Error('令牌刷新失败');
        }
    }

    // Change password
    static async changePassword(oldPassword: string, newPassword: string): Promise<void> {
        try {
            await apiClient.authenticatedRequest('/auth/change-password', {
                method: 'PUT',
                body: JSON.stringify({ oldPassword, newPassword }),
            });
        } catch (error) {
            console.error('Password change failed:', error);
            throw new Error('密码修改失败');
        }
    }

    // Reset password request
    static async requestPasswordReset(email: string): Promise<void> {
        try {
            await apiClient.post('/auth/reset-password', { email });
        } catch (error) {
            console.error('Password reset request failed:', error);
            throw new Error('密码重置请求失败');
        }
    }

    // Verify email
    static async verifyEmail(token: string): Promise<void> {
        try {
            await apiClient.post('/auth/verify-email', { token });
        } catch (error) {
            console.error('Email verification failed:', error);
            throw new Error('邮箱验证失败');
        }
    }

    // Check if user is authenticated
    static isAuthenticated(): boolean {
        if (typeof window === 'undefined') {
            return false; // 服务端渲染时返回false
        }
        return !!localStorage.getItem('auth_token');
    }

    // Get stored token
    static getToken(): string | null {
        return localStorage.getItem('auth_token');
    }
}