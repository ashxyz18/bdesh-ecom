"use client"

import { useState, useEffect, useCallback } from 'react'
import type { StoreProduct } from '../../types'

export function useWishlist(storeId: string) {
  const [wishlistIds, setWishlistIds] = useState<string[]>([])

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const saved = localStorage.getItem(`wishlist_${storeId}`)
      if (saved) {
        setWishlistIds(JSON.parse(saved))
      }
    } catch {}
  }, [storeId])

  const toggleWishlist = useCallback((product: StoreProduct) => {
    setWishlistIds(prev => {
      const isWishlisted = prev.includes(product.id)
      const updated = isWishlisted
        ? prev.filter(id => id !== product.id)
        : [...prev, product.id]
      if (typeof window !== 'undefined') {
        localStorage.setItem(`wishlist_${storeId}`, JSON.stringify(updated))
      }
      return updated
    })
  }, [storeId])

  const isInWishlist = useCallback((productId: string): boolean => {
    return wishlistIds.includes(productId)
  }, [wishlistIds])

  const getWishlistItems = useCallback((allProducts: StoreProduct[]): StoreProduct[] => {
    return wishlistIds
      .map(id => allProducts.find(p => p.id === id))
      .filter((p): p is StoreProduct => p !== undefined)
  }, [wishlistIds])

  const clearWishlist = useCallback(() => {
    setWishlistIds([])
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`wishlist_${storeId}`)
    }
  }, [storeId])

  return {
    wishlistIds,
    wishlistCount: wishlistIds.length,
    toggleWishlist,
    isInWishlist,
    getWishlistItems,
    clearWishlist,
  }
}
