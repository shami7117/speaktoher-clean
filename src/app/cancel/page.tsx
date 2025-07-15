"use client"

import React from "react"
import Link from "next/link"

export default function CancelPage() {
  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full'>
        <div className='bg-white rounded-lg shadow-lg p-8 text-center'>
          {/* Cancel Icon */}
          <div className='mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-6'>
            <svg
              className='h-6 w-6 text-yellow-600'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
              />
            </svg>
          </div>

          {/* Cancel Message */}
          <h1 className='text-2xl font-bold text-gray-900 mb-4'>
            Payment Cancelled
          </h1>
          <p className='text-gray-600 mb-6'>
            Your payment was cancelled. No charges were made to your account.
          </p>

          {/* Action Buttons */}
          <div className='space-y-3'>
            <Link
              href='/checkout'
              className='w-full bg-purple-600 text-white py-3 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors block'>
              Try Again
            </Link>
            <Link
              href='/'
              className='w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors block'>
              Return Home
            </Link>
          </div>

          {/* Additional Info */}
          <div className='mt-8 pt-6 border-t border-gray-200'>
            <p className='text-xs text-gray-500'>
              If you're having trouble with the payment process, please contact
              our support team.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
