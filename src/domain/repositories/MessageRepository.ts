import { supabase } from "@/services/db";
import type { Message, CreateMessageInput } from "@/domain/entities/Message";
import type { Database } from "@/types/supabase";
import { logError, ErrorCategory } from "@/services/sentry";

type MessageRow = Database["public"]["Tables"]["messages"]["Row"];

export class MessageRepository {
  async getBySessionId(sessionId: string, userId: string): Promise<Message[]> {
    try {
      // First verify user has access to this session
      const { data: session } = await supabase
        .from("sessions")
        .select("id")
        .eq("id", sessionId)
        .eq("user_id", userId)
        .single();

      if (!session) {
        throw new Error("Session not found or access denied");
      }

      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      if (!data) return [];

      return data.map((msg: MessageRow) => ({
        id: msg.id,
        sessionId: msg.session_id,
        role: msg.role as "user" | "assistant",
        content: msg.content,
        createdAt: msg.created_at,
      }));
    } catch (error) {
      const err = error as Error;
      logError(err, {
        category: ErrorCategory.DATABASE,
        userId,
        additionalData: { operation: "getBySessionId", sessionId },
      });
      throw err;
    }
  }

  async create(input: CreateMessageInput, userId: string): Promise<Message> {
    try {
      // Verify user has access to this session
      const { data: session } = await supabase
        .from("sessions")
        .select("id")
        .eq("id", input.sessionId)
        .eq("user_id", userId)
        .single();

      if (!session) {
        throw new Error("Session not found or access denied");
      }

      const insertData: Database["public"]["Tables"]["messages"]["Insert"] = {
        session_id: input.sessionId,
        role: input.role,
        content: input.content,
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await supabase
        .from("messages")
        .insert(insertData as any)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error("Failed to create message");

      const messageData = data as MessageRow;

      return {
        id: messageData.id,
        sessionId: messageData.session_id,
        role: messageData.role as "user" | "assistant",
        content: messageData.content,
        createdAt: messageData.created_at,
      };
    } catch (error) {
      const err = error as Error;
      logError(err, {
        category: ErrorCategory.DATABASE,
        userId,
        additionalData: {
          operation: "create",
          sessionId: input.sessionId,
          role: input.role,
        },
      });
      throw err;
    }
  }

  async deleteBySessionId(sessionId: string, userId: string): Promise<void> {
    try {
      // Verify user has access to this session
      const { data: session } = await supabase
        .from("sessions")
        .select("id")
        .eq("id", sessionId)
        .eq("user_id", userId)
        .single();

      if (!session) {
        throw new Error("Session not found or access denied");
      }

      const { error } = await supabase
        .from("messages")
        .delete()
        .eq("session_id", sessionId);

      if (error) throw error;
    } catch (error) {
      const err = error as Error;
      logError(err, {
        category: ErrorCategory.DATABASE,
        userId,
        additionalData: { operation: "deleteBySessionId", sessionId },
      });
      throw err;
    }
  }
}

export const messageRepository = new MessageRepository();
