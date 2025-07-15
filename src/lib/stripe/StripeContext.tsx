"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { loadStripe, Stripe } from "@stripe/stripe-js"

interface StripeContextType {
  stripe: Stripe | null
  loading: boolean
  error: string | null
}

const StripeContext = createContext<StripeContextType>({
  stripe: null,
  loading: true,
  error: null,
})

export const useStripe = () => {
  const context = useContext(StripeContext)
  if (!context) {
    throw new Error("useStripe must be used within a StripeProvider")
  }
  return context
}

interface StripeProviderProps {
  children: React.ReactNode
  publishableKey: string
}

export const StripeProvider: React.FC<StripeProviderProps> = ({
  children,
  publishableKey,
}) => {
  const [stripe, setStripe] = useState<Stripe | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initializeStripe = async () => {
      try {
        setLoading(true)
        const stripeInstance = await loadStripe(publishableKey)
        setStripe(stripeInstance)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load Stripe")
      } finally {
        setLoading(false)
      }
    }

    if (publishableKey) {
      initializeStripe()
    } else {
      setError("Stripe publishable key is required")
      setLoading(false)
    }
  }, [publishableKey])

  return (
    <StripeContext.Provider value={{ stripe, loading, error }}>
      {children}
    </StripeContext.Provider>
  )
}
