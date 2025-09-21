// src/api/users.ts
import {apiClient} from './client';
import {ENV} from '@/config/env';
import {AuthApi} from "@/lib/api/auth";

// 根据后端User实体定义类型
export interface User {
    userId: number;
    username: string;
    nickname?: string;
    bio?: string;
    avatarUrl?: string;
    status: 'active' | 'inactive' | 'banned';
    createdDate: string;
    updatedDate?: string;
}

export class UsersApi {
    // 根据ID获取用户
    static async getUserById(id: number): Promise<User> {
        try {
            return await apiClient.get<User>(`/users/${id}`);
        } catch (error) {
            console.error(`Failed to fetch user ${id}:`, error);
            throw new Error('获取用户信息失败');
        }
    }

    // 根据用户名获取用户
    static async getUserByUsername(username: string): Promise<User> {
        try {
            return await apiClient.get<User>(`/users/username/${username}`);
        } catch (error) {
            console.error(`Failed to fetch user ${username}:`, error);
            throw new Error('获取用户信息失败');
        }
    }

    // 获取活跃用户列表
    static async getActiveUsers(page: number = 0, size: number = ENV.DEFAULT_PAGE_SIZE): Promise<User[]> {
        try {
            return await apiClient.get<User[]>('/users/active', {
                page,
                size: Math.min(size, ENV.MAX_PAGE_SIZE)
            });
        } catch (error) {
            console.error('Failed to fetch active users:', error);
            throw new Error('获取活跃用户失败');
        }
    }

    // 检查用户名是否存在
    static async checkUsernameExists(username: string): Promise<boolean> {
        try {
            const response = await apiClient.get<{ exists: boolean }>(`/users/check/${username}`);
            return response.exists;
        } catch (error) {
            console.error(`Failed to check username ${username}:`, error);
            throw new Error('检查用户名失败');
        }
    }

    // 批量获取用户信息
    static async getUsersByIds(userIds: number[]): Promise<User[]> {
        try {
            return await apiClient.post<User[]>('/users/batch', {userIds});
        } catch (error) {
            console.error('Failed to fetch users by IDs:', error);
            throw new Error('批量获取用户信息失败');
        }
    }
    static async getCurrentUser() {
        const response = await fetch(`${ENV.FORUM_API_URL}/users/me`, {
            headers: {
                'Authorization': `Bearer ${AuthApi.getToken()}`,
            },
        });

        if (!response.ok) {
            throw new Error('获取用户信息失败');
        }

        return response.json();
    }

    // 单独获取 userId
    static async getUserId(): Promise<number | null> {
        try {
            const data = await UsersApi.getCurrentUser();
            return data.userId;
        } catch (error) {
            console.error('获取 userId 失败:', error);
            return null;
        }
    }

    static async getUsername(): Promise<string | null> {
        try {
            const data = await UsersApi.getCurrentUser();
            return data.username;
        } catch (error) {
            console.error('获取 username 失败:', error);
            return null;
        }
    }
}