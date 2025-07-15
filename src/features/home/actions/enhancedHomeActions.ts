"use server"

import { stripeClient } from "@/lib/stripe/stripeConfig"
import { sendWelcomeEmail, sendUpsellPurchaseEmail } from "@/lib/email"

export async function createPortalSession() {
  const session = await stripeClient.billingPortal.sessions.create({
    customer: "cus_Qw89ABCD1234567890",
    return_url: "https://your-app.com/billing",
  })

  return session
}

export async function createSubscriptionWithEmail(
  priceId: string,
  customerEmail: string,
  customerName: string
) {
  try {
    if (!priceId) {
      throw new Error("Price ID is required")
    }

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
      })

      // Send welcome email for new customers
      await sendWelcomeEmail({
        customerName,
        customerEmail,
        activationLink: `https://yourapp.com/activate?email=${encodeURIComponent(
          customerEmail
        )}`,
      })
    }

    // Create subscription
    const subscription = await stripeClient.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      payment_behavior: "default_incomplete",
      payment_settings: { save_default_payment_method: "on_subscription" },
      expand: ["latest_invoice.payment_intent"],
      metadata: {
        product: "Daily Divine Guidance",
        customerName,
        customerEmail,
      },
    })

    return {
      success: true,
      subscriptionId: subscription.id,
      clientSecret: (subscription.latest_invoice as any)?.payment_intent
        ?.client_secret,
      status: subscription.status,
    }
  } catch (error) {
    console.error("Error creating subscription:", error)
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create subscription",
    }
  }
}

export async function createCheckoutWithEmail(
  priceId: string,
  customerId: string,
  customerEmail: string,
  customerName: string
) {
  try {
    if (!priceId || !customerId) {
      throw new Error("Price ID and customer ID are required")
    }

    const checkout = await stripeClient.paymentIntents.create({
      amount: 9900,
      customer: customerId,
      currency: "usd",
      confirm: true,
      capture_method: "automatic",
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        priceId,
        customerEmail,
        customerName,
      },
    })

    // Send upsell purchase email
    if (checkout.status === "succeeded") {
      await sendUpsellPurchaseEmail({
        customerName,
        customerEmail,
        productName: "Daily Divine Guidance - Lifetime Access",
        amount: "$99.00",
        transactionId: checkout.id,
        date: new Date().toISOString().split("T")[0],
        isSubscription: false,
      })
    }

    return {
      success: true,
      checkoutId: checkout.id,
      clientSecret: checkout.client_secret,
    }
  } catch (error) {
    console.error("Error creating checkout:", error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create checkout",
    }
  }
}

// Keep the original functions for backward compatibility
export async function createSubscription(
  priceId: string,
  customerEmail: string,
  customerName: string
) {
  return createSubscriptionWithEmail(priceId, customerEmail, customerName)
}

export async function createCheckout(priceId: string, customerId: string) {
  // This function now requires additional parameters for email functionality
  // You may want to update the calling code to use createCheckoutWithEmail instead
  throw new Error(
    "Please use createCheckoutWithEmail for enhanced functionality"
  )
}
