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

    // Get user information
    const fetchUserInfo = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // First try to get complete user profile
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
                return; // Successfully obtained, return directly
            } catch (profileErr) {
                console.warn('Failed to get complete user profile, trying to get basic user info:', profileErr);
            }

            // If getting complete profile fails, try to get basic user info
            const basicUser = await AuthApi.getCurrentUser();
            setUserInfo({
                username: basicUser.username,
                email: basicUser.email || '',
                userId: basicUser.userId,
                nickname: undefined,
                bio: undefined,
                avatarUrl: undefined // Show default avatar when no avatar
            });
            setError('Failed to get complete user profile, showing basic info');

        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to get user information';
            console.error('Failed to get user information:', errorMessage);
            setError(errorMessage);
            // If even basic user info can't be obtained, redirect to login page
            router.push(getLoginRedirectUrl(navigationRoutes.settings));
        } finally {
            setLoading(false);
        }
    }, [router]);

    // Change password
    const changePassword = async (oldPassword: string, newPassword: string) => {
        try {
            setLoading(true);
            setError(null);
            await AuthApi.changePassword(oldPassword, newPassword);
            // After successful password change, logout to clear token, then redirect to login page
            await AuthApi.logout();
            router.push('/auth/login?message=password_changed');
            return { success: true, message: 'Password changed successfully, please login again' };
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Password change failed';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    // Change email
    const changeEmail = async (password: string, newEmail: string) => {
        try {
            setLoading(true);
            setError(null);
            await AuthApi.changeEmail(password, newEmail);
            // After successful email change, logout to clear token, then redirect to login page
            await AuthApi.logout();
            router.push('/auth/login?message=email_changed');
            return { success: true, message: 'Email changed successfully, please login again' };
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Email change failed';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    // Update user profile
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
            return { success: true, message: 'Profile updated successfully' };
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Profile update failed';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    // Update avatar
    const updateAvatar = (avatarUrl: string | null) => {
        setUserInfo(prev => prev ? {
            ...prev,
            avatarUrl: avatarUrl || undefined
        } : null);
    };

    // Refresh user information
    const refresh = useCallback(() => {
        fetchUserInfo();
    }, [fetchUserInfo]);

    // Auto load user information
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
