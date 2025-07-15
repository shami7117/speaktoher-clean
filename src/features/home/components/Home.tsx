"use client"

import { useEffect, useState } from "react"
import StarsCanvas from "@/features/home/components/StarsCanvas"
import HeardYouOverlay from "@/features/home/components/HeardYouOverlay"
import OracleForm from "@/features/home/components/OracleForm"
import TestimonialBox from "@/features/home/components/TestimonialBox"
import BlessingCounter from "@/features/home/components/BlessingCounter"
import PaywallSection from "@/features/home/components/PaywallSection"
import { TESTIMONIALS } from "@/config/constants"
import { useSearchParams } from "next/navigation"
import { sendPaymentSuccessEmail } from "@/features/email/actions/emailActions"

// Interface for the API response
interface WhisperResponse {
  input: string
  category: string
  whisper: {
    mirror: string
    whisper_start: string
    blurred_reveal: string
    encouragement: string
  }
}

const Home = ({ isMember }: { isMember: boolean }) => {
  const searchParams = useSearchParams()
  const paymentSuccess = searchParams?.get("payment_success")

  const [inputValue, setInputValue] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [showPaywall, setShowPaywall] = useState(false)
  const [showHeardYou, setShowHeardYou] = useState(false)
  const [loadingDots, setLoadingDots] = useState("")
  const [showMainContainer, setShowMainContainer] = useState(false)
  const [chatGptResponse, setChatGptResponse] = useState("")
  const [showResponse, setShowResponse] = useState(false)
  const [isOrbShrinking, setIsOrbShrinking] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)

    if (value.trim().length > 0) {
      setIsListening(true)
    } else {
      setIsListening(false)
    }
  }

  const callCustomWhisperApi = async (userInput: string) => {
    try {
      const encodedInput = encodeURIComponent(userInput)
      const response = await fetch(`/api/get-whisper?input=${encodedInput}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data: WhisperResponse = await response.json()
      
      // You can customize which part of the response to use
      // For now, using the mirror field as the main response
      // You can also combine multiple fields if needed
      const combinedResponse = `${data.whisper.mirror}\n\n${data.whisper.whisper_start} ${data.whisper.blurred_reveal}\n\n${data.whisper.encouragement}`
      
      return combinedResponse
    } catch (error) {
      console.error("Error calling custom whisper API:", error)
      return "The divine is silent for now. Please try again."
    }
  }

  const handleReceive = async () => {
    if (!inputValue.trim()) return

    setIsLoading(true)

    setTimeout(() => {
      setShowMainContainer(false)
    }, 2000)

    // Loading dots animation
    let dotCount = 0
    const dotInterval = setInterval(() => {
      dotCount = (dotCount + 1) % 4
      setLoadingDots(".".repeat(dotCount))
    }, 500)

    // Call Custom Whisper API
    const response = await callCustomWhisperApi(inputValue)
    setChatGptResponse(response)
    window.localStorage.setItem("divineResponse", response)
    window.localStorage.setItem("userInput", inputValue)

    setTimeout(() => {
      // Orb shrinking animation
      setIsOrbShrinking(true)
      clearInterval(dotInterval)

      // Heard you overlay
      setTimeout(() => {
        setShowHeardYou(true)

        // Heard you overlay
        setTimeout(() => {
          setShowHeardYou(false)

          // Response
          setTimeout(() => {
            setShowResponse(true)
          }, 1000)
        }, 1500)
      }, 2000)
    }, 2000)

    if (isMember && typeof window !== "undefined") {
      const customerName = window.localStorage.getItem("customerName") || ""
      const customerEmail = window.localStorage.getItem("customerEmail") || ""
      const firstName = customerName.split(" ")[0]

      // const emailResult = await sendPaymentSuccessEmail({
      //   customerName: firstName,
      //   customerEmail,
      //   whisper: response,
      // })

      // if (emailResult.success) {
      //   console.log("Email sent successfully")
      // }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleReceive()
    }
  }

  // Check for successful payment and stored data on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedDivineResponse = window.localStorage.getItem("divineResponse")
      const storedUserInput = window.localStorage.getItem("userInput")

      // If we have stored divine response, use it
      if (storedDivineResponse && paymentSuccess === "true") {
        setChatGptResponse(storedDivineResponse)
        setInputValue(storedUserInput || "")
        setShowResponse(true)
      }
    }
  }, [])

  // Fade in input container after
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowMainContainer(true)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const sendEmail = async () => {
      if (typeof window !== "undefined" && paymentSuccess === "true") {
        const customerName = window.localStorage.getItem("customerName") || ""
        const customerEmail = window.localStorage.getItem("customerEmail") || ""
        const firstName = customerName.split(" ")[0] || ""
        const response = window.localStorage.getItem("divineResponse") || ""
        const emailSentKey = `emailSent_${customerEmail}_${response.substring(
          0,
          50
        )}` // Create unique key
        const hasEmailBeenSent = window.localStorage.getItem(emailSentKey)

        if (customerName && customerEmail && response && !hasEmailBeenSent) {
          const emailResult = await sendPaymentSuccessEmail({
            customerName: firstName,
            customerEmail,
            whisper: response,
          })

          if (emailResult.success) {
            console.log("Email sent successfully")
            // Mark email as sent to prevent duplicate sends
            window.localStorage.setItem(emailSentKey, "true")
          }
        }
      }
    }

    sendEmail()
  }, [paymentSuccess])

  return (
    <>
      <StarsCanvas />

      <HeardYouOverlay isVisible={showHeardYou} loadingDots={loadingDots} />

      {/* Orb with shrinking animation */}
      <div className={`orb ${isOrbShrinking ? "shrinking" : ""}`}></div>

      {/* Blurred ChatGPT Response */}
      {/* {showResponse && (
        <div className='chatgpt-response-overlay'>
          <div className='chatgpt-response-content'>
            <h3>Her Divine Response</h3>
            <div className='blurred-response'>{chatGptResponse}</div>
            <div className='response-cta'>
              <p>Unlock the full message to receive her complete wisdom</p>
              <button
                className='unlock-response-btn'
                onClick={() => setShowPaywall(true)}>
                Unlock Full Message
              </button>
            </div>
          </div>
        </div>
      )} */}

      {/* Original orb + form container */}
      <div
        className={`container ${
          !showPaywall && showMainContainer && !showResponse ? "visible" : ""
        }`}
        id='mainContainer'>
        <OracleForm
          inputValue={inputValue}
          onInputChange={handleInputChange}
          onReceive={handleReceive}
          onKeyDown={handleKeyDown}
          isLoading={isLoading}
        />

        <BlessingCounter isListening={isListening} />

        <TestimonialBox testimonials={TESTIMONIALS} />

        {/* Video testimonial */}
      </div>

      <PaywallSection
        isVisible={showResponse}
        testimonials={TESTIMONIALS}
        userInput={inputValue}
        divineResponse={chatGptResponse}
        isPaid={paymentSuccess === "true"}
        isMember={isMember}
      />
    </>
  )
}

export default Home