import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/_auth/oauth-redirect")({
  component: OAuthRedirect
});

function OAuthRedirect() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get("tokens");

    if (!raw) return;

    try {
      const tokens = JSON.parse(decodeURIComponent(raw));

      if (window.opener) {
        // ?? For better security instead of "*" the exact origin should be used
        const targetOrigin = window.location.origin || "*";
        window.opener.postMessage(
          {
            type: "OAUTH_CALLBACK",
            payload: tokens
          },
          targetOrigin
        );
      } else {
        localStorage.setItem("access_token", tokens.accessToken);
        localStorage.setItem("refresh_token", tokens.refreshToken);
      }
    } catch (e) {
      console.error("Token parsing error", e);
    }

    window.close();
  }, []);

  return <p>The window will close automatically...</p>;
}
