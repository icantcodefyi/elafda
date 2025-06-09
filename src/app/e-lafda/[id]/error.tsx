"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Post page error:", error);
  }, [error]);

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-6">
        <div className="mx-auto max-w-2xl">
          <Card className="border-destructive/20 bg-destructive/5">
            <CardHeader className="text-center">
              <div className="bg-destructive/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
                <AlertTriangle className="text-destructive h-6 w-6" />
              </div>
              <h1 className="text-foreground text-2xl font-bold">
                Something went wrong!
              </h1>
              <p className="text-muted-foreground">
                We encountered an error while loading this post. This might be a
                temporary issue.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button
                  onClick={reset}
                  variant="default"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try again
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Link href="/">
                    <Home className="h-4 w-4" />
                    Back to Home
                  </Link>
                </Button>
              </div>

              {process.env.NODE_ENV === "development" && error.message && (
                <details className="bg-muted mt-4 rounded-md p-4">
                  <summary className="cursor-pointer text-sm font-medium">
                    Error Details (Development Only)
                  </summary>
                  <pre className="text-muted-foreground mt-2 overflow-auto text-xs">
                    {error.message}
                  </pre>
                  {error.digest && (
                    <p className="text-muted-foreground mt-2 text-xs">
                      Error ID: {error.digest}
                    </p>
                  )}
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
