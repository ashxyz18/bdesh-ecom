"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Customer = {
  id: string
  name: string
  email: string
  phone?: string
}

type CustomerAuthContextType = {
  customer: Customer | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: { name: string; email: string; password: string; phone?: string }) => Promise<void>
  logout: () => Promise<void>
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined)

export function CustomerAuthProvider({ children, storeId }: { children: ReactNode; storeId: string }) {
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing customer session
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`customer_${storeId}`)
      if (saved) {
        try {
          setCustomer(JSON.parse(saved))
        } catch (e) {
          console.error('Failed to parse customer from localStorage', e)
        }
      }
    }
    setIsLoading(false)
  }, [storeId])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/storefront/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, storeId }),
      })
      if (!res.ok) throw new Error('Login failed')
      const data = await res.json()
      setCustomer(data.customer)
      if (typeof window !== 'undefined') {
        localStorage.setItem(`customer_${storeId}`, JSON.stringify(data.customer))
      }
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (data: { name: string; email: string; password: string; phone?: string }) => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/storefront/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, storeId }),
      })
      if (!res.ok) throw new Error('Registration failed')
      const result = await res.json()
      setCustomer(result.customer)
      if (typeof window !== 'undefined') {
        localStorage.setItem(`customer_${storeId}`, JSON.stringify(result.customer))
      }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setCustomer(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`customer_${storeId}`)
    }
  }

  return (
    <CustomerAuthContext.Provider value={{ customer, isLoading, login, register, logout }}>
      {children}
    </CustomerAuthContext.Provider>
  )
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext)
  if (!context) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider')
  }
  return context
}