"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Mail, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";

export function AuthForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    try {
      setLoading(true);
      await signIn(email);
      setSent(true);
      toast.success("Link sent! Check your email.");
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Failed to send link");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setLoading(true);
      await signIn(email);
      toast.success("Link resent! Check your email.");
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Failed to resend link");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setSent(false);
    setEmail("");
  };

  if (sent) {
    return (
      <Card className="w-full max-w-md border-2 shadow-lg">
        <CardHeader className="text-center space-y-4 pb-2">
          <div className="mx-auto">
            <div className="relative">
              <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full animate-pulse" />
              <CheckCircle2 className="h-16 w-16 text-green-500 relative" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl">Check your email</CardTitle>
            <CardDescription className="text-base pt-2">
              We sent a link to
            </CardDescription>
            <p className="font-semibold text-foreground pt-1">{email}</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="space-y-1 text-sm">
                <p className="font-medium">Click the link to sign in</p>
                <p className="text-muted-foreground">
                  The link will expire in 1 hour
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Button
              onClick={handleResend}
              variant="outline"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resending...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Resend link
                </>
              )}
            </Button>

            <Button
              onClick={handleBack}
              variant="ghost"
              className="w-full"
              disabled={loading}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Use different email
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Didn&apos;t receive the email? Check your spam folder
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md border-2 shadow-lg">
      <CardHeader className="text-center space-y-2">
        <CardTitle className="text-2xl">Sign in</CardTitle>
        <CardDescription className="text-base">
          Enter your email to receive a link
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
              className="h-11 text-base"
            />
          </div>
          <Button
            type="submit"
            className="w-full h-11 text-base"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Sending link...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-5 w-5" />
                Send link
              </>
            )}
          </Button>
          <p className="text-xs text-center text-muted-foreground pt-2">
            No password required. We&apos;ll email you a secure link.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
