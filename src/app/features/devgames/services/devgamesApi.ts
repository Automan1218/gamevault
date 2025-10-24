import {
    DevGame,
    DevGameListResponse,
    UploadDevGameRequest,
    DevDashboardDetailedResponse,
} from "../types/devGameTypes";
import { ENV } from "@/config/env";
import { AuthApi } from "@/lib/api";

const BASE_URL = ENV.DEVGAMES_API_URL;
export const dynamic = 'force-dynamic';
/**
 * 🔧 Generic request wrapper — Auto include Token + error handling
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

    // If no content returned (DELETE etc.)
    if (res.status === 204) return {} as T;
    return res.json();
}

/**
 * 🔧 File upload generic wrapper (multipart/form-data)
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
 * 🎮 Developer related API collection
 */
export const devgamesApi = {
    /** 🎮 Upload game */
    async upload(request: UploadDevGameRequest): Promise<DevGame> {
        const fd = new FormData();
        fd.append("name", request.name);
        fd.append("description", request.description);
        fd.append("releaseDate", request.releaseDate);
        fd.append("image", request.image);
        if (request.video) {
            fd.append("video", request.video);
        }
        fd.append("zip", request.zip);

        return requestFile<DevGame>(`/devgame/upload`, "POST", fd);
    },

    /** 🗂 Get my games */
    async getMyGames(): Promise<DevGame[]> {
        return request<DevGame[]>(`/devgame/my`, { method: "GET" });
    },

    /** ❌ Delete game */
    async deleteGame(gameId: string): Promise<void> {
        return request<void>(`/devgame/${gameId}`, { method: "DELETE" });
    },

    /** 🔍 Get game details by ID */
    async getGameById(gameId: string): Promise<DevGame> {
        return request<DevGame>(`/devgame/${gameId}`, { method: "GET" });
    },

    /** ✏️ Update game */
    async updateGame(gameId: string, formData: FormData): Promise<DevGame> {
        return requestFile<DevGame>(`/devgame/update/${gameId}`, "PUT", formData);
    },

    /** 🌐 Get public games pagination */
    async getPublicGames(page: number, pageSize: number): Promise<DevGameListResponse> {
        return request<DevGameListResponse>(
            `/devgame/public/all?page=${page}&pageSize=${pageSize}`,
            { method: "GET" }
        );
    },

    /** ⬇️ Record download event */
    async recordDownload(gameId: string): Promise<void> {
        return request<void>(`/devgame/public/${gameId}/download`, {
            method: "POST",
            headers: { "X-Requested-By": "GameVault-Frontend" },
            credentials: "include",
        });
    },

    /** 🔥 Get hot games */
    async getHotGames(limit: number = 6) {
        return request(`/devgame/public/hot?limit=${limit}`, { method: "GET" });
    },

    /**
     * 📊 Get developer dashboard data (Dashboard)
     * ✅ Auto identify current logged in user (via JWT)
     * ✅ No need to pass developerId
     */
    async getDeveloperDashboard(): Promise<DevDashboardDetailedResponse> {
        return request<DevDashboardDetailedResponse>(`/dev/statistics/dashboard/me`, { method: "GET" });
    },
};
