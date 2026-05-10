"use client"

import { ReactNode } from "react"

export function StoreProviders({ storeId, children }: { storeId: string; children: ReactNode }) {
  return (
    <>{children}</>
  )
}
