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
     * 获取当前用户资料
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
                // 如果是404错误，可能是用户资料不存在，返回默认资料
                if (response.status === 404) {
                    console.warn('用户资料不存在，返回默认资料');
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
                
                const errorData = await response.json().catch(() => ({ error: '服务器响应格式错误' }));
                throw new Error(errorData.error || '获取用户资料失败');
            }

            return await response.json();
        } catch (error) {
            console.error('获取用户资料失败:', error);
            throw error;
        }
    }

    /**
     * 更新用户资料
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
                throw new Error(errorData.error || '更新用户资料失败');
            }

            return await response.json();
        } catch (error) {
            console.error('更新用户资料失败:', error);
            throw error;
        }
    }

    /**
     * 上传头像
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
                throw new Error(errorData.error || '头像上传失败');
            }

            return await response.json();
        } catch (error) {
            console.error('头像上传失败:', error);
            throw error;
        }
    }

    /**
     * 删除头像
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
                throw new Error(errorData.error || '头像删除失败');
            }

            return await response.json();
        } catch (error) {
            console.error('头像删除失败:', error);
            throw error;
        }
    }
}
