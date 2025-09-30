import { apiClient } from '@/lib/api/client';
import type { GameDTO } from '../types/storeTypes';

export const shoppingApi = {
  /**
   * 获取游戏列表
   * /api/games?q=xxx | ?genre=RPG | ?platform=PC
   */
  async getGames(params?: { q?: string; genre?: string; platform?: string }): Promise<GameDTO[]> {
    return apiClient.get<GameDTO[]>('/games', params as Record<string, string>);
  },

  /**
   * 根据 ID 获取游戏详情
   */
  async getGameById(id: number) {
  return apiClient.get<GameDTO>(`/games/${id}`);
},

  /**
   * 搜索游戏（语法糖）
   */
  async searchGames(keyword: string): Promise<GameDTO[]> {
    return this.getGames({ q: keyword });
  },
};
