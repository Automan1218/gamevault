"use client";
import { useEffect, useState } from "react";
import { devgamesApi } from "../services/devgamesApi";

// 定义热门游戏类型
export interface HotGame {
    id: string;
    name: string;
    description: string;
    coverImageUrl?: string;
    score: number;
}

export function useHotGames(limit: number = 6) {
    const [hotGames, setHotGames] = useState<HotGame[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchHotGames = async () => {
            try {
                const data = (await devgamesApi.getHotGames(limit)) as HotGame[];
                setHotGames(data);
            } catch (err) {
                console.error("🔥 Failed to fetch hot games:", err);
                setError("Failed to load hot games");
            } finally {
                setLoading(false);
            }
        };

        // ✅ 只在浏览器端执行（防止 SSR 阶段访问 localStorage）
        if (typeof window !== "undefined") {
            fetchHotGames();
        }
    }, [limit]);

    return { hotGames, loading, error };
}
