// src/features/shopping/services/cartApi.ts
import { apiClient } from '@/lib/api/client';
import type { CartDTO, OrderDTO } from '../types/storeTypes';

export const cartApi = {
  // 查看购物车
  async getCart(userId: number): Promise<CartDTO> {
    return apiClient.get<CartDTO>(`/cart/${userId}`);
  },

  // 加入购物车
  async addToCart(userId: number, gameId: number, quantity: number = 1): Promise<CartDTO> {
    return apiClient.post<CartDTO>(`/cart/${userId}/items?gameId=${gameId}&quantity=${quantity}`);
  },

  // 删除购物车某个游戏
  // 删除购物车某个游戏（首选 REST 路径 /items/{gameId}，失败再降级为数量置 0）
async removeFromCart(userId: number, gameId: number): Promise<CartDTO> {
  try {
    return await apiClient.delete<CartDTO>(`/cart/${userId}/items/${gameId}`);
  } catch (err: any) {
    const msg = String(err?.message ?? '');
    if (msg.includes('405') || msg.includes('404')) {
      // 部分后端用“数量更新”为删除
      return await apiClient.post<CartDTO>(
        `/cart/${userId}/items?gameId=${gameId}&quantity=0`
      );
    }
    throw err;
  }
},

  // 清空购物车
  async clearCart(userId: number): Promise<CartDTO> {
    return apiClient.delete<CartDTO>(`/cart/${userId}`);
  },

  // 结账（生成订单）
  async checkout(userId: number, paymentMethod: string): Promise<OrderDTO> {
    return apiClient.post<OrderDTO>(`/orders/checkout?method=${paymentMethod}`);
  },
};
