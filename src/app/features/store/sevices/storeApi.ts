import { shopApiClient } from "@/lib/api/client";
import type { GameDTO } from "@/lib/api/StoreTypes";
export const dynamic = 'force-dynamic';
// Store API - using shop service client (port 8081)
export const storeApi = {
  async getAllGames(): Promise<GameDTO[]> {
    return shopApiClient.get<GameDTO[]>("/games");
  },
  async searchGames(q: string): Promise<GameDTO[]> {
    return shopApiClient.get<GameDTO[]>(`/games/search?q=${q}`);
  },
};
