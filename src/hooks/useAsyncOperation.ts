import { useState, useCallback } from 'react';

export interface AsyncOperationState {
  loading: boolean;
  error: string | null;
  success: boolean;
  execute: <T>(operation: () => Promise<T>, successMessage?: string) => Promise<T | undefined>;
  reset: () => void;
  setError: (error: string | null) => void;
}

export function useAsyncOperation(defaultSuccessMessage?: string): AsyncOperationState {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const execute = useCallback(async <T>(
    operation: () => Promise<T>,
    successMessage?: string
  ): Promise<T | undefined> => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await operation();
      setSuccess(true);
      
      if (successMessage || defaultSuccessMessage) {
        // You could integrate with a toast system here
        console.log(successMessage || defaultSuccessMessage);
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      console.error('Async operation failed:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [defaultSuccessMessage]);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setSuccess(false);
  }, []);

  return {
    loading,
    error,
    success,
    execute,
    reset,
    setError,
  };
} 