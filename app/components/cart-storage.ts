"use client";

import type { CartItem } from "../../lib/cart-types";

export const CART_STORAGE_KEY = "mha-cart-v1";
export const CART_UPDATED_EVENT = "mha-cart-updated";

const isCartItem = (value: unknown): value is CartItem => {
  if (!value || typeof value !== "object") return false;
  const item = value as CartItem;
  return Boolean(item.id && item.title && (item.type === "original" || item.type === "print"));
};

export function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isCartItem) : [];
  } catch {
    return [];
  }
}

export function writeCart(items: CartItem[]) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(CART_UPDATED_EVENT));
}

export function addCartItem(item: CartItem) {
  const items = readCart();
  const existingIndex = items.findIndex((cartItem) => cartItem.id === item.id);

  if (existingIndex >= 0) {
    items[existingIndex] = {
      ...items[existingIndex],
      ...item,
      quantity: item.type === "print" ? (items[existingIndex].quantity ?? 1) + (item.quantity ?? 1) : 1,
    };
  } else {
    items.push({ ...item, quantity: item.quantity ?? 1 });
  }

  writeCart(items);
  return items;
}

export function clearCart() {
  writeCart([]);
}
