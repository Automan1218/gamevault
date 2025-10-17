import { authApiClient, shopApiClient } from "@/lib/api/client";
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
  /** 获取当前用户所有订单 - 从商城服务（8081）查询（包含finalAmount）*/
  async getOrders(): Promise<OrderDTO[]> {
    return shopApiClient.get<OrderDTO[]>("/orders");
  },

  /** 获取订单摘要（用于列表展示）- 从商城服务（8081）查询 */
  async getOrderSummary(): Promise<OrdersResponse> {
    return shopApiClient.get<OrdersResponse>("/orders/summary");
  },

  /** 获取单个订单详情 - 从商城服务（8081）查询 */
  async getOrderById(orderId: number): Promise<any> {
    return shopApiClient.get<any>(`/orders/${orderId}`);
  },

  /** 模拟支付成功 - 调用商城服务（8081）处理支付和激活码分配 */
  async payOrder(orderId: number): Promise<OrderDTO> {
    return shopApiClient.post<OrderDTO>(`/orders/${orderId}/pay`);
  },

  /** 模拟支付失败 - 调用商城服务（8081）取消订单 */
  async failOrder(orderId: number): Promise<void> {
    return shopApiClient.post<void>(`/orders/${orderId}/fail`);
  },
};

