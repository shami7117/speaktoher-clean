"use client"

import React, { useState, useEffect } from "react"
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js"
import { attachCustomerToPaymentIntent } from "@/features/checkout/actions/checkoutActions"
import { useTikTok } from "@/contexts/TikTokPixelProvider"

interface PaymentFormProps {
  clientSecret: string
  onSuccess?: (paymentIntent: any) => void
  onError?: (error: string) => void
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  clientSecret,
  onSuccess,
  onError,
}) => {
  const stripe = useStripe()
  const elements = useElements()
  const { trackPurchase } = useTikTok()

  const [isProcessing, setIsProcessing] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [customerName, setCustomerName] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [whisper, setWhisper] = useState("")

  useEffect(() => {
    if (typeof window !== "undefined") {
      const divineResponse = localStorage.getItem("divineResponse")
      if (divineResponse) {
        setWhisper(divineResponse)
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setIsProcessing(true)
    setMessage(null)

    try {
      const { error: attachCustomerError, customerId } =
        await attachCustomerToPaymentIntent(
          clientSecret,
          customerName,
          customerEmail
        )

      if (attachCustomerError) {
        setMessage(attachCustomerError)
        onError?.(attachCustomerError)
        return
      }

      if (!customerId) {
        setMessage("Failed to create customer profile. Please try again.")
        onError?.("Failed to create customer profile. Please try again.")
        return
      }

      localStorage.setItem("customerId", customerId)
      localStorage.setItem("customerName", customerName)
      localStorage.setItem("customerEmail", customerEmail)

      // @ts-ignore
      const { error: confirmPaymentError, paymentIntent } =
        await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: `${window.location.origin}?payment_success=true&customer_id=${customerId}`,
            payment_method_data: {
              billing_details: {
                name: customerName,
                email: customerEmail,
              },
            },
          },
          redirect: "always",
        })

      if (confirmPaymentError) {
        const errorMsg =
          confirmPaymentError.message || "An error occurred during payment"
        setMessage(errorMsg)
        onError?.(errorMsg)
      } else {
        // Track successful purchase
        trackPurchase(9.0, "USD", "divine_message")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Payment failed"
      setMessage(errorMessage)
      onError?.(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className='w-full max-w-xl mx-auto'>
      <form onSubmit={handleSubmit} className='space-y-8 w-full'>
        {/* Header */}
        <div className='text-center pb-8'>
          <h2
            className='text-2xl font-bold text-white'
            style={{
              textShadow: "0 0 8px rgba(255, 255, 255, 0.2)",
              background: "linear-gradient(135deg, #fff, #a889ff, #fff)",
              backgroundSize: "200% 200%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: "shimmer 3s ease-in-out infinite",
            }}>
            Complete Your Sacred Exchange
          </h2>
          <p className='text-sm text-white/70 font-light italic'>
            Receive your divine message in moments
          </p>
        </div>

        {/* Customer Information */}
        <div className='flex flex-col gap-6'>
          <div>
            <label
              htmlFor='name-input'
              className='block text-sm text-center font-medium text-white/90 mb-3'>
              What name should we attach to your message?
            </label>
            <input
              type='text'
              id='name-input'
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder='Enter your name'
              required
              autoComplete='name'
              className='w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 text-white placeholder-white/40 backdrop-blur-sm text-center'
              style={{ boxShadow: "0 0 8px rgba(255, 255, 255, 0.1)" }}
            />
          </div>

          <div>
            <label
              htmlFor='email-input'
              className='block text-sm text-center font-medium text-white/90 mb-3'>
              Where should we send your personal message?
            </label>
            <input
              type='email'
              id='email-input'
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder='Enter your email'
              required
              autoComplete='email'
              className='w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 text-white placeholder-white/40 backdrop-blur-sm text-center'
              style={{ boxShadow: "0 0 8px rgba(255, 255, 255, 0.1)" }}
            />
          </div>
        </div>

        {/* Payment Element */}
        <div
          style={{
            paddingTop: "1rem",
          }}
          className='space-y-4'>
          <div className='text-center'>
            <h3
              style={{
                marginBottom: "1rem",
              }}
              className='text-lg font-medium text-white/90'>
              ✨ Payment Information
            </h3>
            <div
              className='bg-white/5 border border-white/20 rounded-lg p-4 backdrop-blur-sm'
              style={{ boxShadow: "0 0 8px rgba(255, 255, 255, 0.1)" }}>
              <PaymentElement
                options={{
                  paymentMethodOrder: ["card"],
                  layout: { type: "tabs" },
                }}
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className='pt-6'>
          <button
            id='pay-button'
            type='submit'
            disabled={!stripe || isProcessing}
            className='w-full text-white py-4 px-6 rounded-lg font-medium shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden'
            style={{
              background: "linear-gradient(135deg, #a889ff, #c4b0ff, #a889ff)",
              backgroundSize: "200% 200%",
              animation: "gradient-shift 3s ease-in-out infinite",
              boxShadow:
                "0 4px 15px rgba(168, 137, 255, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.2)",
            }}>
            {isProcessing ? (
              <span className='flex items-center justify-center'>
                <svg
                  className='animate-spin -ml-1 mr-3 h-5 w-5 text-white'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'>
                  <circle
                    className='opacity-25'
                    cx='12'
                    cy='12'
                    r='10'
                    stroke='currentColor'
                    strokeWidth='4'></circle>
                  <path
                    className='opacity-75'
                    fill='currentColor'
                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                </svg>
                Processing divine connection...
              </span>
            ) : (
              "Complete Payment — $9"
            )}
          </button>
        </div>

        {/* Error Message */}
        {message && (
          <div className='text-center'>
            <p className='text-red-400 text-sm'>{message}</p>
          </div>
        )}

        {/* Security Info */}
        <div className='text-xs text-white/60 text-center p-4 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm'>
          <div className='flex items-center justify-center mb-2'>
            <svg
              className='w-4 h-4 text-green-400 mr-2'
              fill='currentColor'
              viewBox='0 0 20 20'>
              <path
                fillRule='evenodd'
                d='M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z'
                clipRule='evenodd'
              />
            </svg>
            Secure Payment
          </div>
          <p className='text-white/70'>
            Payments are processed securely by Stripe servers. We do not store
            any payment information.
          </p>
        </div>

        {/* Stripe Logo */}
        <div className='flex justify-center pt-4'>
          <img
            src='https://images.squarespace-cdn.com/content/v1/64a0699554c0fd6a9b3fdcf4/0b0ac8ad-cb27-4698-8fb1-69b3959fd428/icons_stripe.png'
            alt='powered by stripe'
            className='w-20 h-auto opacity-50 hover:opacity-70 transition-opacity duration-200'
          />
        </div>
      </form>

      <style jsx>{`
        @keyframes shimmer {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes gradient-shift {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
      `}</style>
    </div>
  )
}
