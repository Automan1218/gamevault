// src/api/posts.ts
import {forumApiClient} from './client';
import {ENV} from '@/config/env';
import {ForumReply, ReplyListResponse} from "@/app/features/forum/types/forumTypes";

// Define types based on actual backend response structure
export interface Post {
    contentId: number;  // Match backend contentId
    title: string;
    body: string;
    bodyPlain?: string;
    authorId: number;
    authorUsername?: string;  // Match backend authorUsername
    authorEmail?: string;     // Match backend authorEmail
    authorName?: string;      // Match backend authorName
    authorNickname?: string;  // Match backend authorNickname
    authorAvatar?: string;    // Match backend authorAvatar
    viewCount: number;
    likeCount: number;
    replyCount?: number;      // Optional, as backend may not implement
    createdDate: string;
    updatedDate: string;
    status: string;
    isLiked?:boolean// Match backend status field
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
    // Get posts list (paginated) - corresponds to GET /api/forum/posts
    static async getPosts(
        page: number = 0,
        size: number = ENV.DEFAULT_PAGE_SIZE
    ): Promise<PostListResponse> {
        try {
            return await forumApiClient.get<PostListResponse>('/forum/posts', {
                page,
                size: Math.min(size, ENV.MAX_PAGE_SIZE)
            });
        } catch (error) {
            console.error('Failed to fetch posts:', error);
            throw new Error('Failed to get posts list');
        }
    }

    // Get post details by ID - corresponds to GET /api/forum/posts/{id}
    static async getPostById(id: number): Promise<Post> {
        try {
            const response = await forumApiClient.get<{ post: Post }>(`/forum/posts/${id}`);
            return response.post;
        } catch (error) {
            console.error(`Failed to fetch post ${id}:`, error);
            throw new Error('Failed to get post details');
        }
    }

    // Create new post - corresponds to POST /api/forum/posts
    static async createPost(postData: CreatePostRequest): Promise<Post> {
        try {
            const response = await forumApiClient.authenticatedRequest<{ post: Post }>('/forum/posts', postData,
                {
                    method: 'POST'
                }
            );
            return response.post;
        } catch (error) {
            console.error('Failed to create post:', error);
            throw new Error('Failed to create post');
        }
    }

    // Search posts - corresponds to GET /api/forum/posts/search
    static async searchPosts(
        keyword: string,
        page: number = 0,
        size: number = ENV.DEFAULT_PAGE_SIZE
    ): Promise<PostListResponse> {
        try {
            return await forumApiClient.get<PostListResponse>('/forum/posts/search', {
                keyword,
                page,
                size: Math.min(size, ENV.MAX_PAGE_SIZE)
            });
        } catch (error) {
            console.error('Failed to search posts:', error);
            throw new Error('Failed to search posts');
        }
    }

    // Delete post - corresponds to DELETE /api/forum/posts/{id}
    static async deletePost(id: number): Promise<void> {
        try {
            await forumApiClient.delete(`/forum/posts/${id}`);
        } catch (error) {
            console.error(`Failed to delete post ${id}:`, error);
            throw new Error('Failed to delete post');
        }
    }

    // Add the following methods to PostsApi class:

// Update post
    static async updatePost(id: number, postData: Partial<CreatePostRequest>): Promise<Post> {
        try {
            const response = await forumApiClient.authenticatedRequest<{ post: Post }>(
                `/forum/posts/${id}`,
                postData,
                {
                    method: 'PUT'
                }
            );
            return response.post;
        } catch (error) {
            console.error(`Failed to update post ${id}:`, error);
            throw new Error('Failed to update post');
        }
    }

// Get user's posts
    static async getUserPosts(
        userId: number,
        page: number = 0,
        size: number = ENV.DEFAULT_PAGE_SIZE
    ): Promise<PostListResponse> {
        try {
            const response = await forumApiClient.get<PostListResponse>(
                `/forum/posts/user/${userId}`,
                {
                    page,
                    size: Math.min(size, ENV.MAX_PAGE_SIZE)
                }
            );
            return response;
        } catch (error) {
            console.error(`Failed to fetch user posts:`, error);
            throw new Error('Failed to get user posts');
        }
    }

// Like post (temporarily commented, waiting for backend implementation)
    static async likePost(id: number): Promise<void> {
        try {
            await forumApiClient.authenticatedRequest(`/forum/posts/${id}/like`, undefined, {
                method: 'POST',
            });
        } catch (error) {
            console.error(`Failed to like post ${id}:`, error);
            throw new Error('Failed to like post');
        }
    }

// Unlike post (temporarily commented, waiting for backend implementation)
    static async unlikePost(id: number): Promise<void> {
        try {
            await forumApiClient.authenticatedRequest(`/forum/posts/${id}/like`, undefined, {
                method: 'DELETE',
            });
        } catch (error) {
            console.error(`Failed to unlike post ${id}:`, error);
            throw new Error('Failed to unlike post');
        }
    }

    // Add to PostsApi class
    static async toggleLike(postId: number): Promise<{
        liked: boolean;
        likeCount: number;
    }> {
        try {
            const response = await forumApiClient.authenticatedRequest<{
                success: boolean;
                liked: boolean;
                likeCount: number;
            }>(`/forum/posts/${postId}/like/toggle`, undefined, {
                method: 'PUT'
            });

            return {
                liked: response.liked,
                likeCount: response.likeCount
            };
        } catch (error) {
            console.error(`Failed to toggle like:`, error);
            throw new Error('Failed to toggle like status');
        }
    }

    /**
     * Create reply
     * POST /api/forum/posts/{postId}/replies
     */
    static async createReply(
        postId: number,
        data: { body: string; replyTo?: number }  // ✅ Receive object, support replyTo
    ): Promise<ForumReply> {
        try {
            const response = await forumApiClient.authenticatedRequest<{
                reply: ForumReply;
                message: string;
            }>(
                `/forum/posts/${postId}/replies`,
                data,  // Pass entire object { body: "...", replyTo?: ... }
                { method: 'POST' }
            );
            return response.reply;
        } catch (error) {
            console.error(`Failed to create reply:`, error);
            throw new Error('Failed to create reply');
        }
    }

    /**
     * Get post's reply list
     * GET /api/forum/posts/{postId}/replies
     */
    static async getReplies(
        postId: number,
        page: number = 0,
        size: number = 20
    ): Promise<ReplyListResponse> {
        try {
            return await forumApiClient.get<ReplyListResponse>(
                `/forum/posts/${postId}/replies`,
                { page, size }
            );
        } catch (error) {
            console.error(`Failed to fetch replies:`, error);
            throw new Error('Failed to get reply list');
        }
    }

    /**
     * Delete reply
     * DELETE /api/forum/posts/{postId}/replies/{replyId}
     */
    static async deleteReply(
        postId: number,
        replyId: number
    ): Promise<void> {
        try {
            await forumApiClient.authenticatedRequest(
                `/forum/posts/${postId}/replies/${replyId}`,
                undefined,
                { method: 'DELETE' }
            );
        } catch (error) {
            console.error(`Failed to delete reply:`, error);
            throw new Error('Failed to delete reply');
        }
    }

    /**
     * Like reply
     * POST /api/forum/posts/{postId}/replies/{replyId}/like
     */
    static async likeReply(
        postId: number,
        replyId: number
    ): Promise<void> {
        try {
            await forumApiClient.authenticatedRequest(
                `/forum/posts/${postId}/replies/${replyId}/like`,
                undefined,
                { method: 'POST' }
            );
        } catch (error) {
            console.error(`Failed to like reply:`, error);
            throw new Error('Failed to like reply');
        }
    }

    /**
     * Unlike reply
     * DELETE /api/forum/posts/{postId}/replies/{replyId}/like
     */
    static async unlikeReply(
        postId: number,
        replyId: number
    ): Promise<void> {
        try {
            await forumApiClient.authenticatedRequest(
                `/forum/posts/${postId}/replies/${replyId}/like`,
                undefined,
                { method: 'DELETE' }
            );
        } catch (error) {
            console.error(`Failed to unlike reply:`, error);
            throw new Error('Failed to unlike reply');
        }
    }

    /**
     * Toggle reply like status
     * PUT /api/forum/posts/{postId}/replies/{replyId}/like/toggle
     */
    static async toggleReplyLike(
        postId: number,
        replyId: number
    ): Promise<{
        liked: boolean;
        likeCount: number;
    }> {
        try {
            const response = await forumApiClient.authenticatedRequest<{
                success: boolean;
                liked: boolean;
                likeCount: number;
            }>(`/forum/posts/${postId}/replies/${replyId}/like/toggle`, undefined, {
                method: 'PUT'
            });

            return {
                liked: response.liked,
                likeCount: response.likeCount
            };
        } catch (error) {
            console.error(`Failed to toggle reply like:`, error);
            throw new Error('Failed to toggle reply like status');
        }
    }
}