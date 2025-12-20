"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "nextjs-toploader/app";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { PasswordInput } from "@/components/ui/password-input";
import { authClient } from "@/lib/auth/auth-client";
import { type SignUpSchema, signUpSchema } from "@/lib/auth/auth-validation";
import { AUTH_LIMITS } from "@/lib/constants/limits";

export function SignUpForm() {
  const router = useRouter();
  const form = useForm<SignUpSchema>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const { isSubmitting } = form.formState;

  async function handleSignUp(data: SignUpSchema) {
    await authClient.signUp.email(
      { ...data, callbackURL: "/auth/sign-in" },
      {
        onError: (error) => {
          toast.error(error.error.message || "Failed to sign up");
        },
        onSuccess: () => {
          toast.success(
            "Check your inbox to verify your email before logging in",
          );
          router.push("/auth/verify-email");
        },
      },
    );
  }

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(handleSignUp)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input required placeholder="Your Name" {...field} />
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
              <FormLabel>E-mail</FormLabel>
              <FormControl>
                <Input
                  required
                  type="email"
                  placeholder="Your E-mail"
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
                <PasswordInput
                  required
                  placeholder="Your Password"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Password must be at least {AUTH_LIMITS.passwordMin} characters,
                include at least one uppercase letter and one number
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <PasswordInput
                  required
                  placeholder="Confirm Password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting}
          className="w-full my-2 cursor-pointer"
        >
          <LoadingSwap isLoading={isSubmitting}>Create Account</LoadingSwap>
        </Button>
      </form>
    </Form>
  );
}
