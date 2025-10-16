import { supabase } from "@/services/db";
import type {
  Session,
  SessionWithLastMessage,
  CreateSessionInput,
  UpdateSessionInput,
} from "@/domain/entities/Session";
import { logError, ErrorCategory } from "@/services/sentry";
import type { Database } from "@/types/supabase";

type SessionRow = Database["public"]["Tables"]["sessions"]["Row"];
type MessageRow = Database["public"]["Tables"]["messages"]["Row"];

export class SessionRepository {
  async getAll(userId: string): Promise<SessionWithLastMessage[]> {
    try {
      const { data: sessions, error } = await supabase
        .from("sessions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (!sessions) return [];

      // Get last message for each session
      const sessionsWithMessages = await Promise.all(
        sessions.map(async (session: SessionRow) => {
          const { data: lastMessage } = await supabase
            .from("messages")
            .select("content, created_at")
            .eq("session_id", session.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          const msgData = lastMessage as Pick<
            MessageRow,
            "content" | "created_at"
          > | null;

          return {
            id: session.id,
            userId: session.user_id,
            title: session.title,
            createdAt: session.created_at,
            updatedAt: session.updated_at,
            lastMessage: msgData?.content,
            lastMessageAt: msgData?.created_at,
          };
        })
      );

      return sessionsWithMessages;
    } catch (error) {
      const err = error as Error;
      logError(err, {
        category: ErrorCategory.DATABASE,
        userId,
        additionalData: { operation: "getAll" },
      });
      throw err;
    }
  }

  async getById(id: string, userId: string): Promise<Session | null> {
    try {
      const { data, error } = await supabase
        .from("sessions")
        .select("*")
        .eq("id", id)
        .eq("user_id", userId)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null; // Not found
        throw error;
      }

      if (!data) return null;

      const sessionData = data as SessionRow;

      return {
        id: sessionData.id,
        userId: sessionData.user_id,
        title: sessionData.title,
        createdAt: sessionData.created_at,
        updatedAt: sessionData.updated_at,
      };
    } catch (error) {
      const err = error as Error;
      logError(err, {
        category: ErrorCategory.DATABASE,
        userId,
        additionalData: { operation: "getById", sessionId: id },
      });
      throw err;
    }
  }

  async create(input: CreateSessionInput): Promise<Session> {
    try {
      const insertData: Database["public"]["Tables"]["sessions"]["Insert"] = {
        user_id: input.userId,
        title: input.title,
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await supabase
        .from("sessions")
        .insert(insertData as any)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error("Failed to create session");

      const sessionData = data as SessionRow;

      return {
        id: sessionData.id,
        userId: sessionData.user_id,
        title: sessionData.title,
        createdAt: sessionData.created_at,
        updatedAt: sessionData.updated_at,
      };
    } catch (error) {
      const err = error as Error;
      logError(err, {
        category: ErrorCategory.DATABASE,
        userId: input.userId,
        additionalData: { operation: "create", title: input.title },
      });
      throw err;
    }
  }

  async update(input: UpdateSessionInput, userId: string): Promise<Session> {
    try {
      const updateData: Database["public"]["Tables"]["sessions"]["Update"] = {
        title: input.title,
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("sessions")
        .update(updateData)
        .eq("id", input.id)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error("Failed to update session");

      const sessionData = data as SessionRow;

      return {
        id: sessionData.id,
        userId: sessionData.user_id,
        title: sessionData.title,
        createdAt: sessionData.created_at,
        updatedAt: sessionData.updated_at,
      };
    } catch (error) {
      const err = error as Error;
      logError(err, {
        category: ErrorCategory.DATABASE,
        userId,
        additionalData: { operation: "update", sessionId: input.id },
      });
      throw err;
    }
  }

  async delete(id: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("sessions")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);

      if (error) throw error;
    } catch (error) {
      const err = error as Error;
      logError(err, {
        category: ErrorCategory.DATABASE,
        userId,
        additionalData: { operation: "delete", sessionId: id },
      });
      throw err;
    }
  }
}

export const sessionRepository = new SessionRepository();
