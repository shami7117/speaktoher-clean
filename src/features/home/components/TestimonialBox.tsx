"use client"

import { useEffect, useState } from "react"

interface TestimonialBoxProps {
  testimonials: string[]
  isPaywall?: boolean
}

export default function TestimonialBox({
  testimonials,
  isPaywall = false,
}: TestimonialBoxProps) {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  useEffect(() => {
    const timer = setTimeout(
      () => {
        const interval = setInterval(
          () => {
            setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
          },
          isPaywall ? 5000 : 3700
        )
        return () => clearInterval(interval)
      },
      isPaywall ? 0 : 3500
    )

    return () => clearTimeout(timer)
  }, [testimonials.length, isPaywall])

  return (
    <div
      className={`h-10 text-2xl testimonial-box visible ${
        isPaywall ? "paywall-testimonial-box" : ""
      }`}
      id={isPaywall ? "paywallTestimonialBox" : "frontTestimonialBox"}
      style={
        !isPaywall ? { marginTop: "4rem", marginBottom: "1rem" } : undefined
      }>
      <p id={isPaywall ? "paywallTestimonialText" : "frontTestimonialText"}>
        {testimonials[currentTestimonial]}
      </p>
      <div className='stars-container flex justify-center'>
        <span className='star'>⭐</span>
        <span className='star'>⭐</span>
        <span className='star'>⭐</span>
        <span className='star'>⭐</span>
        <span className='star'>⭐</span>
      </div>
    </div>
  )
}
