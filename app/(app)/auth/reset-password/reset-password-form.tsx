"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { Session } from "better-auth";
import { CircleCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { AnimateIcon } from "@/components/animate-ui/icons/icon";
import { LogIn } from "@/components/animate-ui/icons/log-in";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { LoadingSwap } from "@/components/ui/loading-swap";
import { PasswordInput } from "@/components/ui/password-input";
import { authClient } from "@/lib/auth/auth-client";
import {
  PASSWORD_REQUIREMENTS,
  passwordSchema,
} from "@/lib/auth/auth-validation";

const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm({
  token,
  session,
}: {
  token?: string;
  session: Session | null;
}) {
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const form = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const { isSubmitting } = form.formState;

  async function handleResetPassword(data: ResetPasswordSchema) {
    if (!token) {
      toast.error("Invalid reset link. Please request a new one.");
      return;
    }

    try {
      await authClient.resetPassword(
        {
          token,
          newPassword: data.password,
        },
        {
          onError: (ctx) => {
            if (ctx.error?.status === 400) {
              toast.error(
                "Invalid or expired reset link. Please request a new one.",
              );
            } else {
              toast.error(ctx.error?.message ?? "Failed to reset password");
            }
          },
          onSuccess: () => {
            setIsSuccess(true);
            toast.success("Password reset successfully!");
            if (session) {
              authClient.revokeOtherSessions();
            }
          },
        },
      );
    } catch {
      toast.error("Failed to reset password. Please try again.");
    }
  }

  if (isSuccess) {
    return (
      <div className="space-y-5">
        <Alert variant="success">
          <CircleCheck />
          <AlertTitle>
            <strong>Success!</strong>
          </AlertTitle>
          <AlertDescription>
            Your password has been reset
            {!session && ". You can now sign in with your new password"}.
          </AlertDescription>
        </Alert>

        {!session ? (
          <AnimateIcon animateOnHover>
            <Button className="w-full" asChild>
              <Link href="/auth/sign-in">
                <LogIn /> Go to Sign In
              </Link>
            </Button>
          </AnimateIcon>
        ) : (
          <Button className="w-full" asChild>
            <Link href="/">Back to home</Link>
          </Button>
        )}
      </div>
    );
  }

  if (!token) {
    return (
      <div className="space-y-5">
        <Alert variant="destructive">
          <AlertTitle>Invalid link</AlertTitle>
          <AlertDescription>
            This password reset link is invalid or has expired. Please request a
            new one.
          </AlertDescription>
        </Alert>
        <Button className="w-full" asChild>
          <Link href={session ? "/account" : "/auth/forgot-password"}>
            Request New Reset Link
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleResetPassword)}>
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <PasswordInput
                  required
                  placeholder="Enter your new password"
                  {...field}
                />
              </FormControl>
              <FormDescription>{PASSWORD_REQUIREMENTS}</FormDescription>
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
                  placeholder="Confirm your new password"
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
          <LoadingSwap isLoading={isSubmitting}>Reset Password</LoadingSwap>
        </Button>
      </form>
    </Form>
  );
}
