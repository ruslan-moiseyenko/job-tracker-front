import { ColoredNavLink } from "@/components/common/ColoredNavLink";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import type { PropsWithChildren, FC, ComponentPropsWithoutRef } from "react";
import type { ILoginInput } from "@/auth/types";
import { PasswordInput } from "@/components/common/PasswordInput";
import {
  OAuthProviderButtons,
  type OAuthProvider
} from "./OAuthProviderButtons";

type LoginCardProps = PropsWithChildren &
  ComponentPropsWithoutRef<"div"> & {
    isLoading: boolean;
    error?: string | null;
    handleSubmit: ({ email, password }: ILoginInput) => Promise<void>;
    oauthProviders?: OAuthProvider[];
  };

const formSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(6, {
      message: "Password must be at least 6 characters."
    })
    .max(20, {
      message: "Come on! 20 characters is more then enough!"
    })
    .refine(
      (val) => {
        return /[A-Z]/.test(val) && /[a-z]/.test(val) && /\d/.test(val);
      },
      {
        message:
          "Password must contain at least one uppercase letter, one lowercase letter, and one number."
      }
    )
});

export const LoginCard: FC<LoginCardProps> = ({
  className,
  isLoading,
  handleSubmit,
  oauthProviders,
  error
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await handleSubmit({
        email: values.email,
        password: values.password
      });
    } catch (_err) {
      // Error is handled in the parent component
    }
  }

  // Use effect to update form errors when the error prop changes
  React.useEffect(() => {
    if (error) {
      // Always set the root error for visibility
      form.setError("root", {
        type: "server",
        message: error
      });

      // Additionally set field-specific errors for validation styling
      if (
        error.toLowerCase().includes("password") ||
        error.toLowerCase().includes("invalid") ||
        error.toLowerCase().includes("credentials")
      ) {
        form.setError("password", {
          type: "server",
          message: error
        });
      } else if (error.toLowerCase().includes("email")) {
        form.setError("email", {
          type: "server",
          message: error
        });
      }

      // Ensure the form state is updated
      form.trigger();
    }
  }, [error, form]);

  return (
    <Card className={cn("flex flex-col gap-6 w-sm", className)}>
      <CardHeader>
        <CardTitle>Login to JobTracker</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="gap-4">
                  <FormLabel>Login</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="example@email.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="gap-4">
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder="password" {...field} />
                  </FormControl>
                  <ColoredNavLink to="/">Forgot password?</ColoredNavLink>
                  <FormMessage />
                </FormItem>
              )}
            />
            {error && (
              <div className="text-destructive text-sm p-2 border border-destructive/50 bg-destructive/10 rounded-md">
                {error}
              </div>
            )}
            {/* This is a fallback for form errors that might not be covered by the direct error display */}
            {!error && form.formState.errors.root && (
              <div className="text-destructive text-sm p-2 border border-destructive/50 bg-destructive/10 rounded-md">
                {form.formState.errors.root.message}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              {isLoading ? "Logging in..." : "Login"}
            </Button>

            {/* Render OAuth provider buttons if available */}
            {oauthProviders && oauthProviders.length > 0 && (
              <OAuthProviderButtons providers={oauthProviders} />
            )}
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <ColoredNavLink to="/register">
          Don&apos;t have an account?
        </ColoredNavLink>
      </CardFooter>
    </Card>
  );
};
