import { apiClient } from "@/lib/api/client";
import type { GameDTO } from "@/lib/api/StoreTypes";

export const gameApi = {
  /**
   * 获取游戏列表
   */
  async getGames(params?: {
    genre?: string;
    platform?: string;
    q?: string;
  }): Promise<GameDTO[]> {
    return apiClient.get<GameDTO[]>("/games", params);
  },

  /**
   * 获取单个游戏详情
   */
  async getGameById(gameId: number): Promise<GameDTO> {
    return apiClient.get<GameDTO>(`/games/${gameId}`);
  },

  /**
   * 创建新游戏（管理员功能）
   */
  async createGame(gameData: Partial<GameDTO>): Promise<GameDTO> {
    return apiClient.post<GameDTO>("/games", gameData);
  },

  /**
   * 更新游戏信息（管理员功能）
   */
  async updateGame(gameId: number, gameData: Partial<GameDTO>): Promise<GameDTO> {
    return apiClient.put<GameDTO>(`/games/${gameId}`, gameData);
  },

  /**
   * 删除游戏（管理员功能）
   */
  async deleteGame(gameId: number): Promise<void> {
    return apiClient.delete<void>(`/games/${gameId}`);
  },

  /**
   * 搜索游戏
   */
  async searchGames(query: string): Promise<GameDTO[]> {
    return apiClient.get<GameDTO[]>("/games", { q: query });
  },

  /**
   * 按类型获取游戏
   */
  async getGamesByGenre(genre: string): Promise<GameDTO[]> {
    return apiClient.get<GameDTO[]>("/games", { genre });
  },

  /**
   * 按平台获取游戏
   */
  async getGamesByPlatform(platform: string): Promise<GameDTO[]> {
    return apiClient.get<GameDTO[]>("/games", { platform });
  },

  /**
   * 上传游戏图片
   */
  async uploadGameImage(gameId: number, file: File): Promise<{ success: boolean; imageUrl?: string; message: string }> {
    const formData = new FormData();
    formData.append('file', file);
    
    return apiClient.post<{ success: boolean; imageUrl?: string; message: string }>(
      `/games/${gameId}/image`,
      formData
    );
  },

  /**
   * 删除游戏图片
   */
  async deleteGameImage(gameId: number): Promise<{ success: boolean; message: string }> {
    return apiClient.delete<{ success: boolean; message: string }>(`/games/${gameId}/image`);
  },
};
