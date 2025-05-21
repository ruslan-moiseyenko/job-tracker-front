import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/_auth/oauth-redirect")({
  component: OAuthRedirect
});

function OAuthRedirect() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get("success");

    // TODO: Check params and if we need to check success
    if (!success) return;

    try {
      if (window.opener) {
        // ?? For better security instead of "*" the exact origin should be used
        const targetOrigin = window.location.origin || "*";
        window.opener.postMessage(
          {
            type: "OAUTH_CALLBACK",
            success: true
          },
          targetOrigin
        );
      }
      // Cookies are handled by the server, no need to store tokens
    } catch (e) {
      console.error("OAuth redirect error", e);
    }

    window.close();
  }, []);

  return <p>The window will close automatically...</p>;
}
