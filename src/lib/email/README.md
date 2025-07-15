# Email System Documentation

This directory contains the Postmark transactional email integration for the Speak to Her application.

## Setup

### Environment Variables

Add the following environment variables to your `.env.local` file:

```env
# Postmark Configuration
POSTMARK_API_TOKEN=your_postmark_api_token
POSTMARK_FROM_EMAIL=noreply@yourdomain.com
POSTMARK_REPLY_TO_EMAIL=support@yourdomain.com

# Email Template IDs (optional - for template-based emails)
POSTMARK_WELCOME_TEMPLATE_ID=12345678
POSTMARK_SUBSCRIPTION_TEMPLATE_ID=87654321
POSTMARK_PAYMENT_SUCCESS_TEMPLATE_ID=11223344
POSTMARK_DAILY_GUIDANCE_TEMPLATE_ID=44332211
POSTMARK_FIRST_PURCHASE_TEMPLATE_ID=55556666
POSTMARK_UPSELL_PURCHASE_TEMPLATE_ID=77778888
```

### Postmark Templates

Create the following templates in your Postmark account:

1. **Welcome Email Template**

   - Variables: `customer_name`, `customer_email`, `activation_link`, `app_name`, `support_email`

2. **Subscription Confirmation Template**

   - Variables: `customer_name`, `customer_email`, `subscription_id`, `plan_name`, `amount`, `billing_cycle`, `next_billing_date`, `app_name`, `support_email`

3. **Payment Success Template**

   - Variables: `customer_name`, `customer_email`, `amount`, `transaction_id`, `date`, `description`, `app_name`, `support_email`

4. **Daily Guidance Template**

   - Variables: `customer_name`, `customer_email`, `guidance`, `date`, `blessing_count`, `app_name`, `support_email`

5. **First Purchase Template**

   - Variables: `customer_name`, `customer_email`, `divine_response`, `user_input`, `amount`, `transaction_id`, `date`, `app_name`, `support_email`

6. **Upsell Purchase Template**
   - Variables: `customer_name`, `customer_email`, `product_name`, `amount`, `transaction_id`, `date`, `is_subscription`, `billing_cycle`, `next_billing_date`, `app_name`, `support_email`

## Usage

### Server Actions

Import and use the server actions in your components:

```typescript
import {
  sendWelcomeEmail,
  sendSubscriptionEmail,
  sendPaymentSuccessEmail,
  sendDailyGuidanceEmail,
  sendFirstPurchaseEmail,
  sendUpsellPurchaseEmail,
  sendCustomEmail,
  verifyEmailAddress,
} from "@/lib/email"

// Send welcome email
const result = await sendWelcomeEmail({
  customerName: "John Doe",
  customerEmail: "john@example.com",
  activationLink: "https://yourapp.com/activate?token=abc123",
})

// Send subscription confirmation
const result = await sendSubscriptionEmail({
  customerName: "John Doe",
  customerEmail: "john@example.com",
  subscriptionId: "sub_1234567890",
  planName: "Daily Divine Guidance",
  amount: "$9.99",
  billingCycle: "monthly",
  nextBillingDate: "2024-01-15",
})

// Send payment success
const result = await sendPaymentSuccessEmail({
  customerName: "John Doe",
  customerEmail: "john@example.com",
  amount: "$9.99",
  transactionId: "txn_1234567890",
  date: "2024-01-01",
  description: "Daily Divine Guidance Subscription",
})

// Send daily guidance
const result = await sendDailyGuidanceEmail({
  customerName: "John Doe",
  customerEmail: "john@example.com",
  guidance: "Today's divine message...",
  date: "2024-01-01",
  blessingCount: 42,
})

// Send first purchase email with divine response
const result = await sendFirstPurchaseEmail({
  customerName: "John Doe",
  customerEmail: "john@example.com",
  divineResponse: "Your personal divine message...",
  userInput: "What should I do about my career?",
  amount: "$9.00",
  transactionId: "txn_1234567890",
  date: "2024-01-01",
})

// Send upsell purchase email
const result = await sendUpsellPurchaseEmail({
  customerName: "John Doe",
  customerEmail: "john@example.com",
  productName: "Daily Divine Guidance - Monthly",
  amount: "$15.00",
  transactionId: "sub_1234567890",
  date: "2024-01-01",
  isSubscription: true,
  billingCycle: "monthly",
  nextBillingDate: "2024-02-01",
})

// Send custom email
const result = await sendCustomEmail(
  "john@example.com",
  "Custom Subject",
  "Plain text body",
  "<h1>HTML body</h1>"
)

// Verify email address
const isValid = await verifyEmailAddress("john@example.com")
```

### Direct Service Usage

You can also use the EmailService directly for more advanced use cases:

```typescript
import { EmailService } from "@/lib/email"

// Send template email with custom data
const result = await EmailService.sendTemplateEmail(
  "12345678",
  "john@example.com",
  { custom_variable: "value" }
)

// Send batch emails
const results = await EmailService.sendBatchEmails([
  {
    to: "user1@example.com",
    subject: "Batch Email 1",
    templateData: { textBody: "Hello User 1" },
  },
  {
    to: "user2@example.com",
    subject: "Batch Email 2",
    templateData: { textBody: "Hello User 2" },
  },
])
```

## Error Handling

All email functions return a consistent response format:

```typescript
interface EmailResponse {
  success: boolean
  messageId?: string
  error?: string
}
```

Example error handling:

```typescript
const result = await sendWelcomeEmail(data)

if (result.success) {
  console.log("Email sent successfully:", result.messageId)
} else {
  console.error("Failed to send email:", result.error)
}
```

## Testing

For testing purposes, you can use Postmark's test API token which will send emails to a sandbox environment.

## Monitoring

Monitor email delivery and engagement through the Postmark dashboard:

- Delivery rates
- Bounce rates
- Open rates
- Click rates
- Spam complaints

## Best Practices

1. Always validate email addresses before sending
2. Use meaningful subject lines
3. Include unsubscribe links in marketing emails
4. Test emails across different email clients
5. Monitor delivery rates and bounces
6. Use templates for consistent branding
7. Include both HTML and text versions when possible
