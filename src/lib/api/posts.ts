// src/api/posts.ts
import {apiClient} from './client';
import {ENV} from '@/config/env';

// 根据后端实际的响应结构定义类型
export interface Post {
    postId: number;
    title: string;
    body: string;
    bodyPlain?: string;
    authorId: number;
    authorName?: string;
    authorNickname?: string;
    viewCount: number;
    likeCount: number;
    replyCount: number;
    createdDate: string;
    updatedDate: string;
}

export interface PostListResponse {
    posts: Post[];
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
}

export interface CreatePostRequest {
    title: string;
    body: string;
}

export class PostsApi {
    // 获取帖子列表（分页）- 对应 GET /api/posts
    static async getPosts(
        page: number = 0,
        size: number = ENV.DEFAULT_PAGE_SIZE
    ): Promise<PostListResponse> {
        try {
            return await apiClient.get<PostListResponse>('/posts', {
                page,
                size: Math.min(size, ENV.MAX_PAGE_SIZE)
            });
        } catch (error) {
            console.error('Failed to fetch posts:', error);
            throw new Error('获取帖子列表失败');
        }
    }

    // 根据ID获取帖子详情 - 对应 GET /api/posts/{id}
    static async getPostById(id: number): Promise<Post> {
        try {
            const response = await apiClient.get<{ post: Post }>(`/posts/${id}`);
            return response.post;
        } catch (error) {
            console.error(`Failed to fetch post ${id}:`, error);
            throw new Error('获取帖子详情失败');
        }
    }

    // 创建新帖子 - 对应 POST /api/posts
    static async createPost(postData: CreatePostRequest): Promise<Post> {
        try {
            const response = await apiClient.post<{ post: Post }>('/posts', postData);
            return response.post;
        } catch (error) {
            console.error('Failed to create post:', error);
            throw new Error('创建帖子失败');
        }
    }

    // 搜索帖子 - 对应 GET /api/posts/search
    static async searchPosts(
        keyword: string,
        page: number = 0,
        size: number = ENV.DEFAULT_PAGE_SIZE
    ): Promise<PostListResponse> {
        try {
            return await apiClient.get<PostListResponse>('/posts/search', {
                keyword,
                page,
                size: Math.min(size, ENV.MAX_PAGE_SIZE)
            });
        } catch (error) {
            console.error('Failed to search posts:', error);
            throw new Error('搜索帖子失败');
        }
    }

    // 删除帖子 - 对应 DELETE /api/posts/{id}
    static async deletePost(id: number): Promise<void> {
        try {
            await apiClient.delete(`/posts/${id}`);
        } catch (error) {
            console.error(`Failed to delete post ${id}:`, error);
            throw new Error('删除帖子失败');
        }
    }

    // 在 PostsApi 类中添加以下方法：

// 更新帖子
    static async updatePost(id: number, postData: Partial<CreatePostRequest>): Promise<Post> {
        try {
            const response = await apiClient.authenticatedRequest<{ post: Post }>(
                `/posts/${id}`,
                {
                    method: 'PUT',
                    body: JSON.stringify(postData),
                }
            );
            return response.post;
        } catch (error) {
            console.error(`Failed to update post ${id}:`, error);
            throw new Error('更新帖子失败');
        }
    }

// 获取用户的帖子
    static async getUserPosts(
        userId: number,
        page: number = 0,
        size: number = ENV.DEFAULT_PAGE_SIZE
    ): Promise<PostListResponse> {
        try {
            const response = await apiClient.authenticatedRequest<PostListResponse>(
                `/posts/user/${userId}?page=${page}&size=${size}`
            );
            return response;
        } catch (error) {
            console.error(`Failed to fetch user posts:`, error);
            throw new Error('获取用户帖子失败');
        }
    }

// 点赞帖子
    static async likePost(id: number): Promise<void> {
        try {
            await apiClient.authenticatedRequest(`/posts/${id}/like`, {
                method: 'POST',
            });
        } catch (error) {
            console.error(`Failed to like post ${id}:`, error);
            throw new Error('点赞失败');
        }
    }

// 取消点赞
    static async unlikePost(id: number): Promise<void> {
        try {
            await apiClient.authenticatedRequest(`/posts/${id}/like`, {
                method: 'DELETE',
            });
        } catch (error) {
            console.error(`Failed to unlike post ${id}:`, error);
            throw new Error('取消点赞失败');
        }
    }
}