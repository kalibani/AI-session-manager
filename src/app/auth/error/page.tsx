"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  return (
    <div className="flex items-center justify-center min-h-[600px]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <CardTitle>Authentication Error</CardTitle>
          </div>
          <CardDescription>
            {errorDescription || "An error occurred during authentication"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error === "otp_expired" && (
            <p className="text-sm text-muted-foreground">
              Your magic link has expired. Please request a new one.
            </p>
          )}
          {error === "access_denied" && (
            <p className="text-sm text-muted-foreground">
              Access was denied. Please try signing in again.
            </p>
          )}
          <Link href="/" className="block">
            <Button className="w-full">Back to Login</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[600px]">
          Loading...
        </div>
      }
    >
      <AuthErrorContent />
    </Suspense>
  );
}
