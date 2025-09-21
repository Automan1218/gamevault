// features/forum/hooks/useForum.ts
import { useState, useEffect, useCallback } from 'react';
import { ForumApi } from '../services/forumApi';
import {
    ForumPost,
    ForumPostFilter,
    UseForumState,
    ForumStats,
    ForumCategory
} from '../types/forumTypes'; // 修复导入路径

export const useForum = (initialFilter?: ForumPostFilter) => {
    const [state, setState] = useState<UseForumState>({
        posts: [],
        categories: [],
        stats: null,
        loading: false,
        error: null,
        hasNextPage: true
    });

    const [currentPage, setCurrentPage] = useState(0);
    const [filter, setFilter] = useState<ForumPostFilter | undefined>(initialFilter);

    // 获取帖子列表
    const fetchPosts = useCallback(async (page: number = 0, reset: boolean = true) => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const response = await ForumApi.getForumPosts(page, 20, filter);

            setState(prev => ({
                ...prev,
                posts: reset ? response.posts : [...prev.posts, ...response.posts],
                categories: response.categories || prev.categories,
                hasNextPage: response.currentPage < response.totalPages - 1,
                loading: false
            }));

            setCurrentPage(page);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '获取帖子失败';
            setState(prev => ({
                ...prev,
                error: errorMessage,
                loading: false
            }));
        }
    }, [filter]);

    // 加载更多
    const loadMore = useCallback(() => {
        if (state.hasNextPage && !state.loading) {
            fetchPosts(currentPage + 1, false);
        }
    }, [currentPage, state.hasNextPage, state.loading, fetchPosts]);

    // 刷新
    const refresh = useCallback(() => {
        setCurrentPage(0);
        fetchPosts(0, true);
    }, [fetchPosts]);

    // 应用过滤器
    const applyFilter = useCallback((newFilter: ForumPostFilter) => {
        setFilter(newFilter);
        setCurrentPage(0);
    }, []);

    // 清除过滤器
    const clearFilter = useCallback(() => {
        setFilter(undefined);
        setCurrentPage(0);
    }, []);

    // 获取统计信息
    const fetchStats = useCallback(async () => {
        try {
            const stats = await ForumApi.getForumStats();
            setState(prev => ({ ...prev, stats }));
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '获取统计失败';
            console.error('Failed to fetch stats:', errorMessage);
        }
    }, []);

    // 点赞帖子
    const likePost = useCallback(async (postId: number) => {
        try {
            await ForumApi.likeForumPost(postId);

            // 更新本地状态
            setState(prev => ({
                ...prev,
                posts: prev.posts.map(post =>
                    post.postId === postId
                        ? { ...post, likeCount: post.likeCount + 1 }
                        : post
                )
            }));
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '点赞失败';
            console.error('Failed to like post:', errorMessage);
            throw new Error(errorMessage);
        }
    }, []);

    // 取消点赞
    const unlikePost = useCallback(async (postId: number) => {
        try {
            await ForumApi.unlikeForumPost(postId);

            // 更新本地状态
            setState(prev => ({
                ...prev,
                posts: prev.posts.map(post =>
                    post.postId === postId
                        ? { ...post, likeCount: Math.max(0, post.likeCount - 1) }
                        : post
                )
            }));
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '取消点赞失败';
            console.error('Failed to unlike post:', errorMessage);
            throw new Error(errorMessage);
        }
    }, []);

    // 初始化
    useEffect(() => {
        fetchPosts(0, true);
        fetchStats();
    }, [fetchPosts, fetchStats]);

    // 监听过滤器变化
    useEffect(() => {
        if (filter) {
            fetchPosts(0, true);
        }
    }, [filter, fetchPosts]);

    return {
        ...state,
        currentPage,
        filter,
        fetchPosts,
        loadMore,
        refresh,
        applyFilter,
        clearFilter,
        fetchStats,
        likePost,
        unlikePost
    };
};

// Hook for getting hot posts
export const useHotPosts = (limit: number = 10) => {
    const [posts, setPosts] = useState<ForumPost[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchHotPosts = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const hotPosts = await ForumApi.getHotPosts(limit);
            setPosts(hotPosts);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '获取热门帖子失败';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [limit]);

    useEffect(() => {
        fetchHotPosts();
    }, [fetchHotPosts]);

    return { posts, loading, error, refetch: fetchHotPosts };
};

// Hook for user posts
export const useUserForumPosts = (userId: number) => {
    const [posts, setPosts] = useState<ForumPost[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasNextPage, setHasNextPage] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);

    const fetchUserPosts = useCallback(async (page: number = 0, reset: boolean = true) => {
        setLoading(true);
        setError(null);

        try {
            const response = await ForumApi.getUserForumPosts(userId, page, 20);

            setPosts(prev => reset ? response.posts : [...prev, ...response.posts]);
            setHasNextPage(response.currentPage < response.totalPages - 1);
            setCurrentPage(page);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '获取用户帖子失败';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    const loadMore = useCallback(() => {
        if (hasNextPage && !loading) {
            fetchUserPosts(currentPage + 1, false);
        }
    }, [currentPage, hasNextPage, loading, fetchUserPosts]);

    useEffect(() => {
        fetchUserPosts(0, true);
    }, [fetchUserPosts]);

    return {
        posts,
        loading,
        error,
        hasNextPage,
        currentPage,
        refetch: () => fetchUserPosts(0, true),
        loadMore
    };
};