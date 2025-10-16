import { supabase } from "@/services/db";
import type { Message, CreateMessageInput } from "@/domain/entities/Message";
import { logError, ErrorCategory } from "@/services/sentry";

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

      return (data || []).map((msg) => ({
        id: msg.id,
        sessionId: msg.session_id,
        role: msg.role,
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

      const { data, error } = await supabase
        .from("messages")
        .insert({
          session_id: input.sessionId,
          role: input.role,
          content: input.content,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        sessionId: data.session_id,
        role: data.role,
        content: data.content,
        createdAt: data.created_at,
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
