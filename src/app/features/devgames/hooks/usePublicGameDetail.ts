import { useEffect, useState } from "react";
import { PublicGame } from "../types/publicGameTypes";
import { publicGamesApi } from "../services/publicGamesApi";

export function usePublicGameDetail(gameId: string | undefined) {
    const [game, setGame] = useState<PublicGame | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!gameId) return;

        const fetchData = async () => {
            try {
                const data = await publicGamesApi.getById(gameId);
                setGame(data);
            } catch (err: any) {
                console.error("❌ Failed to load game:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [gameId]);

    return { game, loading, error };
}
