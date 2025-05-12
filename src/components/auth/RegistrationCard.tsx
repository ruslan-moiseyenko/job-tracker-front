import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { ColoredNavLink } from "@/components/common/ColoredNavLink";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

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

export const RegistrationCard = () => {
  const { register, loading, error } = useAuth();

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
      await register({
        email: values.email,
        password: values.password,
        firstName: values.firstName || undefined,
        lastName: values.lastName || undefined
      });
      // Navigation is handled in the register function
    } catch (err) {
      console.error("Registration failed:", err);
    }
  }

  return (
    <Card className="w-100">
      <CardHeader>
        <CardTitle>Registration</CardTitle>
        <CardDescription>
          Create an account to start tracking your job applications.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First name</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="First name" {...field} />
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
                    <Input type="text" placeholder="Last name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Email <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="email" {...field} />
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
                  <FormLabel>
                    Password <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="password" {...field} />
                  </FormControl>
                  <FormDescription>
                    Fields marked with{" "}
                    <span className="text-destructive">*</span> are required.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              {loading ? "Registering..." : "Submit"}
            </Button>
            {error && (
              <div className="text-destructive text-sm mt-1">
                Registration failed. Please try again.
              </div>
            )}
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <ColoredNavLink to="/">Already registered?</ColoredNavLink>
      </CardFooter>
    </Card>
  );
};
