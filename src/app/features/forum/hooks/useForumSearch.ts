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

    // Execute search
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

    // Load more search results
    const loadMore = useCallback(() => {
        if (hasNextPage && !loading && lastSearchQuery) {
            search(lastSearchQuery, lastSearchFilter, currentPage + 1, false);
        }
    }, [hasNextPage, loading, lastSearchQuery, lastSearchFilter, currentPage, search]);

    // Clear search results
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
            // Should call search suggestions API here
            // Now return mock data
            const mockSuggestions = [
                `${query} Guide`,
                `${query} Tips`,
                `${query} Review`,
                `${query} Beginner Guide`,
                `${query} Team Recruitment`
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

    // Load search history
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

    // Add search record
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

    // Remove search record
    const removeFromHistory = useCallback((query: string) => {
        const newHistory = history.filter(item => item !== query);
        setHistory(newHistory);

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
        } catch (error) {
            console.error('Failed to update search history:', error);
        }
    }, [history]);

    // Clear search history
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
            // This should call the popular search terms API
            // Now return mock data
            const mockTerms = [
                { term: 'Genshin Impact', count: 1250, trend: 'up' as const },
                { term: 'Honor of Kings', count: 980, trend: 'stable' as const },
                { term: 'CS2', count: 750, trend: 'up' as const },
                { term: 'Naraka: Bladepoint', count: 620, trend: 'down' as const },
                { term: 'APEX', count: 580, trend: 'stable' as const },
                { term: 'League of Legends', count: 520, trend: 'down' as const },
                { term: 'PUBG Mobile', count: 480, trend: 'up' as const },
                { term: 'Minecraft', count: 420, trend: 'stable' as const }
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