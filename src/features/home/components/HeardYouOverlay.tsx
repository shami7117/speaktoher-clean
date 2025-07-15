"use client"

interface HeardYouOverlayProps {
  isVisible: boolean
  loadingDots: string
}

export default function HeardYouOverlay({
  isVisible,
  loadingDots,
}: HeardYouOverlayProps) {
  return (
    <div id='heardYou' className={isVisible ? "visible" : ""}>
      <div
        id='loadingDots'
        className='flex flex-col items-center justify-center'>
        <h2 className='uppercase'>She Heard You</h2>
      </div>
    </div>
  )
}
