import { postmarkClient, EMAIL_CONFIG } from "./postmarkConfig"
import { EmailData, EmailResponse, EmailAttachment } from "./types"

export class EmailService {
  /**
   * Send a transactional email using Postmark templates
   */
  static async sendTemplateEmail(
    templateId: string,
    to: string,
    templateData: Record<string, any> = {},
    attachments: EmailAttachment[] = []
  ): Promise<EmailResponse> {
    try {
      // Debug logging
      console.log("🔍 Email Debug Info:", {
        templateId,
        to,
        templateData,
        fromEmail: EMAIL_CONFIG.fromEmail,
        replyTo: EMAIL_CONFIG.replyTo,
        hasApiToken: !!process.env.POSTMARK_API_TOKEN,
        environment: process.env.NODE_ENV,
      })

      const response = await postmarkClient.sendEmailWithTemplate({
        TemplateId: parseInt(templateId),
        TemplateModel: templateData,
        From: EMAIL_CONFIG.fromEmail,
        To: to,
        ReplyTo: EMAIL_CONFIG.replyTo,
        Attachments: attachments?.map((att) => ({
          Name: att.Name,
          Content: att.Content,
          ContentType: att.ContentType,
          ContentID: att.ContentID || null,
        })),
      })

      console.log("✅ Email sent successfully:", {
        messageId: response.MessageID,
        to,
        templateId,
      })

      return {
        success: true,
        messageId: response.MessageID,
      }
    } catch (error) {
      console.error("❌ Error sending template email:", {
        error: error instanceof Error ? error.message : error,
        templateId,
        to,
        stack: error instanceof Error ? error.stack : undefined,
      })
      
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to send email",
      }
    }
  }

  /**
   * Send a simple text email
   */
  static async sendTextEmail(
    to: string,
    subject: string,
    textBody: string,
    htmlBody?: string,
    attachments: EmailAttachment[] = []
  ): Promise<EmailResponse> {
    try {
      console.log("🔍 Text Email Debug Info:", {
        to,
        subject,
        fromEmail: EMAIL_CONFIG.fromEmail,
        hasApiToken: !!process.env.POSTMARK_API_TOKEN,
        environment: process.env.NODE_ENV,
      })

      const response = await postmarkClient.sendEmail({
        From: EMAIL_CONFIG.fromEmail,
        To: to,
        ReplyTo: EMAIL_CONFIG.replyTo,
        Subject: subject,
        TextBody: textBody,
        HtmlBody: htmlBody,
        Attachments: attachments.map((att) => ({
          Name: att.Name,
          Content: att.Content,
          ContentType: att.ContentType,
          ContentID: att.ContentID,
        })),
      })

      console.log("✅ Text email sent successfully:", {
        messageId: response.MessageID,
        to,
        subject,
      })

      return {
        success: true,
        messageId: response.MessageID,
      }
    } catch (error) {
      console.error("❌ Error sending text email:", {
        error: error instanceof Error ? error.message : error,
        to,
        subject,
        stack: error instanceof Error ? error.stack : undefined,
      })
      
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to send email",
      }
    }
  }

  /**
   * Send a batch of emails
   */
  static async sendBatchEmails(emails: EmailData[]): Promise<EmailResponse[]> {
    try {
      console.log("🔍 Batch Email Debug Info:", {
        emailCount: emails.length,
        fromEmail: EMAIL_CONFIG.fromEmail,
        hasApiToken: !!process.env.POSTMARK_API_TOKEN,
        environment: process.env.NODE_ENV,
      })

      const batchEmails = emails.map((email) => ({
        From: EMAIL_CONFIG.fromEmail,
        To: email.to,
        ReplyTo: EMAIL_CONFIG.replyTo,
        Subject: email.subject || "Message from Speak to Her",
        TextBody: email.templateData?.textBody || "",
        HtmlBody: email.templateData?.htmlBody || "",
        Attachments:
          email.attachments?.map((att) => ({
            Name: att.Name,
            Content: att.Content,
            ContentType: att.ContentType,
            ContentID: att.ContentID,
          })) || [],
      }))

      const response = await postmarkClient.sendEmailBatch(batchEmails)

      console.log("✅ Batch emails sent:", {
        totalEmails: response.length,
        successCount: response.filter(r => r.ErrorCode === 0).length,
        errorCount: response.filter(r => r.ErrorCode !== 0).length,
      })

      return response.map((result, index) => ({
        success: result.ErrorCode === 0,
        messageId: result.MessageID,
        error: result.ErrorCode !== 0 ? result.Message : undefined,
      }))
    } catch (error) {
      console.error("❌ Error sending batch emails:", {
        error: error instanceof Error ? error.message : error,
        emailCount: emails.length,
        stack: error instanceof Error ? error.stack : undefined,
      })
      
      return emails.map(() => ({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to send batch emails",
      }))
    }
  }

  /**
   * Verify email address with Postmark
   */
  static async verifyEmail(email: string): Promise<boolean> {
    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(email)
    } catch (error) {
      console.error("Error verifying email:", error)
      return false
    }
  }
}