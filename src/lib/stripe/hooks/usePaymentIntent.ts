"use client"

import { useState, useCallback } from "react"

interface PaymentIntentOptions {
  amount: number
  currency?: string
}

interface PaymentIntentState {
  clientSecret: string | null
  loading: boolean
  error: string | null
}

export const usePaymentIntent = () => {
  const [state, setState] = useState<PaymentIntentState>({
    clientSecret: null,
    loading: false,
    error: null,
  })

  const createPaymentIntent = useCallback(
    async (options: PaymentIntentOptions) => {
      setState((prev) => ({ ...prev, loading: true, error: null }))

      try {
        const response = await fetch("/api/create-payment-intent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: options.amount,
            currency: options.currency || "usd",
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to create payment intent")
        }

        const data = await response.json()
        setState({
          clientSecret: data.clientSecret,
          loading: false,
          error: null,
        })

        return data.clientSecret
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to create payment intent"
        setState({
          clientSecret: null,
          loading: false,
          error: errorMessage,
        })
        throw error
      }
    },
    []
  )

  const reset = useCallback(() => {
    setState({
      clientSecret: null,
      loading: false,
      error: null,
    })
  }, [])

  return {
    ...state,
    createPaymentIntent,
    reset,
  }
}
