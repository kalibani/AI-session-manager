import { sessionRepository } from "@/domain/repositories/SessionRepository";
import { messageRepository } from "@/domain/repositories/MessageRepository";
import type { Session } from "@/domain/entities/Session";
import type { Message } from "@/domain/entities/Message";

export interface SessionDetail {
  session: Session;
  messages: Message[];
}

export const getSessionDetail = async (
  sessionId: string,
  userId: string
): Promise<SessionDetail | null> => {
  const session = await sessionRepository.getById(sessionId, userId);

  if (!session) {
    return null;
  }

  const messages = await messageRepository.getBySessionId(sessionId, userId);

  return {
    session,
    messages,
  };
};
