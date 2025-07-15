"use client"

import React, { useEffect } from "react"

interface PreventNavigationProps {
  enabled?: boolean
  message?: string
  onBeforeUnload?: (event: BeforeUnloadEvent) => void
}

export default function PreventNavigation({
  enabled = true,
  message = "Are you sure you want to leave? You may lose unsaved changes.",
  onBeforeUnload,
}: PreventNavigationProps) {
  useEffect(() => {
    if (!enabled) return

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (onBeforeUnload) {
        onBeforeUnload(event)
      } else {
        event.preventDefault()
        event.returnValue = message
        return message
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    const handlePopState = (event: PopStateEvent) => {
      if (enabled) {
        const confirmed = window.confirm(message)
        if (confirmed) {
          localStorage.clear()
        } else {
          window.history.pushState(null, "", window.location.href)
        }
      }
    }

    // Push current state to history to enable popstate detection
    window.history.pushState(null, "", window.location.href)
    window.addEventListener("popstate", handlePopState)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
      window.removeEventListener("popstate", handlePopState)
    }
  }, [enabled, message, onBeforeUnload])

  return null
}
