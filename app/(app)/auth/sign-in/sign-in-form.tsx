"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "nextjs-toploader/app";
import { useForm } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { PasswordInput } from "@/components/ui/password-input";
import { Separator } from "@/components/ui/separator";
import { useMounted } from "@/hooks/use-mounted";
import { authClient } from "@/lib/auth/auth-client";
import { type SignInSchema, signInSchema } from "@/lib/auth/auth-validation";
import { GoogleAuthButton } from "../_components/google-auth-button";

export function SignInForm({ returnTo }: { returnTo?: string }) {
  const router = useRouter();
  const mounted = useMounted();

  // https://better-auth.com/docs/plugins/last-login-method
  const wasEmail = mounted && authClient.isLastUsedLoginMethod("email");

  const form = useForm<SignInSchema>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: true,
    },
  });

  const { isSubmitting } = form.formState;

  async function handleSignIn(data: SignInSchema) {
    await authClient.signIn.email(
      {
        email: data.email,
        password: data.password,
        callbackURL: returnTo,
        rememberMe: data.rememberMe,
      },
      {
        onSuccess: () => {
          router.push(returnTo || "/");
          router.refresh();
        },
      },
    );
  }

  return (
    <Form {...form}>
      <GoogleAuthButton title="Sign in with Google" returnTo={returnTo} />

      <div className="relative my-7">
        <Separator />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
          Or continue with
        </span>
      </div>

      <form onSubmit={form.handleSubmit(handleSignIn)}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="relative">
                E-mail{" "}
                {wasEmail && (
                  <Badge variant="outline" className="absolute right-0">
                    Last used
                  </Badge>
                )}
              </FormLabel>
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
              <div className="flex items-center justify-between">
                <FormLabel>Password</FormLabel>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              <FormControl>
                <PasswordInput
                  required
                  placeholder="Your Password"
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="rememberMe"
          render={({ field }) => (
            <FormItem className="flex items-center">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="cursor-pointer"
                />
              </FormControl>
              <FormLabel className="cursor-pointer">Remember me</FormLabel>
            </FormItem>
          )}
        />

        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting}
          className="w-full my-2 cursor-pointer"
        >
          <LoadingSwap isLoading={isSubmitting}>Sign In</LoadingSwap>
        </Button>
      </form>
    </Form>
  );
}
