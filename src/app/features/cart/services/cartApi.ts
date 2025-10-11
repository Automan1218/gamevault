import { apiClient } from "@/lib/api/client";
import type { CartDTO } from "@/lib/api/StoreTypes";
import type { OrderDTO } from "@/lib/api/StoreTypes";

export const cartApi = {
  async getCart(): Promise<CartDTO> {
    return apiClient.get<CartDTO>("/cart");
  },

  async addToCart(gameId: number, quantity: number = 1): Promise<CartDTO> {
    return apiClient.post<CartDTO>(`/cart/items?gameId=${gameId}&quantity=${quantity}`);
  },

  async updateQuantity(gameId: number, quantity: number): Promise<CartDTO> {
    return apiClient.put<CartDTO>(`/cart/items/${gameId}?quantity=${quantity}`);
  },

  async removeFromCart(gameId: number): Promise<CartDTO> {
    return apiClient.delete<CartDTO>(`/cart/items/${gameId}`);
  },

  async clearCart(): Promise<CartDTO> {
    return apiClient.delete<CartDTO>("/cart");
  },

  async applyDiscount(strategyType: string): Promise<CartDTO> {
    return apiClient.post<CartDTO>("/cart/discount", { strategyType });
  },

  async checkout(method: string): Promise<OrderDTO> {
    return apiClient.post<OrderDTO>(`/cart/checkout?method=${method}`);
  },
};
