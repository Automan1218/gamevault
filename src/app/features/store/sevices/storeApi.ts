import { apiClient } from "@/lib/api/client";
import type { GameDTO } from "@/lib/api/StoreTypes";

export const storeApi = {
  async getAllGames(): Promise<GameDTO[]> {
    return apiClient.get<GameDTO[]>("/games");
  },
  async searchGames(q: string): Promise<GameDTO[]> {
    return apiClient.get<GameDTO[]>(`/games/search?q=${q}`);
  },
};
