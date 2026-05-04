"use client"

import { ReactNode } from "react"
import { CustomerAuthProvider } from "@/lib/store-templates/shared/context/CustomerAuthContext"
import { CartProvider } from "@/lib/store-templates/shared/context/CartContext"

export function StoreProviders({ storeId, children }: { storeId: string; children: ReactNode }) {
  return (
    <CustomerAuthProvider storeId={storeId}>
      <CartProvider storeId={storeId}>
        {children}
      </CartProvider>
    </CustomerAuthProvider>
  )
}
