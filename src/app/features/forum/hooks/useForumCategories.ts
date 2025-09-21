// features/forum/hooks/useForumCategories.ts
import { useState, useEffect, useCallback } from 'react';
import { ForumApi } from '../services/forumApi';
import { ForumCategory, GameBoard } from '../types/forumTypes';

// Hook for forum categories
export const useForumCategories = () => {
    const [categories, setCategories] = useState<ForumCategory[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await ForumApi.getCategories();
            setCategories(data);
        } catch (error: any) {
            setError(error.message);
            console.error('Failed to fetch categories:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // 根据ID获取分类
    const getCategoryById = useCallback((id: string) => {
        return categories.find(category => category.id === id);
    }, [categories]);

    // 根据名称获取分类
    const getCategoryByName = useCallback((name: string) => {
        return categories.find(category => category.name === name);
    }, [categories]);

    // 获取热门分类（按帖子数排序）
    const getPopularCategories = useCallback((limit: number = 5) => {
        return [...categories]
            .sort((a, b) => b.postCount - a.postCount)
            .slice(0, limit);
    }, [categories]);

    // 获取活跃分类（按在线用户数排序）
    const getActiveCategories = useCallback((limit: number = 5) => {
        return [...categories]
            .sort((a, b) => b.onlineUsers - a.onlineUsers)
            .slice(0, limit);
    }, [categories]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    return {
        categories,
        loading,
        error,
        refetch: fetchCategories,
        getCategoryById,
        getCategoryByName,
        getPopularCategories,
        getActiveCategories
    };
};

// Hook for game boards
export const useGameBoards = () => {
    const [gameBoards, setGameBoards] = useState<GameBoard[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchGameBoards = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await ForumApi.getGameBoards();
            setGameBoards(data);
        } catch (error: any) {
            setError(error.message);
            console.error('Failed to fetch game boards:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // 根据ID获取游戏板块
    const getGameBoardById = useCallback((id: string) => {
        return gameBoards.find(board => board.id === id);
    }, [gameBoards]);

    // 根据游戏名称获取板块
    const getGameBoardByName = useCallback((name: string) => {
        return gameBoards.find(board => board.name === name);
    }, [gameBoards]);

    // 获取热门游戏板块
    const getPopularGameBoards = useCallback((limit: number = 6) => {
        return [...gameBoards]
            .sort((a, b) => b.postCount - a.postCount)
            .slice(0, limit);
    }, [gameBoards]);

    // 根据游戏类型过滤
    const getGameBoardsByGenre = useCallback((genre: string) => {
        return gameBoards.filter(board =>
            board.gameInfo?.genres?.includes(genre)
        );
    }, [gameBoards]);

    // 根据平台过滤
    const getGameBoardsByPlatform = useCallback((platform: string) => {
        return gameBoards.filter(board =>
            board.gameInfo?.platforms?.includes(platform)
        );
    }, [gameBoards]);

    useEffect(() => {
        fetchGameBoards();
    }, [fetchGameBoards]);

    return {
        gameBoards,
        loading,
        error,
        refetch: fetchGameBoards,
        getGameBoardById,
        getGameBoardByName,
        getPopularGameBoards,
        getGameBoardsByGenre,
        getGameBoardsByPlatform
    };
};

// Hook for category statistics
export const useCategoryStats = () => {
    const { categories } = useForumCategories();

    // 计算总统计
    const totalStats = useCallback(() => {
        const totalPosts = categories.reduce((sum, cat) => sum + cat.postCount, 0);
        const totalOnlineUsers = categories.reduce((sum, cat) => sum + cat.onlineUsers, 0);

        return {
            totalCategories: categories.length,
            totalPosts,
            totalOnlineUsers,
            averagePostsPerCategory: categories.length > 0 ? Math.round(totalPosts / categories.length) : 0,
            averageOnlineUsersPerCategory: categories.length > 0 ? Math.round(totalOnlineUsers / categories.length) : 0
        };
    }, [categories]);

    // 获取分类分布数据（用于图表）
    const getCategoryDistribution = useCallback(() => {
        return categories.map(category => ({
            name: category.name,
            value: category.postCount,
            color: category.color
        }));
    }, [categories]);

    // 获取在线用户分布
    const getOnlineUserDistribution = useCallback(() => {
        return categories.map(category => ({
            name: category.name,
            value: category.onlineUsers,
            color: category.color
        }));
    }, [categories]);

    return {
        totalStats: totalStats(),
        getCategoryDistribution,
        getOnlineUserDistribution
    };
};