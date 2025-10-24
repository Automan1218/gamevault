"use client";

import { useState, useEffect, useCallback } from "react";
import { orderApi } from "../services/orderApi";
import type { OrderDTO } from "@/lib/api/StoreTypes";

export function useOrders() {
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  /** 📦 Get orders list (for orders page) */
  const fetchOrdersForPage = async () => {
    try {
      setLoading(true);
      const data = await orderApi.getOrders();
      setOrders(data);
    } catch (error) {
      console.error("Failed to get orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  /** 📦 Get order summary (for library page table) */
  const fetchOrders = useCallback(async (page: number = 0, size: number = 10) => {
    try {
      const response = await orderApi.getOrderSummary();

      // Handle pagination (frontend pagination)
      const start = page * size;
      const end = start + size;
      const paginatedItems = response.items.slice(start, end);

      return {
        items: paginatedItems,
        totalCount: response.items.length,
        success: true,
      };
    } catch (error) {
      console.error("Failed to get order summary:", error);
      return {
        items: [],
        totalCount: 0,
        success: false,
      };
    }
  }, []);

  /** 🔍 Get order details */
  const fetchOrderDetail = useCallback(async (orderId: number) => {
    try {
      const orderDetail = await orderApi.getOrderById(orderId);
      setSelectedOrder(orderDetail);
      return orderDetail;
    } catch (error) {
      console.error("Failed to get order details:", error);
      throw error;
    }
  }, []);

  /** 💳 Payment success */
  const payOrder = async (orderId: number) => {
    const updatedOrder = await orderApi.payOrder(orderId);
    await fetchOrdersForPage(); // Refresh list
    return updatedOrder;
  };

  /** ❌ Payment failure */
  const failOrder = async (orderId: number) => {
    await orderApi.failOrder(orderId);
    await fetchOrdersForPage(); // Refresh list
  };

  useEffect(() => {
    fetchOrdersForPage();
  }, []);

  return { 
    orders, 
    loading, 
    selectedOrder,
    setSelectedOrder,
    fetchOrders,           // For library page pagination query
    fetchOrderDetail,      // For querying order details
    payOrder,
    failOrder
  };
}
