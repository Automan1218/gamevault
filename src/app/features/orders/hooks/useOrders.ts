// features/orders/hooks/useOrders.ts
import { useState, useCallback } from 'react';
import { OrdersApi, Order } from '@/lib/api';

export const useOrders = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    // 获取订单列表
    const fetchOrders = useCallback(async (page: number = 0, size: number = 10) => {
        try {
            setLoading(true);
            setError(null);
            const response = await OrdersApi.getOrders(page, size);
            setOrders(response.items);
            return response;
        } catch (err: any) {
            const errorMessage = err?.message || "获取订单列表失败";
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // 获取订单详情
    const fetchOrderDetail = useCallback(async (orderId: number) => {
        try {
            setLoading(true);
            setError(null);
            const order = await OrdersApi.getOrderById(orderId);
            setSelectedOrder(order);
            return order;
        } catch (err: any) {
            const errorMessage = err?.message || "获取订单详情失败";
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // 取消订单
    const cancelOrder = useCallback(async (orderId: number) => {
        try {
            setLoading(true);
            setError(null);
            await OrdersApi.cancelOrder(orderId);
            // 刷新订单列表
            await fetchOrders();
        } catch (err: any) {
            const errorMessage = err?.message || "取消订单失败";
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchOrders]);

    // 刷新订单列表
    const refresh = useCallback(() => {
        fetchOrders();
    }, [fetchOrders]);

    return {
        orders,
        selectedOrder,
        loading,
        error,
        fetchOrders,
        fetchOrderDetail,
        cancelOrder,
        refresh,
        setSelectedOrder,
    };
};
