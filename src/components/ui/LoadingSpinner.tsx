interface LoadingSpinnerProps {
  message?: string
}

export function LoadingSpinner({
  message = "Loading...",
}: LoadingSpinnerProps) {
  return (
    <div className='min-h-screen bg-transparent w-full flex items-center justify-center'>
      <div className='text-center'>
        <div
          style={{
            margin: "auto",
          }}
          className='animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4'></div>
        <p className='text-white'>{message}</p>
      </div>
    </div>
  )
}
