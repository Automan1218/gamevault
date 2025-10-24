// src/lib/api/orders.ts
import { apiClient } from './client';
import { ENV } from '@/config/env';

// Orders related type definitions
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
    // Get user order list
    static async getOrders(
        page: number = 0,
        size: number = ENV.DEFAULT_PAGE_SIZE
    ): Promise<OrderListResponse> {
        try {
            const response = await apiClient.authenticatedRequest<{items: Order[]}>('/orders/summary', undefined, {
                method: 'GET'
            });
            
            // Backend already sorted by time, return directly
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
            throw new Error('Failed to get order list');
        }
    }

    // Get order details
    static async getOrderById(orderId: number): Promise<Order> {
        try {
            const response = await apiClient.authenticatedRequest<Order>(`/orders/${orderId}`, undefined, {
                method: 'GET'
            });
            return response;
        } catch (error) {
            console.error(`Failed to fetch order ${orderId}:`, error);
            throw new Error('Failed to get order details');
        }
    }

    // Create new order
    static async createOrder(orderData: CreateOrderRequest): Promise<Order> {
        try {
            const response = await apiClient.authenticatedRequest<OrderDetailResponse>('/orders', orderData, {
                method: 'POST'
            });
            return response.order;
        } catch (error) {
            console.error('Failed to create order:', error);
            throw new Error('Failed to create order');
        }
    }

    // Cancel order
    static async cancelOrder(orderId: number): Promise<void> {
        try {
            await apiClient.authenticatedRequest(`/orders/${orderId}/cancel`, {}, {
                method: 'POST'
            });
        } catch (error) {
            console.error(`Failed to cancel order ${orderId}:`, error);
            throw new Error('Failed to cancel order');
        }
    }

    // Get order statistics
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
            throw new Error('Failed to get order statistics');
        }
    }

    // Search orders
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
            throw new Error('Failed to search orders');
        }
    }
}
