// features/settings/hooks/useSettings.ts
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AuthApi } from '@/lib/api/auth';
import { ProfileApi, Profile } from '@/lib/api/profile';
import { getLoginRedirectUrl, navigationRoutes } from '@/lib/navigation';

export interface UserInfo {
    username: string;
    email: string;
    userId: number;
    nickname?: string;
    bio?: string;
    avatarUrl?: string;
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

            // 先尝试获取完整用户资料
            try {
                const profile = await ProfileApi.getProfile();
                setUserInfo({
                    username: profile.username,
                    email: profile.email,
                    userId: profile.userId,
                    nickname: profile.nickname,
                    bio: profile.bio,
                    avatarUrl: profile.avatarUrl
                });
                return; // 成功获取，直接返回
            } catch (profileErr) {
                console.warn('获取完整用户资料失败，尝试获取基本用户信息:', profileErr);
            }

            // 如果获取完整资料失败，尝试获取基本用户信息
            const basicUser = await AuthApi.getCurrentUser();
            setUserInfo({
                username: basicUser.username,
                email: basicUser.email || '',
                userId: basicUser.userId,
                nickname: undefined,
                bio: undefined,
                avatarUrl: undefined // 没有头像时显示默认头像
            });
            setError('获取完整用户资料失败，显示基本信息');

        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : '获取用户信息失败';
            console.error('获取用户信息失败:', errorMessage);
            setError(errorMessage);
            // 如果连基本用户信息都获取不到，跳转到登录页
            router.push(getLoginRedirectUrl(navigationRoutes.settings));
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
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : '密码修改失败';
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
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : '邮箱修改失败';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    // 更新用户资料
    const updateProfile = async (data: { nickname?: string; bio?: string }) => {
        try {
            setLoading(true);
            setError(null);
            const result = await ProfileApi.updateProfile(data);
            setUserInfo(prev => prev ? {
                ...prev,
                nickname: result.nickname,
                bio: result.bio
            } : null);
            return { success: true, message: '资料更新成功' };
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : '资料更新失败';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    // 更新头像
    const updateAvatar = (avatarUrl: string | null) => {
        setUserInfo(prev => prev ? {
            ...prev,
            avatarUrl: avatarUrl || undefined
        } : null);
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
        updateProfile,
        updateAvatar,
        refresh,
        fetchUserInfo,
    };
};
