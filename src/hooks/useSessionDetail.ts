"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { getSessionDetail } from "@/domain/usecases/getSessionDetail";
import { messageRepository } from "@/domain/repositories/MessageRepository";
import type { Message } from "@/types";
import type { SessionDetail } from "@/domain/usecases/getSessionDetail";
import { useAuth } from "./useAuth";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";

export const useSessionDetail = (sessionId: string) => {
  // ============================================
  // 1. ALL useState HOOKS FIRST
  // ============================================
  const { user } = useAuth();
  const userRef = useRef<User | null>(null);
  const [detail, setDetail] = useState<SessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shouldRefetch, setShouldRefetch] = useState(0);

  // Keep userRef in sync with user
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // ============================================
  // 2. useChat HOOK
  // ============================================
  const {
    messages: chatMessages,
    sendMessage: chatSendMessage,
    status,
    setMessages: setChatMessages,
  } = useChat({
    id: sessionId, // Use sessionId as the chat ID for persistence
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: {
        sessionId,
      },
    }),
    onFinish: async ({ message }) => {
      try {
        console.log("🎉 Streaming finished, saving to DB");
        console.log("📋 Message details:", {
          role: message.role,
          partsCount: message.parts?.length,
          hasUser: !!userRef.current,
          userId: userRef.current?.id,
          sessionId,
        });

        if (!userRef.current) {
          console.error("❌ No user available for saving");
          return;
        }

        if (message.role !== "assistant") {
          console.log("ℹ️ Skipping save - message role is:", message.role);
          return;
        }

        console.log("🔍 Extracting content from message parts...");
        const content = message.parts
          .filter((part: any) => part.type === "text")
          .map((part: any) => part.text)
          .join("");

        console.log("💾 Content extracted:", {
          length: content.length,
          preview: content.substring(0, 100),
        });

        if (!content || content.trim().length === 0) {
          console.error("❌ No content to save!");
          return;
        }

        console.log("💾 Calling messageRepository.create...");
        const savedMessage = await messageRepository.create(
          {
            sessionId,
            role: "assistant",
            content,
          },
          userRef.current.id
        );

        console.log("✅ AI message saved with ID:", savedMessage.id);
        console.log("🔄 Triggering refetch...");
        setShouldRefetch((prev) => prev + 1);
      } catch (error) {
        console.error("❌ CRITICAL: onFinish callback error:", error);
        toast.error("Failed to save message");
      }
    },
    onError: () => {
      console.error("❌ Chat error");
      toast.error("Failed to get AI response");
    },
  });

  // ============================================
  // 3. useCallback HOOKS
  // ============================================
  const fetchDetail = useCallback(async () => {
    if (!user || !sessionId) {
      console.log("⚠️ No user or sessionId");
      setLoading(false);
      return [];
    }

    try {
      setLoading(true);
      setError(null);
      console.log("🔍 Fetching session details for:", sessionId);
      const data = await getSessionDetail(sessionId, user.id);
      setDetail(data);

      if (!data) {
        console.log("⚠️ No data returned from getSessionDetail");
        setLoading(false);
        return [];
      }

      console.log("📨 Loaded", data.messages.length, "messages from DB");

      const formattedMessages = data.messages
        .filter((msg) => msg.content && msg.content.trim().length > 0)
        .map((msg) => ({
          id: msg.id,
          role: msg.role as "user" | "assistant",
          parts: [
            {
              type: "text" as const,
              text: msg.content,
            },
          ],
        }));

      console.log(
        "✅ Formatted",
        formattedMessages.length,
        "messages for display"
      );
      setLoading(false);
      return formattedMessages;
    } catch (err) {
      const error = err as Error;
      console.error("❌ Error fetching session detail:", error);
      setError(error.message);
      toast.error("Failed to load session");
      setLoading(false);
      return [];
    }
  }, [user, sessionId]);

  const sendMessage = useCallback(
    async (content: string) => {
      console.log("📤 sendMessage called with:", content.substring(0, 50));

      if (!user || !sessionId || status === "streaming") {
        console.log("⚠️ Cannot send - status:", {
          user: !!user,
          sessionId,
          status,
        });
        return;
      }

      try {
        console.log("💾 Saving user message to DB...");
        const userMessage = await messageRepository.create(
          {
            sessionId,
            role: "user",
            content,
          },
          user.id
        );
        console.log("✅ User message saved with ID:", userMessage.id);

        console.log("🚀 Triggering AI chat...");
        chatSendMessage({
          role: "user",
          parts: [
            {
              type: "text",
              text: content,
            },
          ],
        } as any);
      } catch (error) {
        console.error("❌ Failed to send message:", error);
        toast.error("Failed to send message");
        setShouldRefetch((prev) => prev + 1);
      }
    },
    [user, sessionId, status, chatSendMessage]
  );

  const refreshDetail = useCallback(async () => {
    const messages = await fetchDetail();
    if (messages && messages.length > 0) {
      setChatMessages(messages as any);
    }
  }, [fetchDetail, setChatMessages]);

  // ============================================
  // 4. useEffect HOOKS
  // ============================================
  // Load messages ONLY when we have both user and sessionId
  useEffect(() => {
    if (!user || !sessionId) {
      console.log("⚠️ Waiting for user and sessionId...", {
        hasUser: !!user,
        sessionId,
      });
      // DON'T clear messages - just wait for auth to load
      return;
    }

    const loadMessages = async () => {
      console.log("🔄 Initial load triggered for session:", sessionId);
      const messages = await fetchDetail();
      console.log("📦 Received messages:", messages.length);

      // ALWAYS set the messages, even if empty array
      console.log("💾 Setting", messages.length, "messages to chat state");
      setChatMessages(messages as any);
    };

    loadMessages();
    // Only re-run when sessionId or userId actually changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, user?.id]);

  // Refetch when AI message is saved
  useEffect(() => {
    if (shouldRefetch > 0) {
      console.log("🔄 Refetch triggered (count:", shouldRefetch, ")");
      const loadMessages = async () => {
        console.log("🔄 Fetching updated messages from DB...");
        const messages = await fetchDetail();
        console.log("📦 Refetch result:", messages.length, "messages");

        if (messages && messages.length > 0) {
          console.log("💾 Re-setting", messages.length, "messages after save");
          setChatMessages(messages as any);
        } else {
          console.log("⚠️ No messages returned on refetch");
        }
      };
      loadMessages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldRefetch]);

  // Log when chatMessages changes
  useEffect(() => {
    console.log("📺 Chat messages updated:", chatMessages.length, "messages");
  }, [chatMessages.length]);

  // ============================================
  // 5. RETURN VALUES
  // ============================================
  const displayMessages = chatMessages.map((msg) => ({
    id: msg.id,
    sessionId,
    role: msg.role as "user" | "assistant",
    content: msg.parts
      .filter((part: any) => part.type === "text")
      .map((part: any) => part.text)
      .join(""),
    createdAt: new Date().toISOString(),
  }));

  return {
    session: detail?.session,
    messages: displayMessages,
    loading,
    error,
    sending: status === "streaming" || status === "submitted",
    streamingMessage: "",
    sendMessage,
    refreshDetail,
  };
};
