import React from "react";
import { Button } from "@/components/ui/button";

export interface OAuthProvider {
  id: string;
  name: string;
  icon: React.ReactNode;
  handleLogin: () => void;
}

interface OAuthProviderButtonsProps {
  providers: OAuthProvider[];
  className?: string;
}

export const OAuthProviderButtons: React.FC<OAuthProviderButtonsProps> = ({
  providers,
  className
}) => {
  if (!providers || providers.length === 0) return null;

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {providers.map((provider) => (
        <Button
          key={provider.id}
          variant="outline"
          className="w-full flex items-center gap-2"
          type="button"
          onClick={provider.handleLogin}
        >
          {provider.icon}
          <span>Continue with {provider.name}</span>
        </Button>
      ))}
    </div>
  );
};
