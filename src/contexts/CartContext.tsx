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

  /** 🛒 Get cart */
  const fetchCart = async () => {
    try {
      setLoading(true);
      const data = await cartApi.getCart();
      setCart(data);
    } catch (error) {
      console.error('Failed to get cart:', error);
    } finally {
      setLoading(false);
    }
  };

  /** ➕ Add item */
  const addToCart = async (gameId: number, quantity: number = 1) => {
    try {
      const data = await cartApi.addToCart(gameId, quantity);
      setCart(data);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      throw error;
    }
  };

  /** 🔄 Update item quantity */
  const updateQuantity = async (gameId: number, quantity: number) => {
    try {
      const data = await cartApi.updateQuantity(gameId, quantity);
      setCart(data);
    } catch (error) {
      console.error('Failed to update quantity:', error);
      throw error;
    }
  };

  /** ❌ Remove item */
  const removeFromCart = async (gameId: number) => {
    try {
      const data = await cartApi.removeFromCart(gameId);
      setCart(data);
    } catch (error) {
      console.error('Failed to remove item:', error);
      throw error;
    }
  };

  /** 🧹 Clear cart */
  const clearCart = async () => {
    try {
      const data = await cartApi.clearCart();
      setCart(data);
    } catch (error) {
      console.error('Failed to clear cart:', error);
      throw error;
    }
  };

  /** 💳 Checkout */
  const checkout = async (method: string) => {
    try {
      await cartApi.checkout(method);
      await fetchCart(); // Refresh cart status after payment
    } catch (error) {
      console.error('Checkout failed:', error);
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

