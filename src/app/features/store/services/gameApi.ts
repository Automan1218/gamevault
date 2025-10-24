import { shopApiClient } from "@/lib/api/client";
import type { GameDTO } from "@/lib/api/StoreTypes";
// Game API - using shop service client (port 8081)
export const gameApi = {
  /**
   * Get games list
   */
  async getGames(params?: {
    genre?: string;
    platform?: string;
    q?: string;
  }): Promise<GameDTO[]> {
    return shopApiClient.get<GameDTO[]>("/games", params);
  },

  /**
   * Get single game details
   */
  async getGameById(gameId: number): Promise<GameDTO> {
    return shopApiClient.get<GameDTO>(`/games/${gameId}`);
  },

  /**
   * Create new game (admin function)
   */
  async createGame(gameData: Partial<GameDTO>): Promise<GameDTO> {
    return shopApiClient.post<GameDTO>("/games", gameData);
  },

  /**
   * Update game information (admin function)
   */
  async updateGame(gameId: number, gameData: Partial<GameDTO>): Promise<GameDTO> {
    return shopApiClient.put<GameDTO>(`/games/${gameId}`, gameData);
  },

  /**
   * Delete game (admin function)
   */
  async deleteGame(gameId: number): Promise<void> {
    return shopApiClient.delete<void>(`/games/${gameId}`);
  },

  /**
   * Search games
   */
  async searchGames(query: string): Promise<GameDTO[]> {
    return shopApiClient.get<GameDTO[]>("/games", { q: query });
  },

  /**
   * Get games by genre
   */
  async getGamesByGenre(genre: string): Promise<GameDTO[]> {
    return shopApiClient.get<GameDTO[]>("/games", { genre });
  },

  /**
   * Get games by platform
   */
  async getGamesByPlatform(platform: string): Promise<GameDTO[]> {
    return shopApiClient.get<GameDTO[]>("/games", { platform });
  },

  /**
   * Upload game image
   */
  async uploadGameImage(gameId: number, file: File): Promise<{ success: boolean; imageUrl?: string; message: string }> {
    const formData = new FormData();
    formData.append('file', file);
    
    return shopApiClient.post<{ success: boolean; imageUrl?: string; message: string }>(
      `/games/${gameId}/image`,
      formData
    );
  },

  /**
   * Delete game image
   */
  async deleteGameImage(gameId: number): Promise<{ success: boolean; message: string }> {
    return shopApiClient.delete<{ success: boolean; message: string }>(`/games/${gameId}/image`);
  },
};
