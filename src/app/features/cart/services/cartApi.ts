import { shopApiClient } from "@/lib/api/client";
import type { CartDTO } from "@/lib/api/StoreTypes";
import type { OrderDTO } from "@/lib/api/StoreTypes";

// 购物车API - 使用商城服务客户端（端口8081）
export const cartApi = {
  async getCart(): Promise<CartDTO> {
    return shopApiClient.get<CartDTO>("/cart");
  },

  async addToCart(gameId: number, quantity: number = 1): Promise<CartDTO> {
    return shopApiClient.post<CartDTO>(`/cart/items?gameId=${gameId}&quantity=${quantity}`);
  },

  async updateQuantity(gameId: number, quantity: number): Promise<CartDTO> {
    return shopApiClient.put<CartDTO>(`/cart/items/${gameId}?quantity=${quantity}`);
  },

  async removeFromCart(gameId: number): Promise<CartDTO> {
    return shopApiClient.delete<CartDTO>(`/cart/items/${gameId}`);
  },

  async clearCart(): Promise<CartDTO> {
    return shopApiClient.delete<CartDTO>("/cart");
  },

  async applyDiscount(strategyType: string): Promise<CartDTO> {
    return shopApiClient.post<CartDTO>("/cart/discount", { strategyType });
  },

  async checkout(method: string): Promise<OrderDTO> {
    return shopApiClient.post<OrderDTO>(`/cart/checkout?method=${method}`);
  },
};
