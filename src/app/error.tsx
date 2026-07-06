"use client" // Error components must be Client Components

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service if needed
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center animate-fade-in mt-16">
      <h2 className="text-[10px] font-sans tracking-[0.3em] uppercase text-red-500 font-bold mb-4">
        System Error
      </h2>
      <h1 className="text-4xl md:text-5xl font-serif tracking-tight text-stone-900 dark:text-stone-100 mb-6">
        Something went wrong.
      </h1>
      <p className="text-sm text-stone-500 max-w-md mb-8">
        An unexpected error occurred. You can try recovering the page below.
      </p>
      <button
        onClick={() => reset()}
        className="px-6 py-3 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-xl font-medium text-sm hover:scale-105 transition-transform"
      >
        Try again
      </button>
    </div>
  )
}
