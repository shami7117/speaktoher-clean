import { stripeEdgeClient } from "@/lib/stripe/stripeEdgeClient"
import { NextRequest, NextResponse } from "next/server"

let customerId = ""
let isMember = false

async function getIsMember(paymentIntentId: string) {
  const paymentIntent = await stripeEdgeClient.retrievePaymentIntent(
    paymentIntentId
  )
  const isMember =
    paymentIntent.status === "succeeded" &&
    paymentIntent.metadata?.customerId !== undefined

  customerId = isMember ? paymentIntent.metadata?.customerId || "" : ""

  return isMember
}

async function getIsMemberBySubscriptionId(subscriptionId: string) {
  const subscription = await stripeEdgeClient.retrieveSubscription(
    subscriptionId
  )
  const isMember = subscription.status === "active"

  customerId = isMember ? (subscription.customer as string) : ""

  return isMember
}

export default async function middleware(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const paymentIntentId = searchParams.get("payment_intent_id")
  const subscriptionId = searchParams.get("subscription_id")

  if (paymentIntentId) {
    const response = NextResponse.next()

    isMember = await getIsMember(paymentIntentId)

    if (isMember) {
      response.cookies.set("customer_id", customerId, {
        httpOnly: process.env.NODE_ENV === "production",
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      })

      // Set cookie with payment intent ID
      response.cookies.set("is_member", "true", {
        httpOnly: process.env.NODE_ENV === "production",
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      })
    }
    return response
  } else if (subscriptionId) {
    const response = NextResponse.next()

    isMember = await getIsMemberBySubscriptionId(subscriptionId)

    if (isMember) {
      response.cookies.set("customer_id", customerId, {
        httpOnly: process.env.NODE_ENV === "production",
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      })

      response.cookies.set("is_member", "true", {
        httpOnly: process.env.NODE_ENV === "production",
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      })
    }
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
