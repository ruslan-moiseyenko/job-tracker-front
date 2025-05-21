import {
  BROADCAST_CHANNEL_MESSAGE,
  BROADCAST_CHANNEL_NAME
} from "@/routes/_auth/login";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/_auth/oauth-redirect")({
  component: OAuthRedirect
});

function OAuthRedirect() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get("success");

    if (!success) return;

    try {
      const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      channel.postMessage({ type: BROADCAST_CHANNEL_MESSAGE, success: true });
      channel.close();

      document.body.innerHTML =
        "<h1>Authentication successful! You can close this window and return to the application.</h1>";
    } catch (error) {
      console.error("BroadcastChannel failed:", error);
      // Fall back to localStorage approach
      localStorage.setItem("oauth_status", "success");
      localStorage.setItem("oauth_timestamp", Date.now().toString());
    }

    window.close();
  }, []);

  return <p>The window will close automatically...</p>;
}
