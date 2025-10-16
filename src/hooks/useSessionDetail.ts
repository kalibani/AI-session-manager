"use client";

import { useState, useEffect, useCallback } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { getSessionDetail } from "@/domain/usecases/getSessionDetail";
import { messageRepository } from "@/domain/repositories/MessageRepository";
import type { Message } from "@/types";
import type { SessionDetail } from "@/domain/usecases/getSessionDetail";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export const useSessionDetail = (sessionId: string) => {
  const { user } = useAuth();
  const [detail, setDetail] = useState<SessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use the official useChat hook for streaming (AI SDK 5.0)
  // Reference: https://ai-sdk.dev/docs/reference/ai-sdk-ui/use-chat
  const {
    messages: chatMessages,
    sendMessage: chatSendMessage,
    status,
    setMessages: setChatMessages,
  } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: {
        sessionId,
      },
    }),
    onFinish: async ({ message }) => {
      // Save the AI response to Supabase when streaming completes
      console.log("🎉 Streaming finished, saving to DB");
      if (user && message.role === "assistant") {
        try {
          // Extract text from message parts
          const content = message.parts
            .filter((part: any) => part.type === "text")
            .map((part: any) => part.text)
            .join("");

          await messageRepository.create(
            {
              sessionId,
              role: "assistant",
              content,
            },
            user.id
          );
          // Refresh to get the saved message with proper ID
          await fetchDetail();
        } catch (error) {
          console.error("Failed to save AI message:", error);
        }
      }
    },
    onError: () => {
      console.error("❌ Chat error");
      toast.error("Failed to get AI response");
    },
  });

  const fetchDetail = useCallback(async () => {
    if (!user || !sessionId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getSessionDetail(sessionId, user.id);
      setDetail(data);

      if (!data) return;

      // Load existing messages into chat state (using UIMessage format with parts)
      // Filter out empty messages to avoid Gemini API errors
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
      setChatMessages(formattedMessages as any);
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      toast.error("Failed to load session");
    } finally {
      setLoading(false);
    }
  }, [user, sessionId, setChatMessages]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  // Custom send message that saves to DB before calling AI
  const sendMessage = async (content: string) => {
    if (!user || !sessionId || status === "streaming") return;

    try {
      // Store user message in DB first
      const userMessage = await messageRepository.create(
        {
          sessionId,
          role: "user",
          content,
        },
        user.id
      );

      // Create UIMessage and trigger AI streaming
      // Per AI SDK docs: sendMessage accepts CreateUIMessage | string
      // Reference: https://ai-sdk.dev/docs/reference/ai-sdk-ui/use-chat
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
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
      fetchDetail();
    }
  };

  return {
    session: detail?.session,
    messages: chatMessages.map((msg) => ({
      id: msg.id,
      sessionId,
      role: msg.role as "user" | "assistant",
      // Extract text content from UIMessage parts
      content: msg.parts
        .filter((part: any) => part.type === "text")
        .map((part: any) => part.text)
        .join(""),
      createdAt: new Date().toISOString(),
    })),
    loading,
    error,
    sending: status === "streaming" || status === "submitted",
    streamingMessage: "", // Not needed with useChat - streaming is handled automatically
    sendMessage,
    refreshDetail: fetchDetail,
  };
};
