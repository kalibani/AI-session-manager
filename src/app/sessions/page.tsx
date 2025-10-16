"use client";

import { SessionList } from "@/components/SessionList";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function SessionsPage() {
  const { user, signOut } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {user && (
            <p className="text-sm text-muted-foreground">
              Signed in as <strong>{user.email}</strong>
            </p>
          )}
        </div>
        <Button variant="outline" onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
      <SessionList />
    </div>
  );
}
