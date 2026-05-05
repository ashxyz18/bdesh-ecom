"use client"

import { useState, useEffect, useCallback } from 'react'
import type { StoreProduct } from '../../types'

const MAX_ITEMS = 10

export function useRecentlyViewed(storeId: string) {
  const [productIds, setProductIds] = useState<string[]>([])

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const saved = localStorage.getItem(`recentlyViewed_${storeId}`)
      if (saved) {
        setProductIds(JSON.parse(saved))
      }
    } catch {}
  }, [storeId])

  const addProduct = useCallback((product: StoreProduct) => {
    setProductIds(prev => {
      const filtered = prev.filter(id => id !== product.id)
      const updated = [product.id, ...filtered].slice(0, MAX_ITEMS)
      if (typeof window !== 'undefined') {
        localStorage.setItem(`recentlyViewed_${storeId}`, JSON.stringify(updated))
      }
      return updated
    })
  }, [storeId])

  const getRecentlyViewed = useCallback((allProducts: StoreProduct[]): StoreProduct[] => {
    return productIds
      .map(id => allProducts.find(p => p.id === id))
      .filter((p): p is StoreProduct => p !== undefined)
  }, [productIds])

  const clearRecentlyViewed = useCallback(() => {
    setProductIds([])
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`recentlyViewed_${storeId}`)
    }
  }, [storeId])

  return {
    recentlyViewedIds: productIds,
    addProduct,
    getRecentlyViewed,
    clearRecentlyViewed,
  }
}
