// features/settings/hooks/useSettings.ts
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AuthApi } from '@/lib/api/auth';

export interface UserInfo {
    username: string;
    email: string;
    uid: number;
}

export const useSettings = () => {
    const router = useRouter();
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 获取用户信息
    const fetchUserInfo = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const user = await AuthApi.getCurrentUser();
            setUserInfo({
                username: user.username,
                email: user.email || '',
                uid: user.userId
            });
        } catch (err: any) {
            const errorMessage = err?.message || '获取用户信息失败';
            setError(errorMessage);
            // 如果获取失败，可能是未登录，跳转到登录页
            router.push('/auth/login');
        } finally {
            setLoading(false);
        }
    }, [router]);

    // 修改密码
    const changePassword = async (oldPassword: string, newPassword: string) => {
        try {
            setLoading(true);
            setError(null);
            await AuthApi.changePassword(oldPassword, newPassword);
            // 密码修改成功后，先登出清除 token，再跳转到登录页
            await AuthApi.logout();
            router.push('/auth/login?message=password_changed');
            return { success: true, message: '密码修改成功，请重新登录' };
        } catch (err: any) {
            const errorMessage = err?.message || '密码修改失败';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    // 修改邮箱
    const changeEmail = async (password: string, newEmail: string) => {
        try {
            setLoading(true);
            setError(null);
            await AuthApi.changeEmail(password, newEmail);
            // 邮箱修改成功后，先登出清除 token，再跳转到登录页
            await AuthApi.logout();
            router.push('/auth/login?message=email_changed');
            return { success: true, message: '邮箱修改成功，请重新登录' };
        } catch (err: any) {
            const errorMessage = err?.message || '邮箱修改失败';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    // 刷新用户信息
    const refresh = useCallback(() => {
        fetchUserInfo();
    }, [fetchUserInfo]);

    // 自动加载用户信息
    useEffect(() => {
        fetchUserInfo();
    }, [fetchUserInfo]);

    return {
        userInfo,
        loading,
        error,
        changePassword,
        changeEmail,
        refresh,
        fetchUserInfo,
    };
};
