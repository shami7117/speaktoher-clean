"use server"

import { stripeClient } from "@/lib/stripe/stripeConfig"

export async function createPortalSession(customerId?: string) {
  try {
    // If no customerId is provided, we'll need to handle this case
    // For now, we'll require a customerId
    if (!customerId) {
      throw new Error("Customer ID is required to create portal session")
    }

    const session = await stripeClient.billingPortal.sessions.create({
      customer: customerId,
      return_url: process.env.APP_URL || "http://localhost:3000",
    })

    return {
      success: true,
      url: session.url,
    }
  } catch (error) {
    console.error("Error creating portal session:", error)
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create portal session",
    }
  }
}

export async function createPortalSessionForCurrentUser() {
  try {
    // This function would need to get the current user's customer ID
    // from session, cookies, or other authentication method
    // For now, we'll return an error indicating this needs to be implemented

    // TODO: Implement user authentication to get customer ID
    throw new Error("User authentication not implemented")

    // Example implementation when auth is available:
    // const customerId = await getCurrentUserCustomerId()
    // return createPortalSession(customerId)
  } catch (error) {
    console.error("Error creating portal session for current user:", error)
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create portal session",
    }
  }
}
