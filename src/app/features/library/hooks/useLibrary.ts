// features/library/hooks/useLibrary.ts
import { useState, useEffect, useCallback } from 'react';
import { LibraryApi, OwnedGame } from '@/lib/api';

export const useLibrary = () => {
    const [games, setGames] = useState<OwnedGame[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    // Get game library
    const fetchLibrary = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const gamesData = await LibraryApi.getLibrary();
            setGames(gamesData);
        } catch (err: any) {
            const errorMessage = err?.message || "Failed to load game library";
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Search games
    const searchGames = useCallback((query: string) => {
        setSearchQuery(query);
    }, []);

    // Filtered games list
    const filteredGames = games.filter(game => 
        game.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Refresh game library
    const refresh = useCallback(() => {
        fetchLibrary();
    }, [fetchLibrary]);

    // Auto load
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
