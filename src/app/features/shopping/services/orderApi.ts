import { apiClient } from '@/lib/api/client';
import type { OrderDTO } from '../types/storeTypes';

export const orderApi = {
  /**
   * 获取当前用户所有订单
   * token → 后端解析 userId
   */
  async getOrders(): Promise<OrderDTO[]> {
    return apiClient.get<OrderDTO[]>('/orders');
  },

  /**
   * 获取单个订单详情
   */
  async getOrderById(orderId: number): Promise<OrderDTO> {
    return apiClient.get<OrderDTO>(`/orders/${orderId}`);
  },

  /**
   * 下单结账
   */
  async checkout(method: string): Promise<OrderDTO> {
    return apiClient.post<OrderDTO>(`/orders/checkout?method=${method}`);
  },

  /**
   * 模拟支付成功
   */
  async payOrder(orderId: number): Promise<OrderDTO> {
    return apiClient.post<OrderDTO>(`/orders/${orderId}/pay`);
  },

  /**
   * 模拟支付失败
   */
  async failOrder(orderId: number): Promise<void> {
    return apiClient.post(`/orders/${orderId}/fail`);
  },
};
