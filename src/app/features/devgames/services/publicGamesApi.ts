// src/app/features/devgames/services/publicGamesApi.ts
import { ENV } from "@/config/env";
import { PublicGame, PublicGameListResponse } from "../types/publicGameTypes";
import { AuthApi } from "@/lib/api"; // 你的获取 token 的工具

const BASE_URL = `${ENV.DEVGAMES_API_URL}/devgame/public`;

function authHeaders() {
    const token = AuthApi.getToken();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
}

export const publicGamesApi = {
    async getAll(page = 1, pageSize = 12): Promise<PublicGameListResponse> {
        const res = await fetch(`${BASE_URL}/all?page=${page}&pageSize=${pageSize}`, {
            method: "GET",
            headers: authHeaders(),
            // 如果你用 Cookie 会话而不是纯 JWT，再打开：
            // credentials: "include",
        });
        if (!res.ok) throw new Error(`Failed to fetch games (${res.status})`);
        return res.json();
    },

    async getById(gameId: string): Promise<PublicGame> {
        const res = await fetch(`${BASE_URL}/${gameId}`, {
            method: "GET",
            headers: authHeaders(),
            // credentials: "include",
        });
        if (!res.ok) throw new Error(`Failed to fetch game (${res.status})`);
        return res.json();
    },

    async recordDownload(gameId: string): Promise<void> {
        const res = await fetch(`${BASE_URL}/${gameId}/download`, {
            method: "POST",
            headers: authHeaders(),
            // credentials: "include",
        });
        if (!res.ok) throw new Error(`Record download failed (${res.status})`);
    },
};
