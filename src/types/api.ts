// src/types/api.ts

// Base API Response
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

// Pagination
export interface PaginationParams {
    page: number;
    size: number;
}

export interface PaginatedResponse<T> {
    content: T[];
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
}

// Post related types - 匹配后端响应格式
export interface Post {
    contentId: number;  // 匹配后端的contentId
    title: string;
    body: string;
    bodyPlain?: string;
    authorId: number;
    authorUsername?: string;  // 匹配后端的authorUsername
    authorEmail?: string;     // 匹配后端的authorEmail
    viewCount: number;
    likeCount: number;
    replyCount?: number;      // 可选，因为后端可能没有实现
    createdDate: string;
    updatedDate: string;
    status: 'active' | 'deleted' | 'hidden';
    contentType?: 'post' | 'reply';
    parentId?: number;
}

export interface CreatePostRequest {
    title: string;
    body: string;
    // authorId 不需要，因为从JWT token中获取
}

export interface UpdatePostRequest {
    title?: string;
    body?: string;
}

export interface PostSearchParams extends PaginationParams {
    keyword?: string;
    authorId?: number;
    startDate?: string;
    endDate?: string;
}

// User related types
export interface User {
    userId: number;
    username: string;
    nickname: string;
    email?: string;
    status: 'active' | 'inactive' | 'banned';
    role: 'user' | 'admin' | 'moderator';
    createdDate: string;
    lastLoginDate?: string;
    profile?: UserProfile;
}

export interface UserProfile {
    avatar?: string;
    bio?: string;
    location?: string;
    website?: string;
    joinDate: string;
}

export interface CreateUserRequest {
    username: string;
    password: string;
    email: string;
    nickname?: string;
}

export interface UpdateUserRequest {
    nickname?: string;
    email?: string;
    bio?: string;
    avatar?: string;
}

// Authentication types
export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    username: string;
    userId: number;
    email: string;
    message?: string;
}

export interface RegisterRequest {
    username: string;
    password: string;
    email: string;
    nickname?: string;
}

// Statistics types
export interface ForumStats {
    totalPosts: number;
    totalUsers: number;
    onlineUsers: number;
    todayPosts: number;
    todayRegistrations: number;
}

// Error types
export interface ApiError {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
}

// 这些类型已经在上面定义了，删除重复定义
  