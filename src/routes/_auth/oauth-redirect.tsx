import { useEffect, useState } from 'react';

import { createFileRoute } from '@tanstack/react-router';

import {
  BROADCAST_CHANNEL_MESSAGE,
  BROADCAST_CHANNEL_NAME
} from '@/routes/_auth/login';

import { useLoadingContext } from '@/components/ui/LoadingContext';

export const Route = createFileRoute('/_auth/oauth-redirect')({
  component: OAuthRedirect
});

function OAuthRedirect() {
  const { showLoading, hideLoading, updateMessage } = useLoadingContext();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  );

  useEffect(() => {
    showLoading('Completing authentication...');

    const params = new URLSearchParams(window.location.search);
    const success = params.get('success');

    if (!success) {
      setStatus('error');
      updateMessage('Authentication failed');
      setTimeout(() => {
        hideLoading();
      }, 500);
      return;
    }

    try {
      const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      channel.postMessage({ type: BROADCAST_CHANNEL_MESSAGE, success: true });
      channel.close();

      setStatus('success');
      updateMessage('Authentication successful!');
    } catch (error) {
      console.error('BroadcastChannel failed:', error);
      // Fall back to localStorage approach
      localStorage.setItem('oauth_status', 'success');
      localStorage.setItem('oauth_timestamp', Date.now().toString());

      setStatus('success');
      updateMessage('Authentication successful!');
    }

    // Show success message for a moment before closing
    setTimeout(() => {
      hideLoading();
      setTimeout(() => {
        window.close();
      }, 500);
    }, 1500);
  }, [hideLoading, showLoading, updateMessage]);

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center">
      {status === 'success' && (
        <div className="text-center p-6">
          <h1 className="text-2xl font-bold mb-2">
            Authentication successful!
          </h1>
          <p>You can close this window and return to the application.</p>
        </div>
      )}

      {status === 'error' && (
        <div className="text-center p-6">
          <h1 className="text-2xl font-bold text-red-500 mb-2">
            Authentication failed
          </h1>
          <p>There was an issue during authentication. Please try again.</p>
        </div>
      )}
    </div>
  );
}
