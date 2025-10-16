"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSessions } from "@/hooks/useSessions";
import { Plus, MessageSquare, Loader2, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

export function SessionList() {
  const { sessions, loading, createSession, refreshSessions } = useSessions();
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [showNewForm, setShowNewForm] = useState(false);
  const router = useRouter();

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTitle.trim()) {
      toast.error("Please enter a session title");
      return;
    }

    try {
      setIsCreating(true);
      const session = await createSession(newTitle);
      setNewTitle("");
      setShowNewForm(false);

      if (session) {
        router.push(`/sessions/${session.id}`);
      }
    } catch {
      // Error already handled in hook
    } finally {
      setIsCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Sessions</h1>
          <p className="text-muted-foreground">
            Manage your AI conversation sessions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={refreshSessions}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={() => setShowNewForm(!showNewForm)}>
            <Plus className="mr-2 h-4 w-4" />
            New Session
          </Button>
        </div>
      </div>

      {showNewForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Session</CardTitle>
            <CardDescription>
              Give your session a descriptive title
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateSession} className="flex gap-2">
              <Input
                placeholder="e.g., Project Planning Chat"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                disabled={isCreating}
              />
              <Button type="submit" disabled={isCreating}>
                {isCreating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Create"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowNewForm(false);
                  setNewTitle("");
                }}
                disabled={isCreating}
              >
                Cancel
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {sessions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No sessions yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first session to start chatting with AI
            </p>
            <Button onClick={() => setShowNewForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Session
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sessions.map((session) => (
            <Link key={session.id} href={`/sessions/${session.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="truncate">{session.title}</CardTitle>
                  <CardDescription>
                    Created{" "}
                    {formatDistanceToNow(new Date(session.createdAt), {
                      addSuffix: true,
                    })}
                  </CardDescription>
                </CardHeader>
                {session.lastMessage && (
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {session.lastMessage}
                    </p>
                  </CardContent>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
