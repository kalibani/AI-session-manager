'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSessions } from '@/domain/usecases/getSessions';
import { createSession as createSessionUseCase } from '@/domain/usecases/createSession';
import type { SessionWithLastMessage } from '@/types';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export const useSessions = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<SessionWithLastMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getSessions(user.id);
      setSessions(data);
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      toast.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const createSession = async (title: string) => {
    if (!user) return;

    try {
      const newSession = await createSessionUseCase(user.id, title);
      
      // Optimistic update
      setSessions((prev) => [
        {
          ...newSession,
          lastMessage: undefined,
          lastMessageAt: undefined,
        },
        ...prev,
      ]);

      toast.success('Session created');
      return newSession;
    } catch (err) {
      const error = err as Error;
      toast.error('Failed to create session');
      throw error;
    }
  };

  const refreshSessions = () => {
    fetchSessions();
  };

  return {
    sessions,
    loading,
    error,
    createSession,
    refreshSessions,
  };
};




