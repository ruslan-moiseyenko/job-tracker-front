import { useCallback, useState } from 'react';

interface UseLoadingReturn {
  isLoading: boolean;
  message: string;
  startLoading: (message?: string) => void;
  stopLoading: () => void;
  updateMessage: (message: string) => void;
}

/**
 * Hook for managing loading state with messages
 */
export function useLoading(initialMessage = 'Loading...'): UseLoadingReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(initialMessage);

  const startLoading = useCallback((newMessage?: string) => {
    if (newMessage) {
      setMessage(newMessage);
    }
    setIsLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  const updateMessage = useCallback((newMessage: string) => {
    setMessage(newMessage);
  }, []);

  return {
    isLoading,
    message,
    startLoading,
    stopLoading,
    updateMessage
  };
}
