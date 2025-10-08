import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthApi } from '@/lib/api/auth';
import { LoginRequest, RegisterRequest } from '@/types/api';
import { useAuth as useAuthContext } from '@/contexts/AuthContext';

export const useAuth = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { login: contextLogin } = useAuthContext();

    // 登录
    const login = async (credentials: LoginRequest, redirect: string = '/dashboard/library') => {
        try {
            setLoading(true);
            setError(null);
            const response = await AuthApi.login(credentials);
            if (response.token) {
                localStorage.setItem('auth_token', response.token);

                // 添加这部分 - 更新 AuthContext
                const userData = {
                    userId: response.userId,
                    username: response.username,
                    email: response.email,
                    nickname: response.username,
                    status: 'active' as const,
                    role: 'user' as const,
                    createdDate: new Date().toISOString(),
                };
                contextLogin(response.token, userData);

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

    // 注册（同样修改）
    const register = async (userData: RegisterRequest, redirect: string = '/dashboard/library') => {
        try {
            setLoading(true);
            setError(null);
            const response = await AuthApi.register(userData);
            if (response.token) {
                localStorage.setItem('auth_token', response.token);

                // 更新 AuthContext 状态
                const userInfo = {
                    userId: response.userId,
                    username: response.username,
                    email: response.email,
                    nickname: response.username,
                    status: 'active' as const,
                    role: 'user' as const,
                    createdDate: new Date().toISOString(),
                };
                contextLogin(response.token, userInfo);

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

    // 其他方法保持不变...
    const logout = async () => {
        try {
            await AuthApi.logout();
            router.push('/auth/login');
        } catch (err) {
            console.error('Logout failed:', err);
        }
    };

    const checkEmailExists = async (email: string): Promise<boolean> => {
        try {
            const result = await AuthApi.checkEmail(email);
            return result.exists;
        } catch (err) {
            console.error('Check email failed:', err);
            return false;
        }
    };

    const checkUsernameExists = async (username: string): Promise<boolean> => {
        try {
            const result = await AuthApi.checkUsername(username);
            return result.exists;
        } catch (err) {
            console.error('Check username failed:', err);
            return false;
        }
    };

    const isAuthenticated = (): boolean => {
        return AuthApi.isAuthenticated();
    };

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
