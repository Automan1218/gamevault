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
    private static currentUserCache: any = null;
    private static cacheTimestamp: number = 0;
    private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

    // 带缓存的获取当前用户信息
    static async getCurrentUser() {
        const now = Date.now();

        // 如果缓存存在且未过期，直接返回缓存
        if (this.currentUserCache && (now - this.cacheTimestamp) < this.CACHE_DURATION) {
            return this.currentUserCache;
        }

        try {
            // 使用认证服务（端口8080）获取用户信息，而不是论坛服务
            const response = await fetch(`${ENV.AUTH_API_URL}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${AuthApi.getToken()}`,
                },
            });

            if (!response.ok) {
                throw new Error('获取用户信息失败');
            }

            const data = await response.json();

            // 更新缓存
            this.currentUserCache = data;
            this.cacheTimestamp = now;

            return data;
        } catch (error) {
            // 清除缓存
            this.currentUserCache = null;
            this.cacheTimestamp = 0;
            throw error;
        }
    }

    // 清除缓存的方法
    static clearUserCache() {
        this.currentUserCache = null;
        this.cacheTimestamp = 0;
    }

    // 优化后的 getUserId - 避免重复请求
    static async getUserId(): Promise<number | null> {
        try {
            const data = await this.getCurrentUser();
            return data.userId;
        } catch (error) {
            console.error('获取 userId 失败:', error);
            return null;
        }
    }

    // 优化后的 getUsername - 避免重复请求
    static async getUsername(): Promise<string | null> {
        try {
            const data = await this.getCurrentUser();
            return data.username;
        } catch (error) {
            console.error('获取 username 失败:', error);
            return null;
        }
    }

    static async getUserById(userId: number): Promise<User> {
        try {
            return await apiClient.get<User>(`/users/${userId}`);
        } catch (error) {
            console.error(`获取用户 ${userId} 失败:`, error);
            throw new Error('获取用户信息失败');
        }
    }
}