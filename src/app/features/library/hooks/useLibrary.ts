// features/library/hooks/useLibrary.ts
import { useState, useEffect, useCallback } from 'react';
import { LibraryApi, OwnedGame } from '@/lib/api';

export const useLibrary = () => {
    const [games, setGames] = useState<OwnedGame[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    // 获取游戏库
    const fetchLibrary = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const gamesData = await LibraryApi.getLibrary();
            setGames(gamesData);
        } catch (err: any) {
            const errorMessage = err?.message || "加载游戏库失败";
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // 搜索游戏
    const searchGames = useCallback((query: string) => {
        setSearchQuery(query);
    }, []);

    // 过滤后的游戏列表
    const filteredGames = games.filter(game => 
        game.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // 刷新游戏库
    const refresh = useCallback(() => {
        fetchLibrary();
    }, [fetchLibrary]);

    // 自动加载
    useEffect(() => {
        fetchLibrary();
    }, [fetchLibrary]);

    return {
        games,
        filteredGames,
        loading,
        error,
        searchQuery,
        setSearchQuery: searchGames,
        refresh,
        fetchLibrary,
    };
};
