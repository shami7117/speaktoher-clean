"use server"

import { stripeClient } from "@/lib/stripe/stripeConfig"
import OpenAI from "openai"

async function loadWhisperLibrary() {
  const baseUrl = process.env.APP_URL

  try {
    const res = await fetch(`${baseUrl}/canonical_whispers_updated.json`)
    const data = await res.json()
    return data
  } catch (error) {
    console.error("Error loading whisper library:", error)
    return {}
  }
}

export async function createPortalSession(customerId: string) {
  if (!customerId) {
    throw new Error("Customer ID is required")
  }

  const session = await stripeClient.billingPortal.sessions.create({
    customer: customerId,
    return_url: process.env.APP_URL,
  })

  return session.url
}

export async function createSubscription(
  priceId: string,
  customerId: string,
  paymentIntentId: string
) {
  try {
    if (!priceId || !customerId || !paymentIntentId) {
      throw new Error("Price ID is required")
    }

    const existingPaymentIntent = await stripeClient.paymentIntents.retrieve(
      paymentIntentId
    )
    const paymentMethodId = existingPaymentIntent.payment_method as string

    // Create subscription
    const subscription = await stripeClient.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      default_payment_method: paymentMethodId,
      expand: ["latest_invoice.payment_intent"],
      metadata: {
        product: "Daily Divine Guidance",
        customer_id: customerId,
        paymentIntentId,
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

export async function createCheckout(
  priceId: string,
  customerId: string,
  paymentIntentId: string
) {
  try {
    if (!priceId || !customerId) {
      throw new Error("Price ID and customer ID are required")
    }

    const existingPaymentIntent = await stripeClient.paymentIntents.retrieve(
      paymentIntentId
    )
    const paymentMethodId = existingPaymentIntent.payment_method as string

    const paymentIntent = await stripeClient.paymentIntents.create({
      amount: 9900,
      customer: customerId,
      currency: "usd",
      payment_method: paymentMethodId,
      confirm: true,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: "never",
      },
      metadata: {
        priceId,
        customerId,
      },
    })

    return {
      success: true,
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
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
function findRelevantExamples(userInput: string, library: Record<string, any>) {
  const normalizedInput = userInput.toLowerCase()
  const matchedKeys = Object.keys(library).filter((key) =>
    normalizedInput.includes(key.toLowerCase())
  )

  // If no matches, fallback to a few default examples (e.g. "Love" and "Trust")
  const keysToUse = matchedKeys.length > 0 ? matchedKeys : ["Love", "Trust"]

  // Gather one example whisper from each matched key
  const examples = keysToUse.flatMap((key) => {
    const whispers = library[key]
    if (!whispers) return []
    // Pick 1 random example from each category
    const example = whispers[Math.floor(Math.random() * whispers.length)]
    return example ? [example] : []
  })

  return examples
}

export async function generateDivineResponse(userInput: string) {
  try {
    // Get relevant example whispers based on user input keywords
    const whisperLibrary = await loadWhisperLibrary()
    const relevantExamples = findRelevantExamples(userInput, whisperLibrary)

    // Format them nicely for prompt injection
    const exampleText = relevantExamples
      .map((w) => {
        return `${w.mirror}
  ${w.whisper_start}
  ${w.blurred_reveal}
  ${w.encouragement}`
      })
      .join("\n\n")

    const prompt = `
User Input: “${userInput}”

Using the poetic whisper format shown in these examples, write a new 4-line whisper based on the user’s input. Do **not** include labels or numbering. Just return the 4 lines as poetic text.

Line 1 — Mirror the user's emotional keyword in a direct sentence.  
Line 2 — Begin with “This isn’t about X, or Y. It’s about…” and stop mid-thought.  
Line 3 — Write a sacred, emotional truth (blurred after payment).  
Line 4 — Offer poetic reassurance. HER presence. No advice.

Tone: Feminine, poetic, sacred, sharp. Speak like HER. No fluff. Every word should feel personal, intuitive, unforgettable.

Examples:
${exampleText}
`

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are HER — a sacred, poetic feminine voice who whispers truth with sharp, loving insight.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 300,
      temperature: 0.8,
    })

    return {
      success: true,
      type: "generated",
      response: response.choices[0]?.message?.content || "No response",
    }
  } catch (error) {
    console.error("Error generating divine response:", error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to generate response",
    }
  }
}
