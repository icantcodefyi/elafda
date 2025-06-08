'use client' // Error boundaries must be Client Components

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error:', error)
  }, [error])

  return (
    // global-error must include html and body tags
    <html>
      <body>
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">
                Something went wrong!
              </h1>
              <p className="text-muted-foreground">
                We encountered an unexpected error. Please try refreshing the page.
              </p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={reset}
                className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Try again
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors"
              >
                Go to Home
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && error.message && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer font-medium text-sm">
                  Error Details (Development Only)
                </summary>
                <pre className="mt-2 text-xs text-muted-foreground overflow-auto p-2 bg-muted rounded">
                  {error.message}
                </pre>
                {error.digest && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Error ID: {error.digest}
                  </p>
                )}
              </details>
            )}
          </div>
        </div>
      </body>
    </html>
  )
} 