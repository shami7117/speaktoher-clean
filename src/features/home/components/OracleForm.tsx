"use client"

import { LoadingSpinner } from "@/components/ui/LoadingSpinner"

interface OracleFormProps {
  inputValue: string
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onReceive: () => void
  onKeyDown: (e: React.KeyboardEvent) => void
  isLoading: boolean
}

export default function OracleForm({
  inputValue,
  onInputChange,
  onReceive,
  onKeyDown,
  isLoading,
}: OracleFormProps) {
  return (
    <>
      <h1 id='title'>Speak to Her</h1>

      <form id='oracleForm'>
        <input
          autoFocus
          disabled={isLoading}
          autoComplete='off'
          id='oracleInput'
          placeholder='Type here'
          required
          type='text'
          value={inputValue}
          onChange={onInputChange}
          onKeyDown={onKeyDown}
        />

        <button
          className='unlock-btn transition duration-300 ease-in-out'
          style={{
            opacity: inputValue.length === 0 || isLoading ? 0.01 : 1,
            cursor:
              inputValue.length === 0 || isLoading ? "not-allowed" : "pointer",
          }}
          disabled={inputValue.length === 0 || isLoading}
          id='receiveBtn'
          type='button'
          onClick={onReceive}>
          Receive Her Words ✨
        </button>

        {isLoading && (
          <span className='text-sm text-gray-500'>Please wait...</span>
        )}
      </form>
    </>
  )
}
