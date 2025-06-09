"use client"; // Error boundaries must be Client Components

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({ error }: { error: Error }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    // global-error must include html and body tags
    <html>
      <body>
        <div className="bg-background flex min-h-screen items-center justify-center p-4">
          <div className="w-full max-w-md space-y-6 text-center">
            <div className="space-y-2">
              <h1 className="text-foreground text-2xl font-bold">
                Something went wrong!
              </h1>
              <p className="text-muted-foreground">
                We encountered an unexpected error. Please try refreshing the
                page.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => (window.location.href = "/")}
                className="border-border hover:bg-muted w-full rounded-md border px-4 py-2 transition-colors"
              >
                Go to Home
              </button>
            </div>

            {process.env.NODE_ENV === "development" && error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm font-medium">
                  Error Details (Development Only)
                </summary>
                <pre className="text-muted-foreground bg-muted mt-2 overflow-auto rounded p-2 text-xs">
                  {JSON.stringify(error)}
                </pre>
              </details>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
