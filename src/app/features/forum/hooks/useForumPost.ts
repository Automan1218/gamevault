// features/forum/hooks/useForumPost.ts
import { useState, useEffect, useCallback } from 'react';
import { ForumApi } from '../services/forumApi';
import {
    ForumPost,
    CreateForumPostRequest,
    UpdateForumPostRequest,
    ForumReply,
    CreateForumReplyRequest
} from '../types/forumTypes';
export const dynamic = 'force-dynamic';
// Hook for single post
export const useForumPost = (contentId: number) => {
    const [post, setPost] = useState<ForumPost | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPost = useCallback(async () => {
        if (!contentId) return;

        setLoading(true);
        setError(null);

        try {
            const response = await ForumApi.getForumPostById(contentId);
            setPost(response);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '操作失败';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [contentId]);

    // 点赞帖子
    const likePost = useCallback(async () => {
        if (!post) return;

        try {
            await ForumApi.likeForumPost(post.contentId);
            setPost(prev => prev ? { ...prev, likeCount: prev.likeCount + 1 } : null);
        } catch (error) {
            console.error('Failed to like post:', error);
            throw error;
        }
    }, [post]);

    // 取消点赞
    const unlikePost = useCallback(async () => {
        if (!post) return;

        try {
            await ForumApi.unlikeForumPost(post.contentId);
            setPost(prev => prev ? {
                ...prev,
                likeCount: Math.max(0, prev.likeCount - 1)
            } : null);
        } catch (error) {
            console.error('Failed to unlike post:', error);
            throw error;
        }
    }, [post]);

    // 更新帖子
    const updatePost = useCallback(async (data: UpdateForumPostRequest) => {
        if (!post) return;

        try {
            const updatedPost = await ForumApi.updateForumPost(post.contentId, data);
            setPost(updatedPost);
            return updatedPost;
        } catch (error) {
            console.error('Failed to update post:', error);
            throw error;
        }
    }, [post]);

    // 删除帖子
    const deletePost = useCallback(async () => {
        if (!post) return;

        try {
            await ForumApi.deleteForumPost(post.contentId);
            setPost(null);
        } catch (error) {
            console.error('Failed to delete post:', error);
            throw error;
        }
    }, [post]);

    useEffect(() => {
        fetchPost();
    }, [fetchPost]);

    return {
        post,
        loading,
        error,
        refetch: fetchPost,
        likePost,
        unlikePost,
        updatePost,
        deletePost
    };
};

// Hook for creating posts
export const useCreateForumPost = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createPost = useCallback(async (data: CreateForumPostRequest): Promise<ForumPost> => {
        setLoading(true);
        setError(null);

        try {
            const newPost = await ForumApi.createForumPost(data);
            return newPost;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '操作失败';
            setError(errorMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    return { createPost, loading, error };
};

// Hook for post replies
export const useForumPostReplies = (postId: number) => {
    const [replies, setReplies] = useState<ForumReply[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasNextPage, setHasNextPage] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);

    const fetchReplies = useCallback(async (page: number = 0, reset: boolean = true) => {
        if (!postId) return;

        setLoading(true);
        setError(null);

        try {
            const newReplies = await ForumApi.getPostReplies(postId, page, 20);

            setReplies(prev => reset ? newReplies : [...prev, ...newReplies]);
            setHasNextPage(newReplies.length === 20); // 假设满页表示还有更多
            setCurrentPage(page);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '操作失败';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [postId]);

    const loadMore = useCallback(() => {
        if (hasNextPage && !loading) {
            fetchReplies(currentPage + 1, false);
        }
    }, [currentPage, hasNextPage, loading, fetchReplies]);

    const createReply = useCallback(async (data: CreateForumReplyRequest) => {
        try {
            const newReply = await ForumApi.createReply(data);
            setReplies(prev => [...prev, newReply]);
            return newReply;
        } catch (error) {
            console.error('Failed to create reply:', error);
            throw error;
        }
    }, []);

    useEffect(() => {
        fetchReplies(0, true);
    }, [fetchReplies]);

    return {
        replies,
        loading,
        error,
        hasNextPage,
        currentPage,
        refetch: () => fetchReplies(0, true),
        loadMore,
        createReply
    };
};

// Hook for post draft management
export const useForumPostDraft = (draftKey: string = 'forum_post_draft') => {
    const [draft, setDraft] = useState<Partial<CreateForumPostRequest> | null>(null);

    const saveDraft = useCallback((data: Partial<CreateForumPostRequest>) => {
        const draftData = {
            ...data,
            savedAt: new Date().toISOString()
        };

        localStorage.setItem(draftKey, JSON.stringify(draftData));
        setDraft(draftData);
    }, [draftKey]);

    const loadDraft = useCallback(() => {
        try {
            const savedDraft = localStorage.getItem(draftKey);
            if (savedDraft) {
                const draftData = JSON.parse(savedDraft);
                setDraft(draftData);
                return draftData;
            }
        } catch (error) {
            console.error('Failed to load draft:', error);
        }
        return null;
    }, [draftKey]);

    const clearDraft = useCallback(() => {
        localStorage.removeItem(draftKey);
        setDraft(null);
    }, [draftKey]);

    const hasDraft = useCallback(() => {
        return localStorage.getItem(draftKey) !== null;
    }, [draftKey]);

    useEffect(() => {
        loadDraft();
    }, [loadDraft]);

    return {
        draft,
        saveDraft,
        loadDraft,
        clearDraft,
        hasDraft
    };
};