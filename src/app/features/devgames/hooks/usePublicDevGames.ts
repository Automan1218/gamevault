"use client";

import { useState, useEffect } from "react";
import { devgamesApi } from "../services/devgamesApi";
import { DevGame, DevGameListResponse } from "../types/devGameTypes";

export function usePublicDevGames() {
    const [games, setGames] = useState<DevGame[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize] = useState<number>(12);
    const [totalPages, setTotalPages] = useState<number>(1);

    /**
     * ✅ 获取游戏分页数据（带安全防护）
     */
    const fetchGames = async (page: number = 1): Promise<DevGameListResponse> => {
        setLoading(true);
        try {
            const data: DevGameListResponse = await devgamesApi.getPublicGames(page, pageSize);

            // ✅ 数据容错处理
            const safeGames = Array.isArray(data?.games) ? data.games : [];

            // ✅ 更新内部状态
            setGames(safeGames);
            setTotalPages(data?.totalPages ?? 1);
            setCurrentPage(data?.currentPage ?? 1);

            // ✅ 返回标准化分页结果
            return {
                games: safeGames,
                currentPage: data?.currentPage ?? 1,
                pageSize: pageSize,
                totalCount: data?.totalCount ?? safeGames.length,
                totalPages: data?.totalPages ?? 1,
            };
        } catch (err) {
            console.error("❌ Failed to load public games", err);
            // 保证外部不会 undefined
            return {
                games: [],
                currentPage: 1,
                pageSize,
                totalCount: 0,
                totalPages: 1,
            };
        } finally {
            setLoading(false);
        }
    };

    // ✅ 初始化加载第一页
    useEffect(() => {
        fetchGames(1).catch(console.error);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return {
        games,
        loading,
        currentPage,
        totalPages,
        pageSize,
        fetchGames,
    };
}
