// features/auth/hooks/useAuth.ts
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthApi } from '@/lib/api/auth';
import { UsersApi } from '@/lib/api/users';
import { LoginRequest, RegisterRequest } from '@/types/api';
import { useAuth as useAuthContext } from '@/contexts/AuthContext';

export const useAuth = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { login: contextLogin } = useAuthContext();

    // Login
    const login = async (credentials: LoginRequest, redirect: string = '/dashboard/library') => {
        try {
            setLoading(true);
            setError(null);

            // Clear old user cache
            UsersApi.clearUserCache();

            const response = await AuthApi.login(credentials);
            if (response.token) {
                localStorage.setItem('auth_token', response.token);

                // Add this part - update AuthContext
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
                return { success: true, message: 'Login successful!' };
            } else {
                throw new Error('Login failed, please check username and password');
            }
        } catch (err: any) {
            const errorMessage = err.message || 'Login failed';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const register = async (userData: RegisterRequest, redirect: string = '/dashboard/library') => {
        try {
            setLoading(true);
            setError(null);

            // Clear old user cache
            UsersApi.clearUserCache();

            const response = await AuthApi.register(userData);
            if (response.token) {
                // Auto login after successful registration
                localStorage.setItem('auth_token', response.token);

                // Update AuthContext state
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
                return { success: true, message: 'Registration successful!' };
            } else {
                return { success: true, message: 'Registration successful! Please login' };
            }
        } catch (err: any) {
            const errorMessage = err.message || 'Registration failed';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            // Clear user cache
            UsersApi.clearUserCache();
            await AuthApi.logout();
            router.push('/auth/login');
        } catch (err) {
            console.error('Logout failed:', err);
        }
    };

    // Check if email exists
    const checkEmailExists = async (email: string): Promise<boolean> => {
        try {
            const result = await AuthApi.checkEmail(email);
            return result.exists;
        } catch (err) {
            console.error('Check email failed:', err);
            return false;
        }
    };

    // Check if username exists
    const checkUsernameExists = async (username: string): Promise<boolean> => {
        try {
            const result = await AuthApi.checkUsername(username);
            return result.exists;
        } catch (err) {
            console.error('Check username failed:', err);
            return false;
        }
    };

    // Check if authenticated
    const isAuthenticated = (): boolean => {
        return AuthApi.isAuthenticated();
    };

    // Get current user information
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
