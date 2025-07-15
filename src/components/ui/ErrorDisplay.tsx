interface ErrorDisplayProps {
  error: string
  onRetry?: () => void
}

export function ErrorDisplay({ error, onRetry }: ErrorDisplayProps) {
  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
      <div className='text-center'>
        <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4'>
          {error}
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700'>
            Try Again
          </button>
        )}
      </div>
    </div>
  )
}
