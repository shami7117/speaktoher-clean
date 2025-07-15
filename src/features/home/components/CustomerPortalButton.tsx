"use client"

import { useState } from "react"
import { createPortalSession } from "../actions/portalActions"

interface CustomerPortalButtonProps {
  customerId?: string
}

export default function CustomerPortalButton({
  customerId,
}: CustomerPortalButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handlePortalRedirect = async () => {
    setIsLoading(true)

    try {
      const result = await createPortalSession(customerId)

      if (!result.success) {
        throw new Error("Failed to create portal session")
      }

      if (!result.url) {
        throw new Error("No URL returned from createPortalSession")
      }

      window.location.href = result.url
    } catch (error) {
      console.error("Error redirecting to customer portal:", error)
      // You might want to show a toast notification here
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handlePortalRedirect}
      disabled={isLoading}
      className='customer-portal-btn'
      style={{
        background: "transparent",
        display: "none",
        border: "1px solid rgba(255, 255, 255, 0.3)",
        color: "#fff",
        padding: "0.5rem 1rem",
        borderRadius: "4px",
        cursor: "pointer",
        fontSize: "0.9rem",
        transition: "all 0.2s ease",
        opacity: isLoading ? 0.6 : 1,
      }}>
      {isLoading ? "Loading..." : "Customer Portal"}
    </button>
  )
}
