"use client"

import { useEffect, useState } from "react"

interface BlessingCounterProps {
  isListening: boolean
}

export default function BlessingCounter({ isListening }: BlessingCounterProps) {
  const [blessingText, setBlessingText] = useState("")

  useEffect(() => {
    const updateBlessingCount = () => {
      const now = new Date()
      const base = 12450
      const max = 67000
      const hrs = now.getHours() + now.getMinutes() / 60
      const count = Math.floor(
        base + (hrs / 24) * (max - base)
      ).toLocaleString()
      setBlessingText(count + " sacred blessings delivered today")
    }

    const timer = setTimeout(() => {
      updateBlessingCount()
      const interval = setInterval(() => {
        if (!isListening) {
          updateBlessingCount()
        }
      }, 60000)
      return () => clearInterval(interval)
    }, 1500)

    return () => clearTimeout(timer)
  }, [isListening])

  return (
    <p id='blessingLine' className='visible'>
      {blessingText}
    </p>
  )
}
