import { sessionRepository } from '@/domain/repositories/SessionRepository';
import type { SessionWithLastMessage } from '@/domain/entities/Session';

export const getSessions = async (userId: string): Promise<SessionWithLastMessage[]> => {
  return await sessionRepository.getAll(userId);
};




