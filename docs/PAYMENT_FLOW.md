# Payment Flow Documentation

## Overview

This document describes the complete payment flow from the paywall section to the success page with upsells.

## Flow Steps

### 1. Paywall Section (`PaywallSection.tsx`)

- User sees a blurred preview of the divine response
- First sentence gradually unblurs with a 2-second transition
- CTA button appears after the unblur effect
- User clicks "Yes — Show me Her words ✨"

### 2. Data Storage

When user clicks unlock:

```javascript
sessionStorage.setItem("divineResponse", divineResponse)
sessionStorage.setItem("userInput", userInput || "")
router.push("/checkout")
```

### 3. Checkout Page (`/checkout`)

- Creates Stripe payment intent
- Handles payment form with customer name/email
- Processes payment via Stripe
- Redirects to success page on completion

### 4. Success Page (`/success`)

The success page implements a staged reveal with animations:

#### Stage 1: Payment Verification (0-1s)

- Verifies payment using `/api/verify-payment`
- Shows loading state during verification

#### Stage 2: "She heard you" Header (1s)

- Animated header with gradient line
- Smooth fade-in and slide-up animation

#### Stage 3: Full Divine Response (3s)

- Displays the complete divine message
- Large, prominent styling with backdrop blur
- Smooth fade-in and slide-up animation

#### Stage 4: Whisper Section (6s)

- Philosophical text about the divine connection
- Some text remains blurred for effect
- Smooth fade-in and slide-up animation

#### Stage 5: Upsell Section (12s)

- Three upsell options with compelling copy:
  1. **Daily Guidance** - $15/month subscription
  2. **Lifetime Access** - $99 one-time payment
  3. **Ask Again** - $9 for another question
- Each button preserves current divine response in sessionStorage
- "Ask Again" clears sessionStorage and redirects to home

## API Endpoints

### `/api/verify-payment`

- **Method**: GET
- **Query**: `payment_intent={payment_intent_id}`
- **Purpose**: Verifies payment status with Stripe
- **Returns**: Payment status and details

## Key Features

### Payment Verification

- Server-side verification using Stripe API
- Graceful fallback if verification fails
- Secure payment confirmation

### Staged Reveal

- Progressive disclosure builds anticipation
- Smooth animations enhance user experience
- Strategic timing for maximum impact

### Upsell Strategy

- Multiple price points ($9, $15/month, $99)
- Clear value propositions for each tier
- Preserves user context across sessions

### Data Persistence

- Uses sessionStorage for divine response
- Maintains user input across payment flow
- Clears data appropriately for new sessions

## Technical Implementation

### State Management

- React hooks for animation states
- sessionStorage for data persistence
- URL parameters for payment verification

### Animations

- CSS transitions with transform and opacity
- Staggered timing for progressive reveal
- Smooth easing functions

### Error Handling

- Graceful fallbacks for API failures
- Loading states for better UX
- Payment verification with error recovery

## Future Enhancements

1. **Email Delivery**: Send divine response via email
2. **Analytics**: Track conversion rates and user behavior
3. **A/B Testing**: Test different upsell copy and timing
4. **Personalization**: Customize messages based on user history
5. **Social Proof**: Add testimonials to success page
