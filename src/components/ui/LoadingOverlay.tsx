import { createPortal } from "react-dom";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export type LoadingVariant = "spinner" | "dots" | "pulse";

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  variant?: LoadingVariant;
  overlayClassName?: string;
  contentClassName?: string;
  fullScreen?: boolean;
}

export function LoadingOverlay({
  isLoading,
  message = "Loading...",
  variant = "spinner",
  overlayClassName,
  contentClassName,
  fullScreen = true
}: LoadingOverlayProps) {
  const [mounted, setMounted] = useState(false);
  // Add a small delay before showing the loader to prevent flash for quick operations
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    let timeoutId: number | undefined;

    if (isLoading) {
      timeoutId = window.setTimeout(() => {
        setShowLoader(true);
      }, 200); // Small delay to prevent flash
    } else {
      setShowLoader(false);
    }

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [isLoading]);

  if (!mounted || !showLoader) return null;

  return createPortal(
    <div
      className={cn(
        "fixed z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm transition-opacity duration-200",
        fullScreen ? "inset-0" : "inset-[1px]",
        overlayClassName
      )}
    >
      <div
        className={cn(
          "flex flex-col items-center gap-4 p-6 rounded-lg bg-card shadow-lg animate-in fade-in-50 duration-300",
          contentClassName
        )}
      >
        {/* Loading indicator based on variant */}
        {variant === "spinner" && (
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        )}
        {variant === "dots" && (
          <div className="flex space-x-2">
            <div className="h-3 w-3 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
            <div className="h-3 w-3 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
            <div className="h-3 w-3 rounded-full bg-primary animate-bounce" />
          </div>
        )}
        {variant === "pulse" && (
          <div className="h-12 w-12 rounded-full bg-primary/30 relative flex items-center justify-center">
            <div className="h-12 w-12 rounded-full bg-primary/70 animate-ping absolute" />
            <div className="h-6 w-6 rounded-full bg-primary" />
          </div>
        )}
        <p className="text-lg font-medium text-foreground">{message}</p>
      </div>
    </div>,
    document.body
  );
}
