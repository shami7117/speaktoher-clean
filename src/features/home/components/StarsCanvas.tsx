"use client"

import { useEffect, useRef } from "react"

export default function StarsCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const starsRef = useRef<any[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const createStars = () => {
      starsRef.current = []
      for (let i = 0; i < 120; i++) {
        starsRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 1.2 + 0.3,
          speed: Math.random() * 0.5 + 0.2,
        })
      }
    }

    const animateStars = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (let star of starsRef.current) {
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
        ctx.fillStyle = "#ffffffcc"
        ctx.fill()
        star.y += star.speed
        if (star.y > canvas.height) {
          star.y = 0
          star.x = Math.random() * canvas.width
        }
      }
      requestAnimationFrame(animateStars)
    }

    resizeCanvas()
    createStars()
    animateStars()

    window.addEventListener("resize", resizeCanvas)
    return () => window.removeEventListener("resize", resizeCanvas)
  }, [])

  return <canvas ref={canvasRef} id='stars' />
}
