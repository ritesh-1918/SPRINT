"use client" // Error boundaries must be Client Components
 
import { useEffect } from 'react'
 
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])
 
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-950 p-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">Something went wrong!</h2>
        <p className="mt-2 text-gray-700 dark:text-gray-300">We apologize for the inconvenience. Please try again.</p>
        <button
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          onClick={
            // Attempt to recover by trying to re-render the segment
            () => reset()
          }
        >
          Try again
        </button>
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Error details: {error.message}</p>
      </div>
    </div>
  )
}