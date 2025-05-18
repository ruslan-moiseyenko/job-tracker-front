import { logger } from "@/lib/logger";
import { useEffect, useRef, useCallback } from "react";

type TokenPayload = {
  accessToken: string;
  refreshToken: string;
};

export function useGoogleAuthPopup(
  onSuccess: (tokens: TokenPayload) => void,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onError?: (err: any) => void
) {
  const popupRef = useRef<Window | null>(null);
  const timerRef = useRef<number | null>(null);

  const openPopup = useCallback(() => {
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.innerWidth - width) / 2;
    const top = window.screenY + (window.innerHeight - height) / 2;
    const baseBackendUrl =
      import.meta.env.VITE_GRAPHQL_API_URL || "http://localhost:4000";
    const baseFrontUrl =
      import.meta.env.VITE_FRONTEND_URL || window.location.origin;
    const url = `${baseBackendUrl}/auth/google`;

    const popup = window.open(
      url,
      "_blank",
      `width=${width},height=${height},left=${left},top=${top}`
    );

    if (!popup) {
      onError?.(new Error("Popup blocked"));
      return;
    }

    function cleanup() {
      window.removeEventListener("message", handleMessage);
      if (timerRef.current) clearInterval(timerRef.current);
      popup?.close();
    }

    popupRef.current = popup;

    // Listener for postMessage
    function handleMessage(event: MessageEvent) {
      // Check if the event origin is the expected one
      if (!event.origin.includes(baseFrontUrl)) return;
      const { type, payload, error } = event.data;

      if (type === "OAUTH_CALLBACK") {
        cleanup();
        onSuccess(payload);
      }

      if (type === "OAUTH_ERROR") {
        cleanup();
        onError?.(error);
      }
    }

    window.addEventListener("message", handleMessage);

    // Polling localStorage fallback twice a second
    timerRef.current = window.setInterval(() => {
      try {
        const raw = localStorage.getItem("access_token");
        const refresh = localStorage.getItem("refresh_token");
        if (raw && refresh) {
          cleanup();
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          onSuccess({ accessToken: raw, refreshToken: refresh });
        }
      } catch {
        logger.error("Error accessing localStorage");
      }
    }, 500);
  }, [onSuccess, onError]);

  return openPopup;
}
