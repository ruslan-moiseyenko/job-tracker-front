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
import type { IRegisterInput } from "@/auth/types";

type RegistrationCardProps = PropsWithChildren &
  ComponentPropsWithoutRef<"div"> & {
    isLoading: boolean;
    error?: string | null;
    handleSubmit: (data: IRegisterInput) => Promise<void>;
  };

const formSchema = z.object({
  firstName: z.string().max(20).optional(),
  lastName: z.string().max(20).optional(),
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

export const RegistrationCard: FC<RegistrationCardProps> = ({
  className,
  isLoading,
  handleSubmit,
  error
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: ""
    }
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await handleSubmit({
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName
      });
    } catch (err) {
      console.error("Registration failed:", err);
    }
  }

  // Use effect to update form errors when the error prop changes
  React.useEffect(() => {
    if (error) {
      // Handle email-related errors (like email already in use)
      if (error.toLowerCase().includes("email")) {
        form.setError("email", {
          type: "server",
          message: error
        });
      }
      // Handle password-related errors
      else if (error.toLowerCase().includes("password")) {
        form.setError("password", {
          type: "server",
          message: error
        });
      }
      // Generic registration error
      else {
        form.setError("root", {
          type: "server",
          message: error
        });
      }
    }
  }, [error, form]);

  return (
    <Card className={cn("flex flex-col gap-6 w-sm", className)}>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Enter your information below to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {form.formState.errors.root && (
              <div className="text-destructive text-sm p-2 border border-destructive/50 bg-destructive/10 rounded">
                {form.formState.errors.root.message}
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last name</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
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
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              {isLoading ? "Creating Account..." : "Register"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <ColoredNavLink to="/login">
          Already have an account? Login
        </ColoredNavLink>
      </CardFooter>
    </Card>
  );
};
