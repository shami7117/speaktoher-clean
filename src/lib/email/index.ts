// Configuration
export { postmarkClient, EMAIL_CONFIG } from "./postmarkConfig"
export type { EmailTemplate } from "./postmarkConfig"

// Types
export type {
  EmailData,
  EmailAttachment,
  EmailResponse,
  WelcomeEmailData,
  SubscriptionEmailData,
  PaymentSuccessEmailData,
  DailyGuidanceEmailData,
  FirstPurchaseEmailData,
  UpsellPurchaseEmailData,
} from "./types"

// Service
export { EmailService } from "./emailService"

// Server Actions
export {
  sendWelcomeEmail,
  sendPaymentSuccessEmail,
  sendUpsellPurchaseEmail,
  sendCustomEmail,
} from "@/features/email/actions/emailActions"
