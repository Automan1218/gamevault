import { apiClient } from './client';
import { AuthApi } from './auth';
import { ENV } from '@/config/env';

export interface Profile {
    userId: number;
    username: string;
    email: string;
    nickname?: string;
    bio?: string;
    avatarUrl?: string;
    createdDate: string;
    updatedDate?: string;
}

export interface UpdateProfileRequest {
    nickname?: string;
    email?: string;
    bio?: string;
    avatarUrl?: string;
}

export interface AvatarUploadResponse {
    message: string;
    avatarUrl: string;
}

export class ProfileApi {
    /**
     * Get current user profile
     */
    static async getProfile(): Promise<Profile> {
        try {
            const response = await fetch(`${ENV.AUTH_API_URL}/settings/profile`, {
                headers: {
                    'Authorization': `Bearer ${AuthApi.getToken()}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                // If 404 error, user profile may not exist, return default profile
                if (response.status === 404) {
                    console.warn('User profile does not exist, returning default profile');
                    const basicUser = await AuthApi.getCurrentUser();
                    return {
                        userId: basicUser.userId,
                        username: basicUser.username,
                        email: basicUser.email || '',
                        nickname: undefined,
                        bio: undefined,
                        avatarUrl: undefined,
                        createdDate: new Date().toISOString(),
                        updatedDate: new Date().toISOString()
                    };
                }
                
                const errorData = await response.json().catch(() => ({ error: 'Server response format error' }));
                throw new Error(errorData.error || 'Failed to get user profile');
            }

            return await response.json();
        } catch (error) {
            console.error('Failed to get user profile:', error);
            throw error;
        }
    }

    /**
     * Update user profile
     */
    static async updateProfile(data: UpdateProfileRequest): Promise<Profile> {
        try {
            const response = await fetch(`${ENV.AUTH_API_URL}/settings/profile`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${AuthApi.getToken()}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update user profile');
            }

            return await response.json();
        } catch (error) {
            console.error('Failed to update user profile:', error);
            throw error;
        }
    }

    /**
     * Upload avatar
     */
    static async uploadAvatar(file: File): Promise<AvatarUploadResponse> {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(`${ENV.AUTH_API_URL}/settings/avatar`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${AuthApi.getToken()}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Avatar upload failed');
            }

            return await response.json();
        } catch (error) {
            console.error('Avatar upload failed:', error);
            throw error;
        }
    }

    /**
     * Delete avatar
     */
    static async deleteAvatar(): Promise<{ message: string }> {
        try {
            const response = await fetch(`${ENV.AUTH_API_URL}/settings/avatar`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${AuthApi.getToken()}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Avatar deletion failed');
            }

            return await response.json();
        } catch (error) {
            console.error('Avatar deletion failed:', error);
            throw error;
        }
    }
}
