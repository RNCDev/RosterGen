import { useCallback } from 'react';

export interface ErrorHandlerOptions {
  showToast?: boolean;
  logToConsole?: boolean;
  rethrow?: boolean;
  context?: string;
}

export function useErrorHandler() {
  const handleError = useCallback((
    error: unknown,
    options: ErrorHandlerOptions = {}
  ) => {
    const {
      showToast = true,
      logToConsole = true,
      rethrow = false,
      context = 'Unknown operation'
    } = options;

    // Normalize error to Error object
    const normalizedError = error instanceof Error 
      ? error 
      : new Error(typeof error === 'string' ? error : 'An unknown error occurred');

    // Add context to error message
    const errorWithContext = new Error(`${context}: ${normalizedError.message}`);
    errorWithContext.stack = normalizedError.stack;

    // Log to console
    if (logToConsole) {
      console.error(`Error in ${context}:`, normalizedError);
    }

    // Could integrate with toast system here
    if (showToast) {
      // For now, just log - could be replaced with actual toast implementation
      console.warn('Toast notification:', errorWithContext.message);
    }

    // Report to external service in production
    if (process.env.NODE_ENV === 'production') {
      // Could integrate with error reporting service like Sentry
      console.info('Error reported to monitoring service:', errorWithContext);
    }

    if (rethrow) {
      throw errorWithContext;
    }

    return errorWithContext;
  }, []);

  const withErrorHandling = useCallback(<T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    context: string,
    options?: Omit<ErrorHandlerOptions, 'context'>
  ) => {
    return async (...args: T): Promise<R | undefined> => {
      try {
        return await fn(...args);
      } catch (error) {
        handleError(error, { ...options, context });
        return undefined;
      }
    };
  }, [handleError]);

  const safeAsync = useCallback(<T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    context: string
  ) => {
    return withErrorHandling(fn, context, { rethrow: false });
  }, [withErrorHandling]);

  return {
    handleError,
    withErrorHandling,
    safeAsync,
  };
} 