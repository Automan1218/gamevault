"use client";

import { useState, useEffect, useCallback } from "react";
import { orderApi } from "../services/orderApi";
import type { OrderDTO } from "@/lib/api/StoreTypes";

export function useOrders() {
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  /** 📦 获取订单列表（用于订单页面） */
  const fetchOrdersForPage = async () => {
    try {
      setLoading(true);
      const data = await orderApi.getOrders();
      setOrders(data);
    } catch (error) {
      console.error("获取订单失败:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  /** 📦 获取订单摘要（用于library页面的表格） */
  const fetchOrders = useCallback(async (page: number = 0, size: number = 10) => {
    try {
      const response = await orderApi.getOrderSummary();

      // 处理分页（前端分页）
      const start = page * size;
      const end = start + size;
      const paginatedItems = response.items.slice(start, end);

      return {
        items: paginatedItems,
        totalCount: response.items.length,
        success: true,
      };
    } catch (error) {
      console.error("获取订单摘要失败:", error);
      return {
        items: [],
        totalCount: 0,
        success: false,
      };
    }
  }, []);

  /** 🔍 获取订单详情 */
  const fetchOrderDetail = useCallback(async (orderId: number) => {
    try {
      const orderDetail = await orderApi.getOrderById(orderId);
      setSelectedOrder(orderDetail);
      return orderDetail;
    } catch (error) {
      console.error("获取订单详情失败:", error);
      throw error;
    }
  }, []);

  /** 💳 支付成功 */
  const payOrder = async (orderId: number) => {
    const updatedOrder = await orderApi.payOrder(orderId);
    await fetchOrdersForPage(); // 刷新列表
    return updatedOrder;
  };

  /** ❌ 支付失败 */
  const failOrder = async (orderId: number) => {
    await orderApi.failOrder(orderId);
    await fetchOrdersForPage(); // 刷新列表
  };

  useEffect(() => {
    fetchOrdersForPage();
  }, []);

  return { 
    orders, 
    loading, 
    selectedOrder,
    setSelectedOrder,
    fetchOrders,           // 用于library页面的分页查询
    fetchOrderDetail,      // 用于查询订单详情
    payOrder,
    failOrder
  };
}
