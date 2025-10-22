import {
    DevGame,
    DevGameListResponse,
    UploadDevGameRequest,
    DevDashboardDetailedResponse,
} from "../types/devGameTypes";
import { ENV } from "@/config/env";
import { AuthApi } from "@/lib/api";

const BASE_URL = ENV.DEVGAMES_API_URL;

/**
 * 🔧 通用请求封装 — 自动带 Token + 错误处理
 */
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = AuthApi.getToken();
    const headers: HeadersInit = {
        ...(options.headers || {}),
        ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const res = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!res.ok) {
        const msg = await res.text();
        throw new Error(`[${res.status}] ${msg || "Request failed"}`);
    }

    // 若无内容返回（DELETE 等）
    if (res.status === 204) return {} as T;
    return res.json();
}

/**
 * 🔧 文件上传通用封装 (multipart/form-data)
 */
async function requestFile<T>(endpoint: string, method: string, body: FormData): Promise<T> {
    const token = AuthApi.getToken();
    const res = await fetch(`${BASE_URL}${endpoint}`, {
        method,
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body,
    });

    if (!res.ok) {
        const msg = await res.text();
        throw new Error(`[${res.status}] ${msg || "Upload failed"}`);
    }
    return res.json();
}

/**
 * 🎮 开发者相关接口合集
 */
export const devgamesApi = {
    /** 🎮 上传游戏 */
    async upload(request: UploadDevGameRequest): Promise<DevGame> {
        const fd = new FormData();
        fd.append("name", request.name);
        fd.append("description", request.description);
        fd.append("releaseDate", request.releaseDate);
        fd.append("image", request.image);
        if (request.video) fd.append("video", request.video);
        fd.append("zip", request.zip);

        return requestFile<DevGame>(`/devgame/upload`, "POST", fd);
    },

    /** 🗂 获取我的游戏 */
    async getMyGames(): Promise<DevGame[]> {
        return request<DevGame[]>(`/devgame/my`, { method: "GET" });
    },

    /** ❌ 删除游戏 */
    async deleteGame(gameId: string): Promise<void> {
        return request<void>(`/devgame/${gameId}`, { method: "DELETE" });
    },

    /** 🔍 根据 ID 获取游戏详情 */
    async getGameById(gameId: string): Promise<DevGame> {
        return request<DevGame>(`/devgame/${gameId}`, { method: "GET" });
    },

    /** ✏️ 更新游戏 */
    async updateGame(gameId: string, formData: FormData): Promise<DevGame> {
        return requestFile<DevGame>(`/devgame/update/${gameId}`, "PUT", formData);
    },

    /** 🌐 获取公开游戏分页 */
    async getPublicGames(page: number, pageSize: number): Promise<DevGameListResponse> {
        return request<DevGameListResponse>(
            `/devgame/public/all?page=${page}&pageSize=${pageSize}`,
            { method: "GET" }
        );
    },

    /** ⬇️ 记录下载事件 */
    async recordDownload(gameId: string): Promise<void> {
        return request<void>(`/devgame/public/${gameId}/download`, {
            method: "POST",
            headers: { "X-Requested-By": "GameVault-Frontend" },
            credentials: "include",
        });
    },

    /** 🔥 获取热门游戏 */
    async getHotGames(limit: number = 6) {
        return request(`/devgame/public/hot?limit=${limit}`, { method: "GET" });
    },

    /**
     * 📊 获取开发者仪表盘数据（Dashboard）
     * ✅ 自动识别当前登录用户（通过 JWT）
     * ✅ 无需传 developerId
     */
    async getDeveloperDashboard(): Promise<DevDashboardDetailedResponse> {
        return request<DevDashboardDetailedResponse>(`/dev/statistics/dashboard/me`, { method: "GET" });
    },
};
