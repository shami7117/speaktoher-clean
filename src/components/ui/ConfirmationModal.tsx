import React from "react"

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText: string
  cancelText: string
  type?: "warning" | "info"
  isLoading?: boolean
  loadingText?: string
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  type = "info",
  isLoading = false,
  loadingText = "Processing...",
}: ConfirmationModalProps) {
  if (!isOpen) return null

  const handleConfirm = () => {
    if (!isLoading) {
      onConfirm()
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose()
    }
  }

  return (
    <div
      className='fixed inset-0 backdrop-blur-sm flex items-center justify-center z-[9999999] p-4'
      onClick={handleBackdropClick}>
      <div
        style={{
          padding: "20px",
          marginLeft: "auto",
          marginRight: "auto",
        }}
        className='bg-white/80 backdrop-blur-md border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl'>
        <div className='text-center'>
          {/* Title */}
          <h3 className='text-xl font-bold text-black mb-3'>{title}</h3>

          {/* Message */}
          <p className='text-black text-sm leading-relaxed mb-6'>{message}</p>

          {/* Buttons */}
          <div
            style={{
              marginTop: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}>
            <button
              style={{
                border: "none",
                color: "red",
              }}
              onClick={onClose}
              disabled={isLoading}
              className='flex-1 bg-transparent text-white py-3 px-6 rounded-xl font-medium hover:bg-white/10 hover:border-white/50 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed'>
              {cancelText}
            </button>
            <button
              style={{
                border: "none",
                backgroundColor: "white",
                color: "black",
              }}
              onClick={handleConfirm}
              disabled={isLoading}
              className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                isLoading
                  ? "bg-gray-600 text-gray-300"
                  : "bg-white text-black hover:bg-gray-100"
              }`}>
              {isLoading ? (
                <span className='flex items-center justify-center'>
                  <svg
                    className='animate-spin -ml-1 mr-3 h-5 w-5 text-gray-300'
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
                  {loadingText}
                </span>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
