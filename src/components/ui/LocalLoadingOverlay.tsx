import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';

export type LoadingVariant = 'spinner' | 'dots' | 'pulse';

type OverlayBackgroundVariant =
  | 'bg-black/50'
  | 'bg-white/80'
  | 'bg-background/60';

interface LocalLoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  variant?: LoadingVariant;
  overlayClassName?: OverlayBackgroundVariant | string;
  contentClassName?: string;
  delay?: number;
}

/**
 * A loading overlay that positions itself relative to its parent container.
 * Unlike LoadingOverlay, this doesn't use a portal and covers only the parent element.
 *
 * Usage:
 * 1. Make sure the parent has `position: relative`
 * 2. Place this component at the end of your JSX within the parent
 * 3. Pass the loading state
 */
export function LocalLoadingOverlay({
  isLoading,
  message = 'Loading...',
  variant = 'spinner',
  overlayClassName,
  contentClassName,
  delay = 200
}: LocalLoadingOverlayProps) {
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    let timeoutId: number | undefined;

    if (isLoading) {
      timeoutId = window.setTimeout(() => {
        setShowLoader(true);
      }, delay);
    } else {
      setShowLoader(false);
    }

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [isLoading, delay]);

  if (!showLoader) return null;

  return (
    <div
      className={cn(
        'absolute inset-0 z-50',
        // Semi-transparent background with backdrop blur
        'bg-background/60 backdrop-blur-[2px]',
        // Flexbox centering
        'flex items-center justify-center',
        // Smooth transitions
        'animate-in fade-in-0 duration-200',
        overlayClassName
      )}
    >
      <div
        className={cn(
          'flex flex-col items-center gap-3 p-4 rounded-lg',
          // Card-like appearance with subtle shadow
          'bg-card/90 backdrop-blur-sm border shadow-lg',
          // Animation
          'animate-in zoom-in-95 fade-in-0 duration-300',
          contentClassName
        )}
      >
        {/* Loading indicator based on variant */}
        {variant === 'spinner' && (
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-primary border-t-transparent" />
        )}

        {variant === 'dots' && (
          <div className="flex space-x-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
            <div className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
            <div className="h-2 w-2 rounded-full bg-primary animate-bounce" />
          </div>
        )}

        {variant === 'pulse' && (
          <div className="h-8 w-8 rounded-full bg-primary/30 relative flex items-center justify-center">
            <div className="h-8 w-8 rounded-full bg-primary/70 animate-ping absolute" />
            <div className="h-4 w-4 rounded-full bg-primary" />
          </div>
        )}

        {message && (
          <p className="text-sm font-medium text-foreground text-center">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
