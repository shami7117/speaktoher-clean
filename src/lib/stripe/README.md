# Stripe Integration

This module provides a comprehensive Stripe integration for the Speak to Her application, including support for Google Pay and Apple Pay.

## Features

- **Secure Payment Processing**: All payments are processed securely through Stripe
- **Google Pay & Apple Pay Support**: Native support for mobile payment methods
- **Customer Management**: Automatic customer creation and management
- **Webhook Handling**: Server-side webhook processing for payment events
- **Type Safety**: Full TypeScript support with proper type definitions

## Google Pay & Apple Pay Implementation

The application now supports Google Pay and Apple Pay through Stripe's Payment Request API. Here's how it works:

### Client-Side Implementation

1. **Payment Request Setup**: The `PaymentForm` component creates a payment request using `stripe.paymentRequest()`
2. **Availability Check**: The component checks if the user's browser/device supports Google Pay or Apple Pay
3. **Custom Button**: A styled button triggers the native payment sheet
4. **Payment Processing**: When the user completes the payment, the payment method is confirmed with Stripe

### Key Features

- **Automatic Detection**: The button only appears if the user's device supports Google Pay or Apple Pay
- **Native Experience**: Uses the device's native payment UI
- **Fallback Support**: If Google Pay/Apple Pay is not available, users can still pay with cards
- **Error Handling**: Comprehensive error handling for payment failures

### Configuration

The payment request is configured with:

- Country: US
- Currency: USD
- Amount: $9.00 (900 cents)
- Request payer name and email for customer creation

### Styling

The Google Pay/Apple Pay button follows Apple's Human Interface Guidelines and Google's Material Design:

- Dark theme with subtle gradients
- Proper border radius and shadows
- Disabled state handling
- Responsive design

## Usage

```typescript
// In your checkout component
<PaymentForm
  clientSecret={clientSecret}
  onSuccess={(paymentIntent) => {
    // Handle successful payment
  }}
  onError={(error) => {
    // Handle payment error
  }}
/>
```

## Environment Variables

Required environment variables:

- `STRIPE_SECRET_KEY`: Your Stripe secret key
- `STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key
- `STRIPE_WEBHOOK_SECRET`: Your Stripe webhook secret

## Testing

To test Google Pay and Apple Pay:

1. **Google Pay**: Use Chrome on Android or desktop with a Google Pay account
2. **Apple Pay**: Use Safari on iOS/macOS with Apple Pay configured
3. **Development**: Use Stripe's test mode with test payment methods

## Security

- All payment data is processed by Stripe servers
- No sensitive payment information is stored locally
- Customer data is securely managed through Stripe
- Webhook signatures are verified for security

## Troubleshooting

### Google Pay/Apple Pay not showing

- Ensure you're using HTTPS (required for payment requests)
- Check that the user has Google Pay/Apple Pay configured
- Verify the device/browser supports the payment method

### Payment failures

- Check Stripe dashboard for detailed error logs
- Verify webhook endpoints are properly configured
- Ensure all required environment variables are set

## Dependencies

- `@stripe/stripe-js`: Stripe JavaScript SDK
- `@stripe/react-stripe-js`: React components for Stripe
- `stripe`: Server-side Stripe SDK
