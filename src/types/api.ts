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

// Post related types
export interface Post {
    postId: number;
    title: string;
    body: string;
    bodyPlain: string;
    authorId: number;
    authorName: string;
    authorNickname: string;
    viewCount: number;
    likeCount: number;
    replyCount: number;
    createdDate: string;
    updatedDate: string;
    status: 'active' | 'deleted' | 'hidden';
    contentType: 'post' | 'reply';
    parentId?: number;
}

export interface CreatePostRequest {
    title: string;
    body: string;
    authorId: number;
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
    user: User;
    expiresIn: number;
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

// API 类型定义
export interface LoginRequest {
    username: string;
    password: string;
  }
  
  export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
  }
  
  export interface AuthResponse {
    token: string;
    username: string;
    userId: number;
    email: string;
  }
  