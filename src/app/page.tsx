"use client";

import { useAuth } from "@/hooks/useAuth";
import { AuthForm } from "@/components/AuthForm";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      router.push("/sessions");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (user) {
    return null; // Will redirect
  }

  return (
    <div
      className="flex items-center justify-center -mx-4 -my-8 py-8 bg-gradient-to-br from-background via-background to-muted/20"
      style={{ minHeight: "calc(100vh - 73px - 73px)" }}
    >
      <AuthForm />
    </div>
  );
}
