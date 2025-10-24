"use client";

import { useState, useEffect } from "react";
import { cartApi } from "../services/cartApi";
import type { CartDTO } from "@/lib/api/StoreTypes";
export const dynamic = 'force-dynamic';
export function useCart() {
  const [cart, setCart] = useState<CartDTO | null>(null);

  /** 🛒 Get cart */
  const fetchCart = async () => {
    const data = await cartApi.getCart();
    setCart(data);
  };

  /** ➕ Add item */
  const addToCart = async (gameId: number, quantity: number = 1) => {
    const data = await cartApi.addToCart(gameId, quantity);
    setCart(data);
  };

  /** 🔄 Update item quantity */
  const updateQuantity = async (gameId: number, quantity: number) => {
    const data = await cartApi.updateQuantity(gameId, quantity);
    setCart(data);
  };

  /** ❌ Remove item */
  const removeFromCart = async (gameId: number) => {
    const data = await cartApi.removeFromCart(gameId);
    setCart(data);
  };

  /** 🧹 Clear cart */
  const clearCart = async () => {
    const data = await cartApi.clearCart();
    setCart(data);
  };

  /** 💳 Checkout */
  const checkout = async (method: string) => {
    await cartApi.checkout(method);
    await fetchCart(); // Refresh cart status after payment
  };

  useEffect(() => {
    fetchCart();
  }, []);

  return { cart, fetchCart, addToCart, updateQuantity, removeFromCart, clearCart, checkout };
}
