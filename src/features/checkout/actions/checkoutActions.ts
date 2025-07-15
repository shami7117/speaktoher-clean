"use server"

import { stripeClient } from "@/lib/stripe/stripeConfig"
import { z } from "zod"

/**
 * Input validation schema for customer creation and payment intent attachment
 */
const createCustomerAndPaymentIntentSchema = z.object({
  paymentIntentId: z.string().min(1, "Payment intent ID is required"),
  customerName: z.string().min(1, "Customer name is required"),
  customerEmail: z.string().email("Invalid email address"),
  metadata: z.record(z.string()).optional(),
})

/**
 * Updates an existing payment intent with customer information
 * Use this when you already have a payment intent but need to attach a customer
 *
 * @param paymentIntentId - The payment intent ID to update
 * @param customerName - Customer name
 * @param customerEmail - Customer email
 * @param metadata - Additional metadata
 * @returns Promise<{ success: boolean; error?: string }>
 */
export async function attachCustomerToPaymentIntent(
  clientSecret: string,
  customerName: string,
  customerEmail: string,
  metadata?: Record<string, string>
): Promise<{ success: boolean; customerId?: string; error?: string }> {
  try {
    // Check if customer already exists
    let customer
    const existingCustomers = await stripeClient.customers.list({
      email: customerEmail,
      limit: 1,
    })

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0]
    } else {
      // Create new customer
      customer = await stripeClient.customers.create({
        email: customerEmail,
        name: customerName,

        metadata: {
          source: "speaktoher_app",
          created_at: new Date().toISOString(),
          ...metadata,
        },
      })
    }

    // Extract payment intent ID from client secret
    // Client secret format: "pi_3MtwBwLkdIwHu7ix28a3tqPa_secret_YrKJUKribcBjcG8HVhfZluoGH"
    // Payment intent ID is the part before "_secret_"

    const paymentIntent = clientSecret.split("_secret_")[0]
    if (!paymentIntent.startsWith("pi_")) {
      throw new Error("Invalid client secret format")
    }

    // Update payment intent with customer
    await stripeClient.paymentIntents.update(paymentIntent, {
      customer: customer.id,
      receipt_email: customerEmail,
      metadata: {
        customerName,
        customerEmail,
        customerId: customer.id,
        ...metadata,
      },
    })

    return { success: true, customerId: customer.id }
  } catch (error) {
    console.error("Error attaching customer to payment intent:", error)
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to attach customer to payment intent",
    }
  }
}

/**
 * Retrieves customer information by email
 *
 * @param email - Customer email
 * @returns Promise<{ success: boolean; customer?: any; error?: string }>
 */
export async function getCustomerByEmail(
  email: string
): Promise<{ success: boolean; customer?: any; error?: string }> {
  try {
    const customers = await stripeClient.customers.list({
      email: email,
      limit: 1,
    })

    if (customers.data.length === 0) {
      return {
        success: false,
        error: "Customer not found",
      }
    }

    return {
      success: true,
      customer: customers.data[0],
    }
  } catch (error) {
    console.error("Error retrieving customer:", error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to retrieve customer",
    }
  }
}
