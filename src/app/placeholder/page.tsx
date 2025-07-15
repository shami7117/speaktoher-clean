"use client"

import { useEffect, useRef } from "react"

export default function ComingSoon() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const starsRef = useRef<any[]>([])

  // Stars animation
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
      for (let i = 0; i < 150; i++) {
        starsRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 1.5 + 0.3,
          speed: Math.random() * 0.3 + 0.1,
          opacity: Math.random() * 0.8 + 0.2,
        })
      }
    }

    const animateStars = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (let star of starsRef.current) {
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`
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

  return (
    <div className='coming-soon-container'>
      <canvas ref={canvasRef} className='stars-canvas' />

      <div className='content'>
        <div className='logo'>
          <div className='orb-glow'></div>
          <div className='orb'></div>
        </div>

        <h1 className='title uppercase'>Speak to Her</h1>

        <div className='coming-soon-text'>
          <h2>Coming Soon...</h2>
          <p className='subtitle'>Divine wisdom awaits</p>
        </div>

        <div className='description'></div>

        <div className='features'>
          <div className='feature'>
            <span className='feature-icon'>🕊️</span>
            <span>Divine Guidance</span>
          </div>
          <div className='feature'>
            <span className='feature-icon'>✨</span>
            <span>Sacred Wisdom</span>
          </div>
          <div className='feature'>
            <span className='feature-icon'>💫</span>
            <span>Spiritual Connection</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .coming-soon-container {
          width: 100%;
          min-height: 100vh;
          background: linear-gradient(
            135deg,
            #000000 0%,
            #1a1a1a 50%,
            #000000 100%
          );
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            sans-serif;
        }

        .stars-canvas {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
        }

        .content {
          position: relative;
          z-index: 2;
          text-align: center;
          max-width: 600px;
          padding: 2rem;
          color: white;
        }

        .logo {
          position: relative;
          margin-bottom: 2rem;
        }

        .orb {
          width: 80px;
          height: 80px;
          background: radial-gradient(
            circle,
            rgba(255, 255, 255, 0.8) 0%,
            rgba(255, 255, 255, 0.3) 50%,
            transparent 100%
          );
          border-radius: 50%;
          margin: 0 auto;
          position: relative;
          animation: pulse 3s ease-in-out infinite;
        }

        .orb-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 120px;
          height: 120px;
          background: radial-gradient(
            circle,
            rgba(255, 255, 255, 0.1) 0%,
            transparent 70%
          );
          border-radius: 50%;
          animation: glow 4s ease-in-out infinite;
        }

        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.1);
            opacity: 1;
          }
        }

        @keyframes glow {
          0%,
          100% {
            opacity: 0.3;
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            opacity: 0.6;
            transform: translate(-50%, -50%) scale(1.2);
          }
        }

        .title {
          font-size: 3.5rem;
          font-weight: 700;
          letter-spacing: -0.03em;
          margin-bottom: 1rem;
          text-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
          background: linear-gradient(45deg, #ffffff, #f0f0f0);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .coming-soon-text {
          margin-bottom: 2rem;
        }

        .coming-soon-text h2 {
          font-size: 2rem;
          font-weight: 300;
          margin-bottom: 0.5rem;
          color: #f0f0f0;
        }

        .subtitle {
          font-size: 1.1rem;
          color: #ccc;
          font-style: italic;
        }

        .description {
          margin-bottom: 3rem;
          line-height: 1.6;
        }

        .description p {
          font-size: 1.1rem;
          color: #ddd;
          max-width: 500px;
          margin: 0 auto;
        }

        .features {
          display: flex;
          justify-content: center;
          gap: 2rem;
          margin-bottom: 3rem;
          flex-wrap: wrap;
        }

        .feature {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          color: #ccc;
        }

        .feature-icon {
          font-size: 1.5rem;
        }

        .notify-section {
          margin-top: 2rem;
        }

        .notify-section p {
          margin-bottom: 1rem;
          color: #ddd;
          font-size: 1rem;
        }

        .notify-form {
          display: flex;
          gap: 0.5rem;
          max-width: 400px;
          margin: 0 auto;
          flex-wrap: wrap;
          justify-content: center;
        }

        .email-input {
          flex: 1;
          min-width: 250px;
          padding: 0.75rem 1rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.05);
          color: white;
          font-size: 1rem;
          backdrop-filter: blur(10px);
        }

        .email-input::placeholder {
          color: rgba(255, 255, 255, 0.6);
        }

        .email-input:focus {
          outline: none;
          border-color: rgba(255, 255, 255, 0.5);
          box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1);
        }

        .notify-btn {
          padding: 0.75rem 1.5rem;
          background: linear-gradient(
            45deg,
            rgba(255, 255, 255, 0.1),
            rgba(255, 255, 255, 0.05)
          );
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          color: white;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .notify-btn:hover {
          background: linear-gradient(
            45deg,
            rgba(255, 255, 255, 0.2),
            rgba(255, 255, 255, 0.1)
          );
          border-color: rgba(255, 255, 255, 0.4);
          transform: translateY(-1px);
        }

        @media (max-width: 768px) {
          .title {
            font-size: 2.5rem;
          }

          .coming-soon-text h2 {
            font-size: 1.5rem;
          }

          .features {
            gap: 1rem;
          }

          .notify-form {
            flex-direction: column;
            align-items: center;
          }

          .email-input {
            min-width: 280px;
          }
        }
      `}</style>
    </div>
  )
}
