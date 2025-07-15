"use client"

import React, { useEffect, useState } from "react"
import { Elements } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { PaymentForm } from "@/components/ui/PaymentForm"

interface CheckoutProps {
  clientSecret: string
  publishableKey: string
}

export function Checkout({ clientSecret, publishableKey }: CheckoutProps) {
  const [stripePromise, setStripePromise] = useState<Promise<any> | null>(null)

  useEffect(() => {
    // Initialize Stripe
    setStripePromise(loadStripe(publishableKey))
  }, [publishableKey])

  return (
    <div className='w-full flex justify-center items-center px-2'>
      <div className='w-full h-screen md:flex md:justify-center md:items-center overflow-y-auto'>
        <div
          style={{
            padding: "1.5rem",
          }}
          className='rounded-2xl backdrop-blur-md'>
          {/* Payment Form */}
          {stripePromise && clientSecret && (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: "night",

                  variables: {
                    colorPrimary: "#7c3aed",
                    colorBackground: "#1f2937",
                    colorText: "#f3f4f6",
                    colorDanger: "#ef4444",
                    fontFamily: "ui-sans-serif, system-ui, sans-serif",
                    spacingUnit: "4px",
                    borderRadius: "8px",
                  },
                  rules: {
                    ".Tab": {
                      border: "1px solid #374151",
                      boxShadow:
                        "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
                    },
                    ".Tab:hover": {
                      color: "#7c3aed",
                      border: "1px solid #7c3aed",
                    },
                    ".Tab--selected": {
                      border: "1px solid #7c3aed",
                      boxShadow: "0 0 0 1px #7c3aed",
                    },
                    ".Input": {
                      border: "1px solid #374151",
                      backgroundColor: "#1f2937",
                    },
                    ".Input:focus": {
                      border: "1px solid #7c3aed",
                      boxShadow: "0 0 0 1px #7c3aed",
                    },
                  },
                },
                loader: "always",
              }}>
              <PaymentForm
                clientSecret={clientSecret}
                onSuccess={(paymentIntent) => {
                  console.log("Payment successful:", paymentIntent)
                  // Redirect to success page will be handled by Stripe's return_url
                }}
                onError={(error) => {
                  console.error("Payment error:", error)
                }}
              />
            </Elements>
          )}
        </div>
      </div>
    </div>
  )
}
