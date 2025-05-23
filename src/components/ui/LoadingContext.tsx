import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useState
} from 'react';

import type { LoadingVariant } from './LoadingOverlay';
import { LoadingOverlay } from './LoadingOverlay';

interface LoadingContextType {
  showLoading: (message?: string, variant?: LoadingVariant) => void;
  hideLoading: () => void;
  updateMessage: (message: string) => void;
  updateVariant: (variant: LoadingVariant) => void;
  isLoading: boolean;
  currentMessage: string;
  currentVariant: LoadingVariant;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

interface LoadingProviderProps {
  children: ReactNode;
  defaultVariant?: LoadingVariant;
  defaultMessage?: string;
}

export function LoadingProvider({
  children,
  defaultVariant = 'spinner',
  defaultMessage = 'Loading...'
}: LoadingProviderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(defaultMessage);
  const [variant, setVariant] = useState<LoadingVariant>(defaultVariant);

  const showLoading = useCallback(
    (newMessage?: string, newVariant?: LoadingVariant) => {
      if (newMessage) {
        setMessage(newMessage);
      }
      if (newVariant) {
        setVariant(newVariant);
      }
      setIsLoading(true);
    },
    []
  );

  const hideLoading = useCallback(() => {
    setIsLoading(false);
    // Reset to defaults when hiding
    setTimeout(() => {
      setMessage(defaultMessage);
      setVariant(defaultVariant);
    }, 300); // Small delay to ensure animation completes first
  }, [defaultMessage, defaultVariant]);

  const updateMessage = useCallback((newMessage: string) => {
    setMessage(newMessage);
  }, []);

  const updateVariant = useCallback((newVariant: LoadingVariant) => {
    setVariant(newVariant);
  }, []);

  return (
    <LoadingContext.Provider
      value={{
        showLoading,
        hideLoading,
        updateMessage,
        updateVariant,
        isLoading,
        currentMessage: message,
        currentVariant: variant
      }}
    >
      {children}
      <LoadingOverlay
        isLoading={isLoading}
        message={message}
        variant={variant}
      />
    </LoadingContext.Provider>
  );
}

export function useLoadingContext() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoadingContext must be used within a LoadingProvider');
  }
  return context;
}
