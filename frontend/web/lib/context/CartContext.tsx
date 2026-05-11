"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { CartItem } from '@/lib/templates/types';

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (productId: string, variantName?: string) => void;
  updateQuantity: (productId: string, variantName: string | undefined, quantity: number) => void;
  clearCart: () => void;
  total: number;
  count: number;
  isInCart: (productId: string, variantName?: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'bdeshshop_cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      try {
        setItems(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse cart:', e);
      }
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, isInitialized]);

  const addItem = useCallback((item: Omit<CartItem, 'quantity'>) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (i) => i.productId === item.productId && i.variantName === item.variantName
      );

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        return updated;
      }

      return [...prev, { ...item, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((productId: string, variantName?: string) => {
    setItems((prev) =>
      prev.filter((i) => !(i.productId === productId && i.variantName === variantName))
    );
  }, []);

  const updateQuantity = useCallback(
    (productId: string, variantName: string | undefined, quantity: number) => {
      if (quantity <= 0) {
        removeItem(productId, variantName);
        return;
      }

      setItems((prev) =>
        prev.map((i) =>
          i.productId === productId && i.variantName === variantName
            ? { ...i, quantity }
            : i
        )
      );
    },
    [removeItem]
  );

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const isInCart = useCallback(
    (productId: string, variantName?: string) => {
      return items.some(
        (i) => i.productId === productId && i.variantName === variantName
      );
    },
    [items]
  );

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        total,
        count,
        isInCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}