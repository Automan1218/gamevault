// src/lib/api/orders.ts
import { apiClient } from './client';
import { ENV } from '@/config/env';

// Orders 相关类型定义
export interface Order {
    orderId: number;
    createdAt: string;
    status: string;
    total: number;
    items?: OrderItem[];
    activationCodes?: string[];
    paymentMethod?: string;
    paymentId?: string;
    notes?: string;
}

export interface OrderItem {
    orderItemId: number;
    orderId: number;
    userId: number;
    gameId: number;
    unitPrice: number;
    discountPrice?: number;
    orderDate: string;
    orderStatus: string;
    activationCodes?: string[];
}

export interface OrderListResponse {
    items: Order[];
    totalCount: number;
    currentPage: number;
    pageSize: number;
    totalPages: number;
}

export interface OrderDetailResponse {
    order: Order;
}

export interface CreateOrderRequest {
    items: {
        gameId: number;
        quantity: number;
    }[];
    paymentMethod?: string;
    notes?: string;
}

export class OrdersApi {
    // 获取用户订单列表
    static async getOrders(
        page: number = 0,
        size: number = ENV.DEFAULT_PAGE_SIZE
    ): Promise<OrderListResponse> {
        try {
            const response = await apiClient.authenticatedRequest<{items: Order[]}>('/orders/summary', undefined, {
                method: 'GET'
            });
            
            // 后端已经按时间排序，直接返回
            const items = response.items || [];
            
            return {
                items: items,
                totalCount: items.length,
                currentPage: 0,
                pageSize: items.length,
                totalPages: 1
            };
        } catch (error) {
            console.error('Failed to fetch orders:', error);
            throw new Error('获取订单列表失败');
        }
    }

    // 获取订单详情
    static async getOrderById(orderId: number): Promise<Order> {
        try {
            const response = await apiClient.authenticatedRequest<Order>(`/orders/${orderId}`, undefined, {
                method: 'GET'
            });
            return response;
        } catch (error) {
            console.error(`Failed to fetch order ${orderId}:`, error);
            throw new Error('获取订单详情失败');
        }
    }

    // 创建新订单
    static async createOrder(orderData: CreateOrderRequest): Promise<Order> {
        try {
            const response = await apiClient.authenticatedRequest<OrderDetailResponse>('/orders', orderData, {
                method: 'POST'
            });
            return response.order;
        } catch (error) {
            console.error('Failed to create order:', error);
            throw new Error('创建订单失败');
        }
    }

    // 取消订单
    static async cancelOrder(orderId: number): Promise<void> {
        try {
            await apiClient.authenticatedRequest(`/orders/${orderId}/cancel`, {}, {
                method: 'POST'
            });
        } catch (error) {
            console.error(`Failed to cancel order ${orderId}:`, error);
            throw new Error('取消订单失败');
        }
    }

    // 获取订单统计
    static async getOrderStats(): Promise<{
        totalOrders: number;
        totalSpent: number;
        pendingOrders: number;
        completedOrders: number;
    }> {
        try {
            const response = await apiClient.authenticatedRequest<{
                totalOrders: number;
                totalSpent: number;
                pendingOrders: number;
                completedOrders: number;
            }>('/orders/stats', undefined, {
                method: 'GET'
            });
            return response;
        } catch (error) {
            console.error('Failed to fetch order stats:', error);
            throw new Error('获取订单统计失败');
        }
    }

    // 搜索订单
    static async searchOrders(
        keyword: string,
        page: number = 0,
        size: number = ENV.DEFAULT_PAGE_SIZE
    ): Promise<OrderListResponse> {
        try {
            const response = await apiClient.authenticatedRequest<OrderListResponse>('/orders/search', undefined, {
                method: 'GET',
                params: {
                    keyword,
                    page,
                    size: Math.min(size, ENV.MAX_PAGE_SIZE)
                }
            });
            return response;
        } catch (error) {
            console.error('Failed to search orders:', error);
            throw new Error('搜索订单失败');
        }
    }
}
