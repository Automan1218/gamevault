import { authApiClient, shopApiClient } from "@/lib/api/client";
import type { OrderDTO } from "@/lib/api/StoreTypes";

// Order summary type (corresponding to backend OrderGroupSummaryDTO)
export interface OrderSummary {
  orderId: number;
  createdAt: string;
  status: string;
  total: number;
}
export const dynamic = 'force-dynamic';
// Order list response type
export interface OrdersResponse {
  items: OrderSummary[];
  totalCount?: number;
}

export const orderApi = {
  /** Get all orders for current user - query from shop service (8081) (includes finalAmount) */
  async getOrders(): Promise<OrderDTO[]> {
    return shopApiClient.get<OrderDTO[]>("/orders");
  },

  /** Get order summary (for list display) - query from shop service (8081) */
  async getOrderSummary(): Promise<OrdersResponse> {
    return shopApiClient.get<OrdersResponse>("/orders/summary");
  },

  /** Get single order details - query from shop service (8081) */
  async getOrderById(orderId: number): Promise<any> {
    return shopApiClient.get<any>(`/orders/${orderId}`);
  },

  /** Simulate payment success - call shop service (8081) to handle payment and activation code allocation */
  async payOrder(orderId: number): Promise<OrderDTO> {
    return shopApiClient.post<OrderDTO>(`/orders/${orderId}/pay`);
  },

  /** Simulate payment failure - call shop service (8081) to cancel order */
  async failOrder(orderId: number): Promise<void> {
    return shopApiClient.post<void>(`/orders/${orderId}/fail`);
  },
};

