"use client";

import { useState, useEffect } from "react";
import { cartApi } from "../services/cartApi";
import type { CartDTO } from "@/lib/api/StoreTypes";

export function useCart() {
  const [cart, setCart] = useState<CartDTO | null>(null);

  /** 🛒 获取购物车 */
  const fetchCart = async () => {
    const data = await cartApi.getCart();
    setCart(data);
  };

  /** ➕ 添加商品 */
  const addToCart = async (gameId: number, quantity: number = 1) => {
    const data = await cartApi.addToCart(gameId, quantity);
    setCart(data);
  };

  /** 🔄 更新商品数量 */
  const updateQuantity = async (gameId: number, quantity: number) => {
    const data = await cartApi.updateQuantity(gameId, quantity);
    setCart(data);
  };

  /** ❌ 移除商品 */
  const removeFromCart = async (gameId: number) => {
    const data = await cartApi.removeFromCart(gameId);
    setCart(data);
  };

  /** 🧹 清空购物车 */
  const clearCart = async () => {
    const data = await cartApi.clearCart();
    setCart(data);
  };

  /** 💳 结账 */
  const checkout = async (method: string) => {
    await cartApi.checkout(method);
    await fetchCart(); // 支付后刷新购物车状态
  };

  useEffect(() => {
    fetchCart();
  }, []);

  return { cart, fetchCart, addToCart, updateQuantity, removeFromCart, clearCart, checkout };
}
