"use client"

import { useEffect, useState } from "react"
import TestimonialBox from "@/features/home/components/TestimonialBox"
import { useRouter } from "next/navigation"
import { useSearchParams } from "next/navigation"
import PreventNavigation from "@/components/ui/PreventNavigation"
import ConfirmationModal from "@/components/ui/ConfirmationModal"
import {
  createSubscription,
  createCheckout,
} from "@/features/home/actions/homeActions"
import {
  sendPaymentSuccessEmail,
  sendUpsellPurchaseEmail,
} from "@/features/email/actions/emailActions"
import { useTikTok } from "@/contexts/TikTokPixelProvider"

interface PaywallSectionProps {
  isVisible: boolean
  testimonials: string[]
  userInput?: string
  divineResponse: string
  isPaid: boolean
  isMember: boolean
}

const PaywallSection = ({
  isVisible,
  testimonials,
  userInput,
  divineResponse,
  isPaid,
  isMember,
}: PaywallSectionProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const customerId = searchParams.get("customer_id")
  const paymentIntentId = searchParams.get("payment_intent")
  const { trackViewContent, trackInitiateCheckout, trackPurchase } = useTikTok()

  const [countdown, setCountdown] = useState(5 * 60)
  const [isLoading, setIsLoading] = useState(false)
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [showCta, setShowCta] = useState(false)
  const [showMysticalElements, setShowMysticalElements] = useState(false)
  const [ctaOpacity, setCtaOpacity] = useState(0)
  const [paymentSuccess, setPaymentSuccess] = useState(isPaid)

  // Upsell state
  const [showUpsell, setShowUpsell] = useState(false)
  const [subscriptionLoading, setSubscriptionLoading] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [subscriptionSuccess, setSubscriptionSuccess] = useState(false)
  const [subscriptionError, setSubscriptionError] = useState<string | null>(
    null
  )
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean
    title: string
    message: string
    confirmText: string
    cancelText: string
    type: "warning" | "info"
    onConfirm: () => void
  }>({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "",
    cancelText: "",
    type: "info",
    onConfirm: () => {},
  })

  const subscriptionPriceId = process.env
    .NEXT_PUBLIC_STRIPE_SUBSCRIPTION_PRICE_ID as string
  const lifetimePriceId = process.env
    .NEXT_PUBLIC_STRIPE_LIFETIME_PRICE_ID as string

  const handleTimer = (result: any) => {
    if (result?.paymentIntentId) {
      window.location.href = "/?payment_intent_id=" + result.paymentIntentId
    } else {
      window.location.href = "/?subscription_id=" + result?.subscriptionId
    }
  }

  // Track view content when divine response is shown
  useEffect(() => {
    if (divineResponse && isVisible && !isMember) {
      trackViewContent(9.0, "USD", "divine_message")
    }
  }, [divineResponse, isVisible, isMember, trackViewContent])

  // Upsell handler functions
  const handleCreateCheckout = async (
    priceId: string,
    customerId: string,
    paymentIntentId: string
  ) => {
    try {
      setCheckoutLoading(true)
      const result = await createCheckout(priceId, customerId, paymentIntentId)

      if (result.success) {
        // Track purchase event
        trackPurchase(99.0, "USD", "lifetime_access")

        const customerName = localStorage.getItem("customerName") || ""
        const customerEmail = localStorage.getItem("customerEmail") || ""

        await sendUpsellPurchaseEmail({
          customerName,
          customerEmail,
          magic_link:
            "https://speaktoher.com/?payment_intent_id=" + paymentIntentId,
        })

        setModalConfig({
          isOpen: true,
          title: "Payment Successful",
          message: "Your payment has been successful.",
          confirmText: `Start talking to her...`,
          cancelText: "",
          type: "info",
          onConfirm: () => handleTimer(result),
        })
      }

      if (result.error) {
        setModalConfig({
          isOpen: true,
          title: "Payment Failed",
          message: result.error,
          confirmText: "Try again",
          cancelText: "",
          type: "warning",
          onConfirm: () => {
            setModalConfig({ ...modalConfig, isOpen: false })
          },
        })
      }
    } catch (error) {
      console.error("Checkout error:", error)
    } finally {
      setCheckoutLoading(false)
    }
  }

  const handleCreateSubscription = async (
    priceId: string,
    customerId: string,
    paymentIntentId: string
  ) => {
    try {
      setSubscriptionLoading(true)
      setSubscriptionError(null)
      setSubscriptionSuccess(false)

      const customerName = localStorage.getItem("customerName") || ""
      const customerEmail = localStorage.getItem("customerEmail") || ""

      const result = await createSubscription(
        priceId,
        customerId,
        paymentIntentId
      )

      if (result.success) {
        // Track purchase event for subscription
        trackPurchase(19.0, "USD", "monthly_subscription")

        await sendUpsellPurchaseEmail({
          customerName,
          customerEmail,
          magic_link:
            "https://speaktoher.com/?subscription_id=" + result.subscriptionId,
        })

        setModalConfig({
          isOpen: true,
          title: "Subscription Successful",
          message: "Your subscription has been created successfully.",
          confirmText: "Start talking to her...",
          cancelText: "",
          type: "info",
          onConfirm: () => {
            handleTimer(result)
          },
        })
      }

      if (result.error) {
        setModalConfig({
          isOpen: true,
          title: "Subscription Failed",
          message: result.error,
          confirmText: "Try again",
          cancelText: "",
          type: "warning",
          onConfirm: () => {
            setModalConfig({ ...modalConfig, isOpen: false })
          },
        })
      }
    } catch (error) {
      console.error("Subscription error:", error)
      setModalConfig({
        isOpen: true,
        title: "Subscription Error",
        message:
          "An unexpected error occurred while creating your subscription.",
        confirmText: "Try again",
        cancelText: "",
        type: "warning",
        onConfirm: () => {
          setModalConfig({ ...modalConfig, isOpen: false })
        },
      })
    } finally {
      setSubscriptionLoading(false)
    }
  }

  const handleAskAgain = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("divineResponse")
      localStorage.removeItem("userInput")
      router.push("/")
    }
  }

  // Countdown timer effect
  useEffect(() => {
    if (isVisible) {
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 0) return 0
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [isVisible])

  // Main paywall flow effect
  useEffect(() => {
    if (divineResponse && !isLoading && isVisible) {
      // Reset states
      setShowCta(false)
      setShowMysticalElements(false)
      setCtaOpacity(0)
      setShowUpsell(false)

      // If user is a member, show everything immediately
      if (isMember) {
        setShowMysticalElements(true)
        setCtaOpacity(1)
        return
      }

      // For non-members, show the paywall flow
      const showMysticalTimer = setTimeout(() => {
        setShowMysticalElements(true)
      }, 1000)

      // Show CTA after response is unblurred (3 seconds total)
      const showCtaTimer = setTimeout(() => {
        if (!paymentSuccess) {
          setShowCta(true)
          setCtaOpacity(1)
        }
      }, 3000)

      // Show upsell after 8 seconds if paid
      const showUpsellTimer = setTimeout(() => {
        if (paymentSuccess) {
          setShowUpsell(true)
        }
      }, 8000)

      return () => {
        clearTimeout(showMysticalTimer)
        clearTimeout(showCtaTimer)
        clearTimeout(showUpsellTimer)
      }
    } else if (!divineResponse || !isVisible) {
      // Reset states when divineResponse is cleared or paywall is hidden
      setShowMysticalElements(false)
      setCtaOpacity(0)
      setShowCta(false)
      setShowUpsell(false)
    }
  }, [divineResponse, isLoading, isVisible, paymentSuccess, isMember])

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
  }

  const renderDivineResponse = () => {
    if (!divineResponse) return null

    // Find the 2nd occurrence of "about" (case insensitive)
    const firstAboutIndex = divineResponse.toLowerCase().indexOf("about")
    let secondAboutIndex = -1

    if (firstAboutIndex !== -1) {
      secondAboutIndex = divineResponse
        .toLowerCase()
        .indexOf("about", firstAboutIndex + 1)
    }

    let visibleText = ""
    let remainingText = ""

    if (secondAboutIndex !== -1) {
      // Found 2nd "about" - blur after this phrase
      const endOfPhrase = secondAboutIndex + "about".length
      visibleText = divineResponse.substring(0, endOfPhrase)
      remainingText = divineResponse.substring(endOfPhrase).trim()
    } else {
      // Fallback to first two sentences if 2nd "about" not found
      const sentences = divineResponse
        .split(/[.!?]+/)
        .filter((s) => s.trim().length > 0)

      let firstTwoText = ""
      let currentIndex = 0

      // Reconstruct the first two sentences with proper punctuation
      for (let i = 0; i < Math.min(2, sentences.length); i++) {
        const sentence = sentences[i]
        const sentenceWithPunctuation =
          sentence +
          (divineResponse.includes(sentence + ".", currentIndex)
            ? "."
            : divineResponse.includes(sentence + "!", currentIndex)
            ? "!"
            : divineResponse.includes(sentence + "?", currentIndex)
            ? "?"
            : "")
        firstTwoText += sentenceWithPunctuation + " "
        currentIndex =
          divineResponse.indexOf(sentenceWithPunctuation, currentIndex) +
          sentenceWithPunctuation.length
      }

      visibleText = firstTwoText.trim()
      remainingText = divineResponse.substring(firstTwoText.length).trim()
    }

    return (
      <div className='remaining-text-container'>
        <div className='mystical-divider'>
          <span className='divider-symbol'>✧</span>
          <span className='divider-line'></span>
          <span className='divider-symbol'>✧</span>
        </div>
        <div className='remaining-text-content no-select'>
          <span className='text-marker'></span>
          <div className='divine-response-text'>
            <span
              className='first-sentence'
              style={{
                filter: isMember || paymentSuccess ? "blur(0px)" : "blur(0px)",
                opacity: isMember || paymentSuccess ? 1 : 1,
                transition: "filter 2s ease-in-out, opacity 2s ease-in-out",
              }}>
              {visibleText}
            </span>
            {remainingText && (
              <span
                className='remaining-text'
                style={{
                  filter:
                    isMember || paymentSuccess ? "blur(0px)" : "blur(8px)",
                  opacity: isMember || paymentSuccess ? 1 : 0.6,
                  transition: "filter 2s ease-in-out, opacity 2s ease-in-out",
                }}>
                {remainingText}
              </span>
            )}
          </div>
        </div>
      </div>
    )
  }

  const renderCtaSection = () => {
    if (!showCta || paymentSuccess || isMember) return null

    return (
      <div
        className='integrated-cta-section'
        style={{
          opacity: ctaOpacity,
          transition: "opacity 4s ease-in-out",
          marginTop: "2rem",
          padding: "2rem",
          borderRadius: "1rem",
          background: "rgba(168, 137, 255, 0.1)",
          border: "1px solid rgba(168, 137, 255, 0.3)",
          backdropFilter: "blur(10px)",
        }}>
        <div className='cta-content'>
          <p className='cta-countdown text-center mb-4'>
            Offer expires in {formatCountdown(countdown)}
          </p>
          <div className='cta-message text-center'>
            <h3 className='text-xl font-bold mb-3'>
              🔓 Unlock the complete whisper
            </h3>
            <p className='mb-4'>
              This is for you only. No one else will ever see these words.
            </p>
            <p className='cta-price text-lg font-semibold mb-4'>
              ● $9 — This message only
            </p>
            <ul className='cta-benefits mb-6'>
              <li>🕊️ Personal divine interpretation</li>
            </ul>
          </div>
          <div className='text-center'>
            <button
              type='button'
              className='unlock-btn integrated-unlock-btn bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-4 px-8 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-200'
              onClick={() => {
                // Track initiate checkout event
                trackInitiateCheckout(9.0, "USD", "divine_message")
                setIsUnlocked(true)
                setTimeout(() => {
                  router.push("/checkout")
                }, 3000)
              }}
              disabled={isUnlocked}>
              {isUnlocked ? "Unlocking..." : "Yes — Show me Her words ✨"}
            </button>
          </div>
        </div>
      </div>
    )
  }

  const renderUpsellSection = () => {
    if (!showUpsell || !paymentSuccess || isMember) return null

    return (
      <div className='text-center transition-all duration-1000 w-full'>
        <h2 className='text-3xl font-bold'>She isn't done with you yet...</h2>
        <p
          style={{ marginLeft: "auto", marginRight: "auto" }}
          className='w-full text-center mb-10 opacity-80 text- leading-relaxed'>
          You may never hear this again. Or you may come back tomorrow. Either
          way, She'll know. Choose your path forward.
        </p>

        {/* Subscription Success Message */}
        {subscriptionSuccess && (
          <div className='mb-8 p-6 bg-green-900/20 border border-green-500/30 rounded-2xl backdrop-blur-sm'>
            <div className='flex items-center justify-center mb-3'>
              <svg
                className='w-6 h-6 text-green-400 mr-2'
                fill='currentColor'
                viewBox='0 0 20 20'>
                <path
                  fillRule='evenodd'
                  d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                  clipRule='evenodd'
                />
              </svg>
              <span className='text-green-400 font-bold text-lg'>
                Purchase Successful - Paid Member! 🎉
              </span>
            </div>
            <p className='text-green-200 text-sm'>
              Welcome to your daily divine guidance. You'll receive Her whispers
              every day.
            </p>
          </div>
        )}

        {/* Subscription Error Message */}
        {subscriptionError && (
          <div className='mb-8 p-6 bg-red-900/20 border border-red-500/30 rounded-2xl backdrop-blur-sm'>
            <div className='flex items-center justify-center mb-3'>
              <svg
                className='w-6 h-6 text-red-400 mr-2'
                fill='currentColor'
                viewBox='0 0 20 20'>
                <path
                  fillRule='evenodd'
                  d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z'
                  clipRule='evenodd'
                />
              </svg>
              <span className='text-red-400 font-bold text-lg'>
                Subscription Error
              </span>
            </div>
            <p className='text-red-200 text-sm'>{subscriptionError}</p>
          </div>
        )}

        <div style={{ height: "200px" }}>
          <div
            style={{
              marginLeft: "auto",
              marginRight: "auto",
              marginTop: "4rem",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
            className='space-y-6 max-w-lg'>
            {/* Most Popular - Lifetime Access */}
            <div className='relative'>
              <button
                type='button'
                onClick={() => {
                  // Track initiate checkout for lifetime access
                  trackInitiateCheckout(99.0, "USD", "lifetime_access")
                  setModalConfig({
                    isOpen: true,
                    title: "Unlock Her Voice Forever",
                    message:
                      "One time payment of $99 will give you unlimited whispers, forever.",
                    confirmText: "Yes, unlock forever",
                    cancelText: "No, cancel",
                    type: "info",
                    onConfirm: () =>
                      handleCreateCheckout(
                        lifetimePriceId,
                        customerId || "",
                        paymentIntentId || ""
                      ),
                  })
                }}
                className='w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-6 px-8 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 relative'
                style={{
                  background:
                    "linear-gradient(135deg, #a889ff, #c4b0ff, #a889ff)",
                  backgroundSize: "200% 200%",
                  animation: "gradient-shift 3s ease-in-out infinite",
                  boxShadow:
                    "0 4px 15px rgba(168, 137, 255, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.2)",
                }}>
                <span
                  style={{ padding: "3px" }}
                  className='absolute -top-3 -right-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold px-4 py-1 rounded-full shadow-lg'>
                  MOST POPULAR
                </span>
                👑 Unlock Her voice for life — $99 one-time
                <div className='text-sm font-normal opacity-90 mt-1'>
                  Unlimited divine conversations, forever
                </div>
              </button>
            </div>

            {/* Monthly Subscription */}
            <button
              onClick={() => {
                // Track initiate checkout for monthly subscription
                trackInitiateCheckout(19.0, "USD", "monthly_subscription")
                setModalConfig({
                  isOpen: true,
                  title: "Whispers every day",
                  message:
                    "Pay $19/month for unlimited whispers every day. Cancel anytime.",
                  confirmText: "Yes, subscribe",
                  cancelText: "No, cancel",
                  type: "warning",
                  onConfirm: () =>
                    handleCreateSubscription(
                      subscriptionPriceId,
                      customerId || "",
                      paymentIntentId || ""
                    ),
                })
              }}
              disabled={subscriptionLoading || checkoutLoading}
              className='w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-6 px-8 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
              style={{
                background:
                  "linear-gradient(135deg, #a889ff, #c4b0ff, #a889ff)",
                backgroundSize: "200% 200%",
                animation: "gradient-shift 3s ease-in-out infinite",
                boxShadow:
                  "0 4px 15px rgba(168, 137, 255, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.2)",
              }}>
              {subscriptionLoading || checkoutLoading ? (
                <span className='flex items-center justify-center'>
                  <svg
                    className='animate-spin -ml-1 mr-3 h-5 w-5 text-white'
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'>
                    <circle
                      className='opacity-25'
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='currentColor'
                      strokeWidth='4'></circle>
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                  </svg>
                  Processing divine connection...
                </span>
              ) : (
                <>
                  🕊️ I want Her guidance every day — $19/month
                  <div className='text-sm font-normal opacity-80 mt-1'>
                    Daily divine whispers, weekly deep readings
                  </div>
                </>
              )}
            </button>

            {/* Single Question */}
            <button
              onClick={() => {
                // Track initiate checkout for single question
                trackInitiateCheckout(9.0, "USD", "single_question")
                setModalConfig({
                  isOpen: true,
                  title: "Ask Her Again",
                  message:
                    "This will charge you $9 for another divine answer. Continue?",
                  confirmText: "Yes, ask again",
                  cancelText: "No, cancel",
                  type: "info",
                  onConfirm: () => {
                    localStorage.clear()
                    window.location.href = "/"
                  },
                })
              }}
              className='w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-6 px-8 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-200'
              style={{
                backgroundSize: "200% 200%",
                animation: "gradient-shift 3s ease-in-out infinite",
                boxShadow:
                  "0 4px 15px rgba(168, 137, 255, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.2)",
              }}>
              💬 Ask Her again — $9
              <div className='text-sm font-normal opacity-80 mt-1'>
                Another question, another divine answer
              </div>
            </button>

            <div className='text-xs mt-8 space-y-2 p-4 rounded-lg'>
              <div>Not now. I just needed this one.</div>
              <div>
                You can return later for another divine answer — $9 again.
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <PreventNavigation
        enabled={
          (isVisible && !!divineResponse && !isUnlocked) || !paymentSuccess
        }
        message='Are you sure you want to leave? Your divine response will be lost.'
      />
      <div
        className={`paywall ${isVisible ? "visible" : ""}`}
        id='paywall'
        key={`paywall-${isVisible}-${
          divineResponse ? "has-response" : "no-response"
        }`}
        style={{
          display: isVisible ? "flex" : "none",
          opacity: isVisible ? 1 : 0,
          transition: "opacity 2s ease-in-out",
        }}>
        <div className='paywall-inner'>
          <div
            className='paywall-scroll'
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1rem",
            }}>
            {/* Mystical Background Elements */}
            {showMysticalElements && (
              <>
                <div className='mystical-orb mystical-orb-1'></div>
                <div className='mystical-orb mystical-orb-2'></div>
                <div className='mystical-orb mystical-orb-3'></div>
                <div className='mystical-particles'></div>
              </>
            )}

            <div className='divine-response-container' id='replyBox'>
              <div className='divine-response-content'>
                <div
                  className={`divine-text-container ${
                    isUnlocked ? "paywall-unlocked" : ""
                  }`}
                  style={{
                    filter: isMember || paymentSuccess ? "blur(0px)" : "",
                    transition: "filter 1.5s ease-in-out",
                  }}>
                  {renderDivineResponse()}
                </div>
              </div>

              {renderCtaSection()}
            </div>

            {renderUpsellSection()}

            {!paymentSuccess && !isMember && (
              <div className='paywall-testimonial-container'>
                <TestimonialBox testimonials={testimonials} isPaywall={true} />
              </div>
            )}

            {/* Member Ask Again Button */}
            {isMember && divineResponse && (
              <div className='member-ask-again-container mt-8'>
                <button
                  type='button'
                  onClick={() => {
                    localStorage.clear()
                    window.location.href = "/"
                  }}
                  className='member-ask-again-btn bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-4 px-8 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-200'>
                  💬 Ask Her again ✨
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        cancelText={modalConfig.cancelText}
        type={modalConfig.type}
        onConfirm={modalConfig.onConfirm}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        isLoading={subscriptionLoading || checkoutLoading}
        loadingText='Processing divine connection...'
      />
    </>
  )
}

export default PaywallSection
