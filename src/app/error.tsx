"use client"

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Only log in browser environment
    if (typeof window !== 'undefined') {
      console.error('Error caught by error boundary:', error)
    }
  }, [error])

  // Safe error message extraction
  const errorMessage = (() => {
    try {
      return error?.message || "An unexpected error occurred"
    } catch {
      return "An unexpected error occurred"
    }
  })()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong!</h1>
        <p className="text-gray-600 mb-4">{errorMessage}</p>
        <button
          onClick={() => {
            try {
              reset()
            } catch (e) {
              window.location.reload()
            }
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  )
}