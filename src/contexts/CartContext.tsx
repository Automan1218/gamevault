"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { cartApi } from '@/app/features/cart/services/cartApi';
import type { CartDTO } from '@/lib/api/StoreTypes';

interface CartContextType {
  cart: CartDTO | null;
  loading: boolean;
  fetchCart: () => Promise<void>;
  addToCart: (gameId: number, quantity?: number) => Promise<void>;
  updateQuantity: (gameId: number, quantity: number) => Promise<void>;
  removeFromCart: (gameId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  checkout: (method: string) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartDTO | null>(null);
  const [loading, setLoading] = useState(true);

  /** 🛒 获取购物车 */
  const fetchCart = async () => {
    try {
      setLoading(true);
      const data = await cartApi.getCart();
      setCart(data);
    } catch (error) {
      console.error('获取购物车失败:', error);
    } finally {
      setLoading(false);
    }
  };

  /** ➕ 添加商品 */
  const addToCart = async (gameId: number, quantity: number = 1) => {
    try {
      const data = await cartApi.addToCart(gameId, quantity);
      setCart(data);
    } catch (error) {
      console.error('添加到购物车失败:', error);
      throw error;
    }
  };

  /** 🔄 更新商品数量 */
  const updateQuantity = async (gameId: number, quantity: number) => {
    try {
      const data = await cartApi.updateQuantity(gameId, quantity);
      setCart(data);
    } catch (error) {
      console.error('更新数量失败:', error);
      throw error;
    }
  };

  /** ❌ 移除商品 */
  const removeFromCart = async (gameId: number) => {
    try {
      const data = await cartApi.removeFromCart(gameId);
      setCart(data);
    } catch (error) {
      console.error('移除商品失败:', error);
      throw error;
    }
  };

  /** 🧹 清空购物车 */
  const clearCart = async () => {
    try {
      const data = await cartApi.clearCart();
      setCart(data);
    } catch (error) {
      console.error('清空购物车失败:', error);
      throw error;
    }
  };

  /** 💳 结账 */
  const checkout = async (method: string) => {
    try {
      await cartApi.checkout(method);
      await fetchCart(); // 支付后刷新购物车状态
    } catch (error) {
      console.error('结账失败:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        checkout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

