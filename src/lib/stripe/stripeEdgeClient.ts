"server-only"

import { z } from "zod"

// Environment variable validation
const requiredEnvVars = {
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY as string,
} as const

function validateEnvironment(): void {
  const envSchema = z.object({
    STRIPE_SECRET_KEY: z.string().min(1, "STRIPE_SECRET_KEY is required"),
  })

  try {
    envSchema.parse(requiredEnvVars)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors
        .map((err) => err.path.join("."))
        .join(", ")
      throw new Error(`Missing required environment variables: ${missingVars}`)
    }
    throw error
  }
}

interface StripePaymentIntent {
  id: string
  status: string
  metadata: {
    customerId?: string
  }
}

export class StripeEdgeClient {
  private baseUrl = "https://api.stripe.com/v1"
  private secretKey: string

  constructor() {
    validateEnvironment()
    this.secretKey = requiredEnvVars.STRIPE_SECRET_KEY!
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`
    const auth = btoa(this.secretKey + ":")

    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new Error(
        `Stripe API error: ${response.status} ${response.statusText}`
      )
    }

    return response.json()
  }

  async retrievePaymentIntent(
    paymentIntentId: string
  ): Promise<StripePaymentIntent> {
    return this.makeRequest(`/payment_intents/${paymentIntentId}`)
  }

  async retrieveSubscription(subscriptionId: string) {
    return this.makeRequest(`/subscriptions/${subscriptionId}`)
  }
}

// Export a singleton instance
export const stripeEdgeClient = new StripeEdgeClient()
