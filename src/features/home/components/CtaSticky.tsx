"use client"

import { useEffect, useState } from "react"

interface CtaStickyProps {
  countdown: number
  formatCountdown: (seconds: number) => string
  handleUnlock: () => void
  isUnlocked: boolean
  showCta: boolean
}

const CtaSticky = ({
  countdown,
  formatCountdown,
  handleUnlock,
  isUnlocked,
  showCta,
}: CtaStickyProps) => {
  const [opacity, setOpacity] = useState(0)

  useEffect(() => {
    if (showCta) {
      setOpacity(0)

      const timer = setTimeout(() => {
        setOpacity(1)
      }, 2000)

      // Cleanup timer on unmount or when showCta changes
      return () => clearTimeout(timer)
    } else {
      setOpacity(0)
    }
  }, [showCta])

  return (
    <div
      className={`cta-sticky `}
      style={{
        opacity: showCta ? opacity : 0,
        transition: "opacity 2s ease-in-out",
        display: showCta ? "block" : "none",
      }}>
      <div id='ctaBox'>
        <p
          id='countdownTimer'
          style={{
            textAlign: "center",
            fontSize: "0.95rem",
            color: "#ddd",
            marginBottom: "0.8rem",
          }}>
          Offer expires in {formatCountdown(countdown)}
        </p>
        <div className='cta-box'>
          
          <p
            style={{
              color: "#fffae5",
              fontStyle: "italic",
              marginBottom: "1rem",
            }}>
            This is for you only. No one else will ever see these words.
          </p>
  
          <p>● $9 — This message only</p>
          <ul className='soft-benefits'>
            <li>🕊️ Personal divine interpretation</li>
          </ul>
          <button
            className='unlock-btn'
            id='payButton'
            onClick={handleUnlock}
            disabled={isUnlocked}>
            {isUnlocked ? "Unlocking..." : "Yes — Show me Her words ✨"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CtaSticky
