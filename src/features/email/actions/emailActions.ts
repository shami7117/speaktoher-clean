"use server"

import { EmailService } from "@/lib/email/emailService"
import { EMAIL_CONFIG } from "@/lib/email/postmarkConfig"
import {
  WelcomeEmailData,
  SubscriptionEmailData,
  PaymentSuccessEmailData,
  DailyGuidanceEmailData,
  FirstPurchaseEmailData,
  UpsellPurchaseEmailData,
  EmailResponse,
} from "@/lib/email/types"

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail(
  data: WelcomeEmailData
): Promise<EmailResponse> {
  try {
    if (!EMAIL_CONFIG.templates.welcome) {
      throw new Error("Welcome email template ID not configured")
    }

    const templateData = {
      customer_name: data.customerName,
      customer_email: data.customerEmail,
      activation_link: data.activationLink || "",
      app_name: "Speak to Her",
      support_email: EMAIL_CONFIG.replyTo,
    }

    return await EmailService.sendTemplateEmail(
      EMAIL_CONFIG.templates.welcome,
      data.customerEmail,
      templateData
    )
  } catch (error) {
    console.error("Error sending welcome email:", error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to send welcome email",
    }
  }
}

/**
 * Send payment success email
 */
export async function sendPaymentSuccessEmail(
  data: PaymentSuccessEmailData
): Promise<EmailResponse> {
  try {
    if (!EMAIL_CONFIG.templates.paymentSuccess) {
      throw new Error("Payment success template ID not configured")
    }

    const templateData = {
      first_name: data.customerName,
      customer_email: data.customerEmail,
      whisper: data.whisper,
      app_name: "Speak to Her",
      support_email: EMAIL_CONFIG.replyTo,
    }

    return await EmailService.sendTemplateEmail(
      EMAIL_CONFIG.templates.paymentSuccess,
      data.customerEmail,
      templateData
    )
  } catch (error) {
    console.error("Error sending payment success email:", error)
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to send payment success email",
    }
  }
}

/**
 * Send upsell purchase email
 */
export async function sendUpsellPurchaseEmail(
  data: any
): Promise<EmailResponse> {
  try {
    if (!EMAIL_CONFIG.templates.upsellPurchase) {
      throw new Error("Upsell purchase template ID not configured")
    }

    const templateData = {
      first_name: data.customerName,
      magic_link: data.magic_link,
    }

    return await EmailService.sendTemplateEmail(
      EMAIL_CONFIG.templates.upsellPurchase,
      data.customerEmail,
      templateData
    )
  } catch (error) {
    console.error("Error sending upsell purchase email:", error)
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to send upsell purchase email",
    }
  }
}

/**
 * Send custom text email
 */
export async function sendCustomEmail(
  to: string,
  subject: string,
  textBody: string,
  htmlBody?: string
): Promise<EmailResponse> {
  try {
    return await EmailService.sendTextEmail(to, subject, textBody, htmlBody)
  } catch (error) {
    console.error("Error sending custom email:", error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to send custom email",
    }
  }
}
