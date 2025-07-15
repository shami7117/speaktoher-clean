export interface EmailData {
  to: string
  subject?: string
  templateData?: Record<string, any>
  attachments?: EmailAttachment[]
}

export interface EmailAttachment {
  Name: string
  Content: string
  ContentType: string
  ContentID: string | null
}

export interface EmailResponse {
  success: boolean
  messageId?: string
  error?: string
}

export interface WelcomeEmailData {
  customerName: string
  customerEmail: string
  activationLink?: string
}

export interface SubscriptionEmailData {
  customerName: string
  customerEmail: string
  subscriptionId: string
  planName: string
  amount: string
  billingCycle: string
  nextBillingDate: string
}

export interface PaymentSuccessEmailData {
  customerName: string
  customerEmail: string
  whisper: string
}

export interface DailyGuidanceEmailData {
  customerName: string
  customerEmail: string
  guidance: string
  date: string
  blessingCount: number
}

export interface FirstPurchaseEmailData {
  customerName: string
  customerEmail: string
  divineResponse: string
  userInput: string
  amount: string
  transactionId: string
  date: string
}

export interface UpsellPurchaseEmailData {
  customerName: string
  customerEmail: string
  productName: string
  amount: string
  transactionId: string
  date: string
  isSubscription: boolean
  billingCycle?: string
  nextBillingDate?: string
}
