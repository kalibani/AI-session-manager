"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto">
                <AlertCircle className="h-16 w-16 text-destructive" />
              </div>
              <CardTitle className="text-2xl">Something went wrong!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center text-muted-foreground">
                We&apos;re sorry, but something unexpected happened. Our team
                has been notified and we&apos;re working on it.
              </p>
              {error.digest && (
                <p className="text-xs text-center text-muted-foreground font-mono">
                  Error ID: {error.digest}
                </p>
              )}
              <div className="space-y-2">
                <Button onClick={() => reset()} className="w-full">
                  Try again
                </Button>
                <Button
                  onClick={() => (window.location.href = "/")}
                  variant="outline"
                  className="w-full"
                >
                  Go to homepage
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </body>
    </html>
  );
}
