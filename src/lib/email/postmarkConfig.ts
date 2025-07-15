import { ServerClient } from "postmark"

if (!process.env.POSTMARK_API_TOKEN) {
  throw new Error("POSTMARK_API_TOKEN environment variable is required")
}

if (!process.env.POSTMARK_FROM_EMAIL) {
  throw new Error("POSTMARK_FROM_EMAIL environment variable is required")
}

export const postmarkClient = new ServerClient(process.env.POSTMARK_API_TOKEN)

export const EMAIL_CONFIG = {
  fromEmail: process.env.POSTMARK_FROM_EMAIL,
  replyTo:
    process.env.POSTMARK_REPLY_TO_EMAIL || process.env.POSTMARK_FROM_EMAIL,
  templates: {
    welcome: process.env.POSTMARK_WELCOME_TEMPLATE_ID,
    paymentSuccess: process.env.POSTMARK_PAYMENT_SUCCESS_TEMPLATE_ID,
    upsellPurchase: process.env.POSTMARK_UPSELL_PURCHASE_TEMPLATE_ID,
  },
} as const

export type EmailTemplate = keyof typeof EMAIL_CONFIG.templates
