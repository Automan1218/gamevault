// src/api/posts.ts
import {apiClient} from './client';
import {ENV} from '@/config/env';

// 根据后端实际的响应结构定义类型
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
    status: string;           // 匹配后端的status字段
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
    // 获取帖子列表（分页）- 对应 GET /api/forum/posts
    static async getPosts(
        page: number = 0,
        size: number = ENV.DEFAULT_PAGE_SIZE
    ): Promise<PostListResponse> {
        try {
            return await apiClient.get<PostListResponse>('/forum/posts', {
                page,
                size: Math.min(size, ENV.MAX_PAGE_SIZE)
            });
        } catch (error) {
            console.error('Failed to fetch posts:', error);
            throw new Error('获取帖子列表失败');
        }
    }

    // 根据ID获取帖子详情 - 对应 GET /api/forum/posts/{id}
    static async getPostById(id: number): Promise<Post> {
        try {
            const response = await apiClient.get<{ post: Post }>(`/forum/posts/${id}`);
            return response.post;
        } catch (error) {
            console.error(`Failed to fetch post ${id}:`, error);
            throw new Error('获取帖子详情失败');
        }
    }

    // 创建新帖子 - 对应 POST /api/forum/posts
    static async createPost(postData: CreatePostRequest): Promise<Post> {
        try {
            const response = await apiClient.authenticatedRequest<{ post: Post }>('/forum/posts', postData,
                {
                    method: 'POST'
                }
            );
            return response.post;
        } catch (error) {
            console.error('Failed to create post:', error);
            throw new Error('创建帖子失败');
        }
    }

    // 搜索帖子 - 对应 GET /api/forum/posts/search
    static async searchPosts(
        keyword: string,
        page: number = 0,
        size: number = ENV.DEFAULT_PAGE_SIZE
    ): Promise<PostListResponse> {
        try {
            return await apiClient.get<PostListResponse>('/forum/posts/search', {
                keyword,
                page,
                size: Math.min(size, ENV.MAX_PAGE_SIZE)
            });
        } catch (error) {
            console.error('Failed to search posts:', error);
            throw new Error('搜索帖子失败');
        }
    }

    // 删除帖子 - 对应 DELETE /api/forum/posts/{id}
    static async deletePost(id: number): Promise<void> {
        try {
            await apiClient.delete(`/forum/posts/${id}`);
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
                `/forum/posts/${id}`,
                postData,
                {
                    method: 'PUT'
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
            const response = await apiClient.get<PostListResponse>(
                `/forum/posts/user/${userId}`,
                {
                    page,
                    size: Math.min(size, ENV.MAX_PAGE_SIZE)
                }
            );
            return response;
        } catch (error) {
            console.error(`Failed to fetch user posts:`, error);
            throw new Error('获取用户帖子失败');
        }
    }

// 点赞帖子 (暂时注释，等后端实现)
    static async likePost(id: number): Promise<void> {
        try {
            await apiClient.authenticatedRequest(`/forum/posts/${id}/like`, undefined, {
                method: 'POST',
            });
        } catch (error) {
            console.error(`Failed to like post ${id}:`, error);
            throw new Error('点赞失败');
        }
    }

// 取消点赞 (暂时注释，等后端实现)
    static async unlikePost(id: number): Promise<void> {
        try {
            await apiClient.authenticatedRequest(`/forum/posts/${id}/like`, undefined, {
                method: 'DELETE',
            });
        } catch (error) {
            console.error(`Failed to unlike post ${id}:`, error);
            throw new Error('取消点赞失败');
        }
    }
}