"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CartLineItem } from "@/lib/storefront/types";

/**
 * Per-store cart, persisted in localStorage under a key namespaced by storeId
 * so a customer can shop on multiple Bdesh stores without their carts
 * colliding.
 */

interface CartContextShape {
  storeId: string;
  items: CartLineItem[];
  count: number;
  subtotal: number;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  add: (item: Omit<CartLineItem, "quantity"> & { quantity?: number }) => void;
  remove: (productId: string, variantName?: string) => void;
  setQuantity: (productId: string, variantName: string | undefined, quantity: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextShape | null>(null);

function storageKey(storeId: string): string {
  return `bdesh.cart.v1.${storeId}`;
}

export function StoreCartProvider({
  storeId,
  children,
}: {
  storeId: string;
  children: ReactNode;
}) {
  const [items, setItems] = useState<CartLineItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Hydrate from localStorage once on mount.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey(storeId));
      if (raw) setItems(JSON.parse(raw) as CartLineItem[]);
    } catch {
      // Ignore corrupt storage.
    }
    setHydrated(true);
  }, [storeId]);

  // Persist on every change after hydration.
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(storageKey(storeId), JSON.stringify(items));
    } catch {
      // Quota errors etc. - cart will still be in-memory for this session.
    }
  }, [items, storeId, hydrated]);

  const add = useCallback<CartContextShape["add"]>((input) => {
    setItems((prev) => {
      const idx = prev.findIndex(
        (i) => i.productId === input.productId && i.variantName === input.variantName,
      );
      const qty = input.quantity ?? 1;
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + qty };
        return updated;
      }
      return [...prev, { ...input, quantity: qty }];
    });
    setIsOpen(true);
  }, []);

  const remove = useCallback<CartContextShape["remove"]>((productId, variantName) => {
    setItems((prev) =>
      prev.filter((i) => !(i.productId === productId && i.variantName === variantName)),
    );
  }, []);

  const setQuantity = useCallback<CartContextShape["setQuantity"]>(
    (productId, variantName, quantity) => {
      if (quantity <= 0) {
        remove(productId, variantName);
        return;
      }
      setItems((prev) =>
        prev.map((i) =>
          i.productId === productId && i.variantName === variantName
            ? { ...i, quantity }
            : i,
        ),
      );
    },
    [remove],
  );

  const clear = useCallback(() => setItems([]), []);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);

  const value = useMemo<CartContextShape>(() => {
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const count = items.reduce((sum, i) => sum + i.quantity, 0);
    return {
      storeId,
      items,
      subtotal,
      count,
      isOpen,
      open,
      close,
      toggle,
      add,
      remove,
      setQuantity,
      clear,
    };
  }, [items, storeId, isOpen, add, remove, setQuantity, clear, open, close, toggle]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useStoreCart(): CartContextShape {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useStoreCart must be used within <StoreCartProvider>");
  }
  return ctx;
}
