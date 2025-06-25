import { useCallback, useRef } from 'react';

import { GET_ME_QUERY } from '@/features/auth/queries';
import { apolloClient } from '@/graphql/apolloClient';
import { IS_LOGGED_OUT_KEY } from '@/graphql/local-storage-keys';

export function useGoogleAuthPopup(
  onSuccess: () => void,

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
      import.meta.env.VITE_GRAPHQL_API_URL || 'http://localhost:4000';
    const baseFrontUrl =
      import.meta.env.VITE_FRONTEND_URL || window.location.origin;
    const url = `${baseBackendUrl}/auth/google`;

    const popup = window.open(
      url,
      '_blank',
      `width=${width},height=${height},left=${left},top=${top}`
    );

    if (!popup) {
      onError?.(new Error('Popup blocked'));
      return;
    }

    function cleanup() {
      window.removeEventListener('message', handleMessage);
      if (timerRef.current) clearInterval(timerRef.current);
      popup?.close();
    }

    popupRef.current = popup;

    // Listener for postMessage
    function handleMessage(event: MessageEvent) {
      // Check if the event origin is the expected one
      if (!event.origin.includes(baseFrontUrl)) return;
      const { type, success, error } = event.data;

      if (type === 'OAUTH_CALLBACK' && success) {
        cleanup();
        // Remove logged out flag
        localStorage.removeItem(IS_LOGGED_OUT_KEY);

        // Verify authentication with a query to the server
        apolloClient
          .query({
            query: GET_ME_QUERY,
            fetchPolicy: 'network-only'
          })
          .then(() => {
            onSuccess();
          })
          .catch((err) => {
            onError?.(err);
          });
      }

      if (type === 'OAUTH_ERROR') {
        cleanup();
        onError?.(error);
      }
    }

    window.addEventListener('message', handleMessage);

    // TODO: Check setInterval correctness
    // Check if the popup is closed manually
    const checkClosed = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkClosed);
        cleanup();
      }
    }, 500);
  }, [onSuccess, onError]);

  return openPopup;
}
