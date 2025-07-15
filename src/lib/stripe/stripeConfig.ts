import { z } from "zod"
import Stripe from "stripe"

/**
 * Stripe Configuration Module
 *
 * This module provides a centralized configuration for Stripe integration,
 * including environment validation, client initialization, and type definitions.
 *
 * @author Your Name
 * @version 1.0.0
 */

// Environment variable validation
const requiredEnvVars = {
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY as string,
  STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY as string,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET as string,
} as const

/**
 * Validates that all required environment variables are present
 * @throws {Error} If any required environment variable is missing
 */
function validateEnvironment(): void {
  const envSchema = z.object({
    STRIPE_SECRET_KEY: z.string().min(1, "STRIPE_SECRET_KEY is required"),
    STRIPE_PUBLISHABLE_KEY: z
      .string()
      .min(1, "STRIPE_PUBLISHABLE_KEY is required"),
    STRIPE_WEBHOOK_SECRET: z
      .string()
      .min(1, "STRIPE_WEBHOOK_SECRET is required"),
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

/**
 * Stripe client configuration options
 */
export const stripeConfig = {
  typescript: true,
  appInfo: {
    name: "Speak to Her",
    version: "1.0.0",
  },
} as const

/**
 * Initialize and configure Stripe client
 * @returns Configured Stripe instance
 * @throws {Error} If environment validation fails
 */
export function createStripeClient(): Stripe {
  validateEnvironment()

  return new Stripe(requiredEnvVars.STRIPE_SECRET_KEY, {
    ...stripeConfig,
  })
}

/**
 * Get publishable key for client-side usage
 * @returns Stripe publishable key
 * @throws {Error} If environment validation fails
 */
export function getPublishableKey(): string {
  validateEnvironment()
  return requiredEnvVars.STRIPE_PUBLISHABLE_KEY
}

/**
 * Get webhook secret for webhook verification
 * @returns Stripe webhook secret
 * @throws {Error} If environment validation fails
 */
export function getWebhookSecret(): string {
  validateEnvironment()
  return requiredEnvVars.STRIPE_WEBHOOK_SECRET
}

/**
 * Stripe price IDs for different subscription tiers
 */
export const STRIPE_PRICE_IDS = {
  BASIC: "price_basic_monthly",
  PREMIUM: "price_premium_monthly",
  LIFETIME: "price_lifetime_access",
} as const

/**
 * Stripe product IDs
 */
export const STRIPE_PRODUCT_IDS = {
  BASIC: "prod_basic_subscription",
  PREMIUM: "prod_premium_subscription",
  LIFETIME: "prod_lifetime_access",
} as const

/**
 * Type for valid price IDs
 */
export type StripePriceId =
  (typeof STRIPE_PRICE_IDS)[keyof typeof STRIPE_PRICE_IDS]

/**
 * Type for valid product IDs
 */
export type StripeProductId =
  (typeof STRIPE_PRODUCT_IDS)[keyof typeof STRIPE_PRODUCT_IDS]

/**
 * Stripe webhook event types that this application handles
 */
export const STRIPE_WEBHOOK_EVENTS = {
  CUSTOMER_SUBSCRIPTION_CREATED: "customer.subscription.created",
  CUSTOMER_SUBSCRIPTION_UPDATED: "customer.subscription.updated",
  CUSTOMER_SUBSCRIPTION_DELETED: "customer.subscription.deleted",
  INVOICE_PAYMENT_SUCCEEDED: "invoice.payment_succeeded",
  INVOICE_PAYMENT_FAILED: "invoice.payment_failed",
  CHECKOUT_SESSION_COMPLETED: "checkout.session.completed",
} as const

/**
 * Type for valid webhook event types
 */
export type StripeWebhookEvent =
  (typeof STRIPE_WEBHOOK_EVENTS)[keyof typeof STRIPE_WEBHOOK_EVENTS]

// Export a singleton instance for server-side usage
export const stripeClient = createStripeClient()
