"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { StoreProduct } from '../../types'

type CartItem = {
  product: StoreProduct
  quantity: number
  variantId?: string
}

type CartContextType = {
  cartItems: CartItem[]
  addToCart: (product: StoreProduct, quantity?: number, variantId?: string) => void
  removeFromCart: (productId: string, variantId?: string) => void
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void
  clearCart: () => void
  itemCount: number
  subtotal: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children, storeId }: { children: ReactNode; storeId: string }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])

  // Load cart from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`cart_${storeId}`)
      if (saved) {
        try {
          setCartItems(JSON.parse(saved))
        } catch (e) {
          console.error('Failed to parse cart from localStorage', e)
        }
      }
    }
  }, [storeId])

  // Save cart to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`cart_${storeId}`, JSON.stringify(cartItems))
    }
  }, [cartItems, storeId])

  const addToCart = (product: StoreProduct, quantity = 1, variantId?: string) => {
    setCartItems(prev => {
      const existing = prev.find(item => 
        item.product.id === product.id && item.variantId === variantId
      )
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id && item.variantId === variantId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }
      return [...prev, { product, quantity, variantId }]
    })
  }

  const removeFromCart = (productId: string, variantId?: string) => {
    setCartItems(prev => prev.filter(item => 
      !(item.product.id === productId && item.variantId === variantId)
    ))
  }

  const updateQuantity = (productId: string, quantity: number, variantId?: string) => {
    setCartItems(prev =>
      prev.map(item =>
        item.product.id === productId && item.variantId === variantId
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      )
    )
  }

  const clearCart = () => setCartItems([])

  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0
  )

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}