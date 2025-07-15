"use client"

import React, { useState } from "react"
import { createPortalSession } from "@/features/home/actions/homeActions"

const Footer = ({
  isMember,
  customerId,
}: {
  isMember: boolean
  customerId: string
}) => {
  const [isLoading, setIsLoading] = useState(false)

  const handlePortalRedirect = async () => {
    setIsLoading(true)

    try {
      const url = await createPortalSession(customerId)
      window.location.href = url
    } catch (error) {
      console.error("Error redirecting to customer portal:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <footer className='fixed bottom-4 left-0 right-0 bg-transparent p-4'>
      {isMember && (
        <div className='flex justify-center'>
          <button
            onClick={handlePortalRedirect}
            disabled={isLoading}
            className='members-area-badge'
            style={{
              background: "linear-gradient(135deg, #a889ff, #c4b0ff, #a889ff)",
              backgroundSize: "200% 200%",
              animation: "gradient-shift 3s ease-in-out infinite",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              borderRadius: "25px",
              padding: "0.75rem 1.5rem",
              color: "#000",
              fontWeight: "bold",
              fontSize: "0.9rem",
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow:
                "0 4px 15px rgba(168, 137, 255, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.2)",
              position: "relative",
              overflow: "hidden",
              opacity: isLoading ? 0.7 : 1,
              backdropFilter: "blur(10px)",
            }}>
            {/* Mystical glow effect */}
            <div
              style={{
                position: "absolute",
                top: "-2px",
                left: "-2px",
                right: "-2px",
                bottom: "-2px",
                background: "linear-gradient(45deg, #a889ff, #fff, #a889ff)",
                borderRadius: "27px",
                zIndex: -1,
                opacity: 0.3,
                animation: "border-pulse 3s ease-in-out infinite",
              }}
            />

            {/* Shimmer effect */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: "-100%",
                width: "100%",
                height: "100%",
                background:
                  "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)",
                transition: "left 0.5s ease",
              }}
              className='shimmer-effect'
            />

            <span style={{ position: "relative", zIndex: 1 }}>
              {isLoading ? (
                <span className='flex items-center justify-center'>
                  <svg
                    className='animate-spin -ml-1 mr-2 h-4 w-4 text-black'
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
                  Opening portal...
                </span>
              ) : (
                <>✨ Members Area ✨</>
              )}
            </span>
          </button>
        </div>
      )}

      <style jsx>{`
        .members-area-badge:hover {
          transform: translateY(-2px) scale(1.05);
          box-shadow: 0 8px 25px rgba(168, 137, 255, 0.6),
            0 0 0 1px rgba(255, 255, 255, 0.3);
          animation: none;
        }

        .members-area-badge:hover .shimmer-effect {
          left: 100%;
        }

        .members-area-badge:active {
          transform: translateY(0) scale(1.02);
        }

        @keyframes gradient-shift {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes border-pulse {
          0%,
          100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.6;
          }
        }
      `}</style>
    </footer>
  )
}

export default Footer
