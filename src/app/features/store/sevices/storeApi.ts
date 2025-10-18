import { shopApiClient } from "@/lib/api/client";
import type { GameDTO } from "@/lib/api/StoreTypes";

// 商店API - 使用商城服务客户端（端口8081）
export const storeApi = {
  async getAllGames(): Promise<GameDTO[]> {
    return shopApiClient.get<GameDTO[]>("/games");
  },
  async searchGames(q: string): Promise<GameDTO[]> {
    return shopApiClient.get<GameDTO[]>(`/games/search?q=${q}`);
  },
};
