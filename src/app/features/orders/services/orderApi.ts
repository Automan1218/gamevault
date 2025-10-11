import { apiClient } from "@/lib/api/client";
import type { OrderDTO } from "@/lib/api/StoreTypes";

// 订单摘要类型（从后端OrderGroupSummaryDTO对应）
export interface OrderSummary {
  orderId: number;
  createdAt: string;
  status: string;
  total: number;
}

// 订单列表响应类型
export interface OrdersResponse {
  items: OrderSummary[];
  totalCount?: number;
}

export const orderApi = {
  /** 获取当前用户所有订单 */
  async getOrders(): Promise<OrderDTO[]> {
    return apiClient.get<OrderDTO[]>("/orders");
  },

  /** 获取订单摘要（用于列表展示） */
  async getOrderSummary(): Promise<OrdersResponse> {
    return apiClient.get<OrdersResponse>("/orders/summary");
  },

  /** 获取单个订单详情 */
  async getOrderById(orderId: number): Promise<any> {
    return apiClient.get<any>(`/orders/${orderId}`);
  },

  /** 模拟支付成功 */
  async payOrder(orderId: number): Promise<OrderDTO> {
    return apiClient.post<OrderDTO>(`/orders/${orderId}/pay`);
  },

  /** 模拟支付失败 */
  async failOrder(orderId: number): Promise<void> {
    return apiClient.post<void>(`/orders/${orderId}/fail`);
  },
};

