import { NextRequest, NextResponse } from "next/server"
import { stripeClient } from "@/lib/stripe/stripeConfig"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const paymentIntentId = searchParams.get("payment_intent")
    const divineResponse = searchParams.get("divine_response")
    const userInput = searchParams.get("user_input")
    const customerEmail = searchParams.get("customer_email")
    const customerName = searchParams.get("customer_name")

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: "Payment intent ID is required" },
        { status: 400 }
      )
    }

    // Retrieve the payment intent from Stripe
    const paymentIntent = await stripeClient.paymentIntents.retrieve(
      paymentIntentId
    )

    // Check if payment was successful
    if (paymentIntent.status === "succeeded") {
      // Send first purchase email if we have the required data
      if (divineResponse && customerEmail && customerName) {
        try {
        } catch (emailError) {
          console.error("Error sending first purchase email:", emailError)
          // Don't fail the payment verification if email fails
        }
      }

      return NextResponse.json(
        {
          success: true,
          status: paymentIntent.status,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
        },
        { status: 200 }
      )
    } else {
      return NextResponse.json(
        {
          success: false,
          status: paymentIntent.status,
          error: "Payment not completed",
        },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error("Error verifying payment:", error)
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    )
  }
}
