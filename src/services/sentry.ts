import * as Sentry from '@sentry/nextjs';

export enum ErrorCategory {
  AUTH = 'auth',
  API = 'api',
  DATABASE = 'database',
  UNKNOWN = 'unknown',
}

export interface ErrorContext {
  category: ErrorCategory;
  userId?: string;
  additionalData?: Record<string, unknown>;
}

export const logError = (error: Error, context?: ErrorContext) => {
  // Only log to Sentry in production or if DSN is configured
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.captureException(error, {
      tags: {
        category: context?.category || ErrorCategory.UNKNOWN,
      },
      user: context?.userId ? { id: context.userId } : undefined,
      extra: context?.additionalData || {},
    });
  }

  // Always log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${context?.category || 'ERROR'}]`, error, context);
  }
};

export const logMessage = (message: string, level: 'info' | 'warning' | 'error' = 'info') => {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.captureMessage(message, level);
  }

  if (process.env.NODE_ENV === 'development') {
    console[level === 'error' ? 'error' : level === 'warning' ? 'warn' : 'log'](message);
  }
};

export const setUser = (userId: string, email?: string) => {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.setUser({ id: userId, email });
  }
};

export const clearUser = () => {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.setUser(null);
  }
};




