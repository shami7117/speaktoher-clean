import { ServerClient } from "postmark"

// Enhanced environment variable validation
function validateEnvVar(varName: string, value: string | undefined): string {
  if (!value) {
    console.error(`❌ Missing environment variable: ${varName}`)
    throw new Error(`${varName} environment variable is required`)
  }
  
  // Log first few characters for debugging (safely)
  const safeValue = value.substring(0, 8) + "..."
  console.log(`✅ ${varName} is set: ${safeValue}`)
  
  return value
}

const POSTMARK_API_TOKEN = validateEnvVar("POSTMARK_API_TOKEN", process.env.POSTMARK_API_TOKEN)
const POSTMARK_FROM_EMAIL = validateEnvVar("POSTMARK_FROM_EMAIL", process.env.POSTMARK_FROM_EMAIL)

// Initialize client with error handling
let postmarkClient: ServerClient
try {
  postmarkClient = new ServerClient(POSTMARK_API_TOKEN)
  console.log("✅ Postmark client initialized successfully")
} catch (error) {
  console.error("❌ Failed to initialize Postmark client:", error)
  throw error
}

export { postmarkClient }

export const EMAIL_CONFIG = {
  fromEmail: POSTMARK_FROM_EMAIL,
  replyTo: process.env.POSTMARK_REPLY_TO_EMAIL || POSTMARK_FROM_EMAIL,
  templates: {
    welcome: process.env.POSTMARK_WELCOME_TEMPLATE_ID,
    paymentSuccess: process.env.POSTMARK_PAYMENT_SUCCESS_TEMPLATE_ID,
    upsellPurchase: process.env.POSTMARK_UPSELL_PURCHASE_TEMPLATE_ID,
  },
} as const

// Log configuration for debugging
console.log("📧 Email Configuration:", {
  fromEmail: EMAIL_CONFIG.fromEmail,
  replyTo: EMAIL_CONFIG.replyTo,
  templates: {
    welcome: EMAIL_CONFIG.templates.welcome ? "✅ Set" : "❌ Missing",
    paymentSuccess: EMAIL_CONFIG.templates.paymentSuccess ? "✅ Set" : "❌ Missing",
    upsellPurchase: EMAIL_CONFIG.templates.upsellPurchase ? "✅ Set" : "❌ Missing",
  },
  environment: process.env.NODE_ENV,
})

export type EmailTemplate = keyof typeof EMAIL_CONFIG.templates