// src/lib/api/auth.ts
import { apiClient } from './client';
import {
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    User
} from '@/types/api';

// Temporarily define these types until type files are updated
interface ChangePasswordRequest {
    oldPassword: string;
    newPassword: string;
}

interface ChangeEmailRequest {
    password: string;
    newEmail: string;
}
export const dynamic = 'force-dynamic';
export class AuthApi {
    // User login
    static async login(credentials: LoginRequest): Promise<LoginResponse> {
        try {
            const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
            if (response.token) {
                apiClient.setAuthToken(response.token);
            }
            return response;
        } catch (error) {
            console.error('Login failed:', error);
            throw new Error('Login failed, please check username and password');
        }
    }

    // User registration
    static async register(userData: RegisterRequest): Promise<LoginResponse> {
        try {
            const response = await apiClient.post<LoginResponse>('/auth/register', userData);
            if (response.token) {
                apiClient.setAuthToken(response.token);
            }
            return response;
        } catch (error) {
            console.error('Registration failed:', error);
            throw new Error('Registration failed, please check input information');
        }
    }

    // User logout
    static async logout(): Promise<void> {
        try {
            await apiClient.post('/auth/logout');
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            apiClient.clearAuthToken();
        }
    }

    // Get current user information
    static async getCurrentUser(): Promise<User> {
        try {
            return await apiClient.get<User>('/auth/me');
        } catch (error) {
            console.error('Failed to get current user:', error);
            throw new Error('Failed to get user information');
        }
    }

    // Refresh token
    static async refreshToken(): Promise<LoginResponse> {
        try {
            const response = await apiClient.authenticatedRequest<LoginResponse>('/auth/refresh');
            if (response.token) {
                apiClient.setAuthToken(response.token);
            }
            return response;
        } catch (error) {
            console.error('Token refresh failed:', error);
            throw new Error('Token refresh failed');
        }
    }

    // Change password
    static async changePassword(oldPassword: string, newPassword: string): Promise<void> {
        try {
            const request: ChangePasswordRequest = {
                oldPassword,
                newPassword
            };
            await apiClient.put('/auth/change-password', request);
        } catch (error) {
            console.error('Password change failed:', error);
            throw new Error('Password change failed');
        }
    }

    // Change email
    static async changeEmail(password: string, newEmail: string): Promise<void> {
        try {
            const request: ChangeEmailRequest = {
                password,
                newEmail
            };
            await apiClient.put('/auth/change-email', request);
        } catch (error) {
            console.error('Email change failed:', error);
            throw new Error('Email change failed');
        }
    }

    // Request password reset
    static async requestPasswordReset(email: string): Promise<void> {
        try {
            await apiClient.post('/auth/reset-password', { email });
        } catch (error) {
            console.error('Password reset request failed:', error);
            throw new Error('Password reset request failed');
        }
    }

    // Verify email
    static async verifyEmail(token: string): Promise<void> {
        try {
            await apiClient.post('/auth/verify-email', { token });
        } catch (error) {
            console.error('Email verification failed:', error);
            throw new Error('Email verification failed');
        }
    }

    // Check if email exists
    static async checkEmail(email: string): Promise<{ exists: boolean }> {
        try {
            return await apiClient.get<{ exists: boolean }>(`/auth/check-email?email=${encodeURIComponent(email)}`);
        } catch (error) {
            console.error('Check email failed:', error);
            throw new Error('检查邮箱失败');
        }
    }

    // 检查用户名是否存在
    static async checkUsername(username: string): Promise<{ exists: boolean }> {
        try {
            return await apiClient.get<{ exists: boolean }>(`/auth/check-username?username=${encodeURIComponent(username)}`);
        } catch (error) {
            console.error('Check username failed:', error);
            throw new Error('检查用户名失败');
        }
    }

    // 检查用户是否已认证
    static isAuthenticated(): boolean {
        return apiClient.getAuthToken() !== null;
    }

    // 获取存储的令牌
    static getToken(): string | null {
        return apiClient.getAuthToken();
    }
}