"use server"

import { stripeClient, STRIPE_PRICE_IDS } from "@/lib/stripe/stripeConfig"
import { sendUpsellPurchaseEmail } from "@/lib/email"
import { z } from "zod"

/**
 * Input validation schema for subscription creation
 */
const createSubscriptionSchema = z.object({
  priceId: z.enum([
    STRIPE_PRICE_IDS.BASIC,
    STRIPE_PRICE_IDS.PREMIUM,
    STRIPE_PRICE_IDS.LIFETIME,
  ]),
  customerEmail: z.string().email("Invalid email address"),
  customerName: z.string().min(1, "Customer name is required"),
  paymentMethodId: z.string().optional(),
  metadata: z.record(z.string()).optional(),
})

/**
 * Response type for subscription creation
 */
export type CreateSubscriptionResponse = {
  success: boolean
  subscriptionId?: string
  clientSecret?: string
  status?: string
  error?: string
}

/**
 * Creates a subscription in Stripe
 *
 * @param input - Subscription creation parameters
 * @returns Promise<CreateSubscriptionResponse>
 */
export async function createSubscription(
  input: z.infer<typeof createSubscriptionSchema>
): Promise<CreateSubscriptionResponse> {
  try {
    // Validate input
    const validatedInput = createSubscriptionSchema.parse(input)
    const { priceId, customerEmail, customerName, paymentMethodId, metadata } =
      validatedInput

    // Create or retrieve customer
    let customer
    const existingCustomers = await stripeClient.customers.list({
      email: customerEmail,
      limit: 1,
    })

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0]
    } else {
      customer = await stripeClient.customers.create({
        email: customerEmail,
        name: customerName,
        metadata: {
          source: "speaktoher_app",
          ...metadata,
        },
      })
    }

    // Prepare subscription parameters
    const subscriptionParams: any = {
      customer: customer.id,
      items: [{ price: priceId }],
      payment_behavior: "default_incomplete",
      payment_settings: {
        save_default_payment_method: "on_subscription",
        payment_method_types: ["card"],
      },
      expand: ["latest_invoice.payment_intent"],
      metadata: {
        product: "Daily Divine Guidance",
        customerName,
        customerEmail,
        source: "speaktoher_app",
        ...metadata,
      },
    }

    // Add payment method if provided
    if (paymentMethodId) {
      subscriptionParams.default_payment_method = paymentMethodId
    }

    // Create subscription
    const subscription = await stripeClient.subscriptions.create(
      subscriptionParams
    )

    // Send upsell purchase email for subscription
    try {
      const productName =
        priceId === STRIPE_PRICE_IDS.BASIC
          ? "Daily Divine Guidance - Monthly"
          : priceId === STRIPE_PRICE_IDS.PREMIUM
          ? "Daily Divine Guidance - Premium"
          : "Daily Divine Guidance - Lifetime"

      await sendUpsellPurchaseEmail({
        customerName,
        customerEmail,
        productName,
        amount:
          priceId === STRIPE_PRICE_IDS.BASIC
            ? "$15.00"
            : priceId === STRIPE_PRICE_IDS.PREMIUM
            ? "$25.00"
            : "$99.00",
        transactionId: subscription.id,
        date: new Date().toISOString().split("T")[0],
        isSubscription: priceId !== STRIPE_PRICE_IDS.LIFETIME,
        billingCycle:
          priceId === STRIPE_PRICE_IDS.BASIC
            ? "monthly"
            : priceId === STRIPE_PRICE_IDS.PREMIUM
            ? "monthly"
            : undefined,
        nextBillingDate:
          priceId !== STRIPE_PRICE_IDS.LIFETIME
            ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0]
            : undefined,
      })
    } catch (emailError) {
      console.error("Error sending upsell purchase email:", emailError)
      // Don't fail the subscription creation if email fails
    }

    return {
      success: true,
      subscriptionId: subscription.id,
      clientSecret: (subscription.latest_invoice as any)?.payment_intent
        ?.client_secret,
      status: subscription.status,
    }
  } catch (error) {
    console.error("Error creating subscription:", error)

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: `Validation error: ${error.errors
          .map((e) => e.message)
          .join(", ")}`,
      }
    }

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create subscription",
    }
  }
}

/**
 * Creates a subscription with checkout session for better UX
 *
 * @param input - Subscription creation parameters
 * @returns Promise<{ success: boolean; sessionId?: string; error?: string }>
 */
export async function createSubscriptionCheckoutSession(
  input: z.infer<typeof createSubscriptionSchema>
): Promise<{ success: boolean; sessionId?: string; error?: string }> {
  try {
    const validatedInput = createSubscriptionSchema.parse(input)
    const { priceId, customerEmail, customerName, metadata } = validatedInput

    // Create or retrieve customer
    let customer
    const existingCustomers = await stripeClient.customers.list({
      email: customerEmail,
      limit: 1,
    })

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0]
    } else {
      customer = await stripeClient.customers.create({
        email: customerEmail,
        name: customerName,
        metadata: {
          source: "speaktoher_app",
          ...metadata,
        },
      })
    }

    // Create checkout session
    const session = await stripeClient.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cancel`,
      metadata: {
        product: "Daily Divine Guidance",
        customerName,
        customerEmail,
        source: "speaktoher_app",
        ...metadata,
      },
    })

    return {
      success: true,
      sessionId: session.id,
    }
  } catch (error) {
    console.error("Error creating checkout session:", error)

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: `Validation error: ${error.errors
          .map((e) => e.message)
          .join(", ")}`,
      }
    }

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create checkout session",
    }
  }
}

/**
 * Retrieves subscription details
 *
 * @param subscriptionId - Stripe subscription ID
 * @returns Promise<{ success: boolean; subscription?: any; error?: string }>
 */
export async function getSubscription(
  subscriptionId: string
): Promise<{ success: boolean; subscription?: any; error?: string }> {
  try {
    if (!subscriptionId) {
      throw new Error("Subscription ID is required")
    }

    const subscription = await stripeClient.subscriptions.retrieve(
      subscriptionId,
      {
        expand: ["customer", "latest_invoice.payment_intent"],
      }
    )

    return {
      success: true,
      subscription,
    }
  } catch (error) {
    console.error("Error retrieving subscription:", error)
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to retrieve subscription",
    }
  }
}

/**
 * Cancels a subscription
 *
 * @param subscriptionId - Stripe subscription ID
 * @param cancelAtPeriodEnd - Whether to cancel at period end or immediately
 * @returns Promise<{ success: boolean; subscription?: any; error?: string }>
 */
export async function cancelSubscription(
  subscriptionId: string,
  cancelAtPeriodEnd: boolean = true
): Promise<{ success: boolean; subscription?: any; error?: string }> {
  try {
    if (!subscriptionId) {
      throw new Error("Subscription ID is required")
    }

    const subscription = await stripeClient.subscriptions.update(
      subscriptionId,
      {
        cancel_at_period_end: cancelAtPeriodEnd,
      }
    )

    return {
      success: true,
      subscription,
    }
  } catch (error) {
    console.error("Error canceling subscription:", error)
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to cancel subscription",
    }
  }
}
