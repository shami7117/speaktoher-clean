import { Suspense } from "react"
import { Checkout } from "@/components/ui/Checkout"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"
import { ErrorDisplay } from "@/components/ui/ErrorDisplay"
import { getPublishableKey } from "@/lib/stripe/stripeConfig"
import { stripeClient } from "@/lib/stripe/stripeConfig"
import StarsCanvas from "@/features/home/components/StarsCanvas"

export const dynamic = "force-dynamic"

async function CheckoutWrapper() {
  try {
    const paymentIntent = await stripeClient.paymentIntents.create({
      amount: Math.round(9.0 * 100),
      currency: "usd",
      setup_future_usage: "off_session",
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: "always",
      },
      metadata: {
        product: "Personal Divine Message",
        priceId: "default",
      },
    })

    const publishableKey = getPublishableKey()

    return (
      <Checkout
        clientSecret={paymentIntent.client_secret!}
        publishableKey={publishableKey}
      />
    )
  } catch (error) {
    console.error("Error creating payment intent:", error)
    return (
      <ErrorDisplay
        error='Failed to initialize checkout. Please try again.'
        onRetry={() => window.location.reload()}
      />
    )
  }
}

export default function CheckoutPage() {
  return (
    <>
      <StarsCanvas />
      <Suspense fallback={<LoadingSpinner message='Loading checkout...' />}>
        <CheckoutWrapper />
      </Suspense>
    </>
  )
}
