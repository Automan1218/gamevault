// features/auth/hooks/useAuth.ts
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthApi } from '@/lib/api/auth';
import { LoginRequest, RegisterRequest } from '@/types/api';

export const useAuth = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 登录
    const login = async (credentials: LoginRequest, redirect: string = '/dashboard/library') => {
        try {
            setLoading(true);
            setError(null);
            const response = await AuthApi.login(credentials);
            if (response.token) {
                localStorage.setItem('auth_token', response.token);
                router.push(redirect);
                return { success: true, message: '登录成功！' };
            } else {
                throw new Error('登录失败，请检查用户名和密码');
            }
        } catch (err: any) {
            const errorMessage = err.message || '登录失败';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    // 注册
    const register = async (userData: RegisterRequest, redirect: string = '/dashboard/library') => {
        try {
            setLoading(true);
            setError(null);
            const response = await AuthApi.register(userData);
            if (response.token) {
                // 注册成功后自动登录
                localStorage.setItem('auth_token', response.token);
                router.push(redirect);
                return { success: true, message: '注册成功！' };
            } else {
                return { success: true, message: '注册成功！请登录' };
            }
        } catch (err: any) {
            const errorMessage = err.message || '注册失败';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    // 登出
    const logout = async () => {
        try {
            await AuthApi.logout();
            router.push('/auth/login');
        } catch (err) {
            console.error('Logout failed:', err);
        }
    };

    // 检查邮箱是否存在
    const checkEmailExists = async (email: string): Promise<boolean> => {
        try {
            const result = await AuthApi.checkEmail(email);
            return result.exists;
        } catch (err) {
            console.error('Check email failed:', err);
            return false;
        }
    };

    // 检查用户名是否存在
    const checkUsernameExists = async (username: string): Promise<boolean> => {
        try {
            const result = await AuthApi.checkUsername(username);
            return result.exists;
        } catch (err) {
            console.error('Check username failed:', err);
            return false;
        }
    };

    // 检查是否已认证
    const isAuthenticated = (): boolean => {
        return AuthApi.isAuthenticated();
    };

    // 获取当前用户信息
    const getCurrentUser = async () => {
        try {
            return await AuthApi.getCurrentUser();
        } catch (err) {
            console.error('Get current user failed:', err);
            return null;
        }
    };

    return {
        loading,
        error,
        login,
        register,
        logout,
        checkEmailExists,
        checkUsernameExists,
        isAuthenticated,
        getCurrentUser,
    };
};
