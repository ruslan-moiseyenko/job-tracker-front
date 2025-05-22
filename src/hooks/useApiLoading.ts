import { useState, useCallback } from "react";
import { useLoadingContext } from "@/components/ui/LoadingContext";

interface UseApiLoadingOptions {
  useGlobalLoader?: boolean;
  initialMessage?: string;
  successMessage?: string;
  errorMessage?: string;
  showSuccessState?: boolean;
  successStateDuration?: number;
}

interface UseApiLoadingReturn<T> {
  loading: boolean;
  error: Error | null;
  data: T | null;
  execute: <A extends any[]>(
    apiCall: (...args: A) => Promise<T>,
    ...args: A
  ) => Promise<T | null>;
  reset: () => void;
}

/**
 * Hook for managing API loading states, with optional global loading overlay
 * @param options Configuration options for the API loading behavior
 */
export function useApiLoading<T = any>(
  options?: UseApiLoadingOptions
): UseApiLoadingReturn<T> {
  const {
    useGlobalLoader = false,
    initialMessage = "Loading...",
    successMessage = "Success!",
    errorMessage = "An error occurred",
    showSuccessState = false,
    successStateDuration = 1000
  } = options || {};

  const { showLoading, hideLoading, updateMessage } = useLoadingContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>(null);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  const execute = useCallback(
    async <A extends any[]>(
      apiCall: (...args: A) => Promise<T>,
      ...args: A
    ): Promise<T | null> => {
      // Reset state before starting
      setLoading(true);
      setError(null);

      if (useGlobalLoader) {
        showLoading(initialMessage);
      }

      try {
        const result = await apiCall(...args);
        setData(result);

        if (useGlobalLoader && showSuccessState) {
          updateMessage(successMessage);
          await new Promise((resolve) =>
            setTimeout(resolve, successStateDuration)
          );
        }

        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);

        if (useGlobalLoader) {
          updateMessage(errorMessage);
          // Show error briefly before hiding
          await new Promise((resolve) => setTimeout(resolve, 1500));
        }

        return null;
      } finally {
        setLoading(false);
        if (useGlobalLoader) {
          hideLoading();
        }
      }
    },
    [
      useGlobalLoader,
      showLoading,
      hideLoading,
      updateMessage,
      initialMessage,
      successMessage,
      errorMessage,
      showSuccessState,
      successStateDuration
    ]
  );

  return { loading, error, data, execute, reset };
}
