import { sessionRepository } from "@/domain/repositories/SessionRepository";
import type { Session } from "@/domain/entities/Session";

export const createSession = async (
  userId: string,
  title: string
): Promise<Session> => {
  return await sessionRepository.create({
    userId,
    title: title || "New Session",
  });
};
