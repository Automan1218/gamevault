// features/forum/hooks/useForumSearch.ts
import { useState, useCallback, useEffect } from 'react';
import { ForumApi } from '../services/forumApi';
import {
    ForumPost,
    ForumPostFilter,
    ForumSearchForm,
    ForumPostListResponse
} from '../types/forumTypes';

export const useForumSearch = () => {
    const [searchResults, setSearchResults] = useState<ForumPost[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [lastSearchQuery, setLastSearchQuery] = useState<string>('');
    const [lastSearchFilter, setLastSearchFilter] = useState<ForumPostFilter>();

    // 执行搜索
    const search = useCallback(async (
        keyword: string,
        filter?: ForumPostFilter,
        page: number = 0,
        reset: boolean = true
    ) => {
        if (!keyword.trim()) {
            setSearchResults([]);
            setTotalCount(0);
            setHasNextPage(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response: ForumPostListResponse = await ForumApi.searchForumPosts(
                keyword.trim(),
                filter,
                page,
                20
            );

            setSearchResults(prev =>
                reset ? response.posts : [...prev, ...response.posts]
            );
            setHasNextPage(response.currentPage < response.totalPages - 1);
            setCurrentPage(page);
            setTotalCount(response.totalCount);
            setLastSearchQuery(keyword);
            setLastSearchFilter(filter);
        } catch (error: any) {
            setError(error.message);
            console.error('Search failed:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // 加载更多搜索结果
    const loadMore = useCallback(() => {
        if (hasNextPage && !loading && lastSearchQuery) {
            search(lastSearchQuery, lastSearchFilter, currentPage + 1, false);
        }
    }, [hasNextPage, loading, lastSearchQuery, lastSearchFilter, currentPage, search]);

    // 清除搜索结果
    const clearResults = useCallback(() => {
        setSearchResults([]);
        setTotalCount(0);
        setHasNextPage(false);
        setCurrentPage(0);
        setLastSearchQuery('');
        setLastSearchFilter(undefined);
        setError(null);
    }, []);

    return {
        searchResults,
        loading,
        error,
        hasNextPage,
        currentPage,
        totalCount,
        lastSearchQuery,
        search,
        loadMore,
        clearResults
    };
};

// Hook for search suggestions/autocomplete
export const useSearchSuggestions = () => {
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const getSuggestions = useCallback(async (query: string) => {
        if (!query.trim() || query.length < 2) {
            setSuggestions([]);
            return;
        }

        setLoading(true);

        try {
            // 这里应该调用搜索建议API
            // 现在返回模拟数据
            const mockSuggestions = [
                `${query} 攻略`,
                `${query} 技巧`,
                `${query} 评测`,
                `${query} 新手指南`,
                `${query} 队友招募`
            ].filter(suggestion =>
                suggestion.toLowerCase().includes(query.toLowerCase())
            );

            setSuggestions(mockSuggestions);
        } catch (error) {
            console.error('Failed to get suggestions:', error);
            setSuggestions([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const clearSuggestions = useCallback(() => {
        setSuggestions([]);
    }, []);

    return {
        suggestions,
        loading,
        getSuggestions,
        clearSuggestions
    };
};

// Hook for search history
export const useSearchHistory = (maxItems: number = 10) => {
    const [history, setHistory] = useState<string[]>([]);

    const STORAGE_KEY = 'forum_search_history';

    // 加载搜索历史
    const loadHistory = useCallback(() => {
        try {
            const savedHistory = localStorage.getItem(STORAGE_KEY);
            if (savedHistory) {
                const parsed = JSON.parse(savedHistory);
                setHistory(Array.isArray(parsed) ? parsed : []);
            }
        } catch (error) {
            console.error('Failed to load search history:', error);
            setHistory([]);
        }
    }, []);

    // 添加搜索记录
    const addToHistory = useCallback((query: string) => {
        if (!query.trim()) return;

        const newHistory = [
            query.trim(),
            ...history.filter(item => item !== query.trim())
        ].slice(0, maxItems);

        setHistory(newHistory);

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
        } catch (error) {
            console.error('Failed to save search history:', error);
        }
    }, [history, maxItems]);

    // 删除搜索记录
    const removeFromHistory = useCallback((query: string) => {
        const newHistory = history.filter(item => item !== query);
        setHistory(newHistory);

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
        } catch (error) {
            console.error('Failed to update search history:', error);
        }
    }, [history]);

    // 清空搜索历史
    const clearHistory = useCallback(() => {
        setHistory([]);

        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (error) {
            console.error('Failed to clear search history:', error);
        }
    }, []);

    useEffect(() => {
        loadHistory();
    }, [loadHistory]);

    return {
        history,
        addToHistory,
        removeFromHistory,
        clearHistory
    };
};

// Hook for popular search terms
export const usePopularSearchTerms = () => {
    const [popularTerms, setPopularTerms] = useState<Array<{
        term: string;
        count: number;
        trend: 'up' | 'down' | 'stable';
    }>>([]);
    const [loading, setLoading] = useState(false);

    const fetchPopularTerms = useCallback(async () => {
        setLoading(true);

        try {
            // 这里应该调用热门搜索词API
            // 现在返回模拟数据
            const mockTerms = [
                { term: '原神', count: 1250, trend: 'up' as const },
                { term: '王者荣耀', count: 980, trend: 'stable' as const },
                { term: 'CS2', count: 750, trend: 'up' as const },
                { term: '永劫无间', count: 620, trend: 'down' as const },
                { term: 'APEX', count: 580, trend: 'stable' as const },
                { term: '英雄联盟', count: 520, trend: 'down' as const },
                { term: '和平精英', count: 480, trend: 'up' as const },
                { term: '我的世界', count: 420, trend: 'stable' as const }
            ];

            setPopularTerms(mockTerms);
        } catch (error) {
            console.error('Failed to fetch popular terms:', error);
            setPopularTerms([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPopularTerms();
    }, [fetchPopularTerms]);

    return {
        popularTerms,
        loading,
        refetch: fetchPopularTerms
    };
};