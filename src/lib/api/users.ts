// src/api/users.ts
import {apiClient} from './client';
import {ENV} from '@/config/env';
import {AuthApi} from "@/lib/api/auth";

// Define types based on backend User entity
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
    private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minute cache

    // Get current user info with caching
    static async getCurrentUser() {
        const now = Date.now();

        // If cache exists and is not expired, return cache directly
        if (this.currentUserCache && (now - this.cacheTimestamp) < this.CACHE_DURATION) {
            return this.currentUserCache;
        }

        try {
            // Use auth service (port 8080) to get user info, not forum service
            const response = await fetch(`${ENV.AUTH_API_URL}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${AuthApi.getToken()}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to get user info');
            }

            const data = await response.json();

            // Update cache
            this.currentUserCache = data;
            this.cacheTimestamp = now;

            return data;
        } catch (error) {
            // Clear cache
            this.currentUserCache = null;
            this.cacheTimestamp = 0;
            throw error;
        }
    }

    // Method to clear cache
    static clearUserCache() {
        this.currentUserCache = null;
        this.cacheTimestamp = 0;
    }

    // Optimized getUserId - avoid duplicate requests
    static async getUserId(): Promise<number | null> {
        try {
            const data = await this.getCurrentUser();
            return data.userId;
        } catch (error) {
            console.error('Failed to get userId:', error);
            return null;
        }
    }

    // Optimized getUsername - avoid duplicate requests
    static async getUsername(): Promise<string | null> {
        try {
            const data = await this.getCurrentUser();
            return data.username;
        } catch (error) {
            console.error('Failed to get username:', error);
            return null;
        }
    }

    static async getUserById(userId: number): Promise<User> {
        try {
            return await apiClient.get<User>(`/users/${userId}`);
        } catch (error) {
            console.error(`Failed to get user ${userId}:`, error);
            throw new Error('Failed to get user info');
        }
    }
}