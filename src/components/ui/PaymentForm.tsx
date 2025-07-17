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
  const [paymentCompleted, setPaymentCompleted] = useState(false)

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
            payment_method_data: {
              billing_details: {
                name: customerName,
                email: customerEmail,
              },
            },
          },
          redirect: "if_required",
        })

      if (confirmPaymentError) {
        const errorMsg =
          confirmPaymentError.message || "An error occurred during payment"
        setMessage(errorMsg)
        onError?.(errorMsg)
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        // Track successful purchase
        trackPurchase(9.0, "USD", "divine_message")
        setPaymentCompleted(true)
        onSuccess?.(paymentIntent)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Payment failed"
      setMessage(errorMessage)
      onError?.(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  // Show success message after payment is completed
  if (paymentCompleted) {
    return (
      <div className='w-full max-w-xl mx-auto'>
        <div className='text-center space-y-6'>
          {/* Success Icon */}
          <div className='flex justify-center mb-6'>
            <div className='w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center'>
              <svg
                className='w-8 h-8 text-green-400'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
                xmlns='http://www.w3.org/2000/svg'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M5 13l4 4L19 7'></path>
              </svg>
            </div>
          </div>

          {/* Success Message */}
          <div className='space-y-4'>
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
              ✨ Payment Successful!
            </h2>
            
            <p className='text-lg text-white/90 font-medium'>
              Your divine message is on its way!
            </p>
            
            <div className='bg-white/5 border border-white/20 rounded-lg p-6 backdrop-blur-sm space-y-3'>
              <div className='flex items-center justify-center mb-3'>
                <svg
                  className='w-5 h-5 text-purple-400 mr-2'
                  fill='currentColor'
                  viewBox='0 0 20 20'>
                  <path d='M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z' />
                  <path d='M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z' />
                </svg>
                <span className='text-white/90 font-medium'>Check Your Email</span>
              </div>
              
              <p className='text-white/80 text-sm leading-relaxed'>
                Your personalized divine message has been sent to:<br />
                <span className='text-white font-medium'>{customerEmail}</span>
              </p>
              
              <div className='bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mt-4'>
                <div className='flex items-center justify-center mb-2'>
                  <svg
                    className='w-4 h-4 text-yellow-400 mr-2'
                    fill='currentColor'
                    viewBox='0 0 20 20'>
                    <path
                      fillRule='evenodd'
                      d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
                      clipRule='evenodd'
                    />
                  </svg>
                  <span className='text-yellow-400 font-medium text-sm'>Important</span>
                </div>
                <p className='text-yellow-200/90 text-xs'>
                  If you don't see the email in your inbox within a few minutes, 
                  <strong> please check your spam/junk folder</strong>. 
                  Sometimes divine messages can end up there!
                </p>
              </div>
            </div>

            <div className='text-center pt-4'>
              <p className='text-white/70 text-sm italic'>
                Thank you for your sacred exchange. May your message bring you clarity and peace. 🙏
              </p>
            </div>
          </div>
        </div>

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
        `}</style>
      </div>
    )
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