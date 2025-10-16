"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { getSessionDetail } from "@/domain/usecases/getSessionDetail";
import { messageRepository } from "@/domain/repositories/MessageRepository";
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
        if (!userRef.current) {
          return;
        }

        if (message.role !== "assistant") {
          return;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const content = message.parts
          .filter((part: any) => part.type === "text")
          .map((part: any) => part.text)
          .join("");

        if (!content || content.trim().length === 0) {
          return;
        }

        await messageRepository.create(
          {
            sessionId,
            role: "assistant",
            content,
          },
          userRef.current.id
        );
      } catch {
        toast.error("Failed to save message");
      }
    },
    onError: () => {
      toast.error("Failed to get AI response");
    },
  });

  // ============================================
  // 3. useCallback HOOKS
  // ============================================
  const fetchDetail = useCallback(async () => {
    if (!user || !sessionId) {
      setLoading(false);
      return [];
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getSessionDetail(sessionId, user.id);
      setDetail(data);

      if (!data) {
        setLoading(false);
        return [];
      }

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

      setLoading(false);
      return formattedMessages;
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      toast.error("Failed to load session");
      setLoading(false);
      return [];
    }
  }, [user, sessionId]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!user || !sessionId || status === "streaming") {
        return;
      }

      try {
        await messageRepository.create(
          {
            sessionId,
            role: "user",
            content,
          },
          user.id
        );
        chatSendMessage({
          role: "user",
          parts: [
            {
              type: "text",
              text: content,
            },
          ],
        });
      } catch {
        toast.error("Failed to send message");
      }
    },
    [user, sessionId, status, chatSendMessage]
  );

  const refreshDetail = useCallback(async () => {
    const messages = await fetchDetail();
    if (messages && messages.length > 0) {
      setChatMessages(messages);
    }
  }, [fetchDetail, setChatMessages]);

  // ============================================
  // 4. useEffect HOOKS
  // ============================================
  // Load messages ONLY when we have both user and sessionId
  useEffect(() => {
    if (!user || !sessionId) {
      return;
    }

    const loadMessages = async () => {
      const messages = await fetchDetail();
      setChatMessages(messages);
    };

    loadMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, user?.id]);

  // ============================================
  // 5. RETURN VALUES
  // ============================================
  const displayMessages = chatMessages.map((msg) => ({
    id: msg.id,
    sessionId,
    role: msg.role as "user" | "assistant",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
