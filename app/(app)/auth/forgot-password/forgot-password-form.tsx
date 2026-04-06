"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { AnimateIcon } from "@/components/animate-ui/icons/icon";
import { Send } from "@/components/animate-ui/icons/send";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
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
import { authClient } from "@/lib/auth/auth-client";
import { emailSchema } from "@/lib/auth/auth-validation";

const forgotPasswordSchema = z.object({
  email: emailSchema,
});

type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const emailRef = useRef<string>("");

  const form = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const { isSubmitting } = form.formState;

  async function handleForgotPassword(values: ForgotPasswordSchema) {
    emailRef.current = values.email;

    const { error, data } = await authClient.requestPasswordReset({
      email: values.email,
      redirectTo: "/auth/reset-password",
    });

    if (!error) {
      toast.success(data.message);
      setIsSubmitted(true);
    }
  }

  if (isSubmitted) {
    return (
      <div className="space-y-5">
        <Alert variant="default">
          <Mail />
          <AlertTitle>
            <strong>Check your email</strong>
            {emailRef.current && (
              <>
                {" "}
                for <strong>{emailRef.current}</strong>
              </>
            )}
            .
          </AlertTitle>
          <AlertDescription>
            If an account with this email exists, you'll receive a password
            reset link shortly.
          </AlertDescription>
        </Alert>

        <p className="text-xs text-muted-foreground text-center">
          If you don't receive anything, check your spam folder or try again.
        </p>

        <Button
          variant="outline"
          onClick={() => {
            setIsSubmitted(false);
            form.reset();
          }}
          className="w-full cursor-pointer"
        >
          Try another email
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit(handleForgotPassword)}
      >
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
                  placeholder="your-email@example.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <AnimateIcon animateOnHover>
          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="w-full my-2 cursor-pointer"
          >
            <LoadingSwap
              isLoading={isSubmitting}
              className="flex items-center gap-2"
            >
              <Send /> Send Reset Link
            </LoadingSwap>
          </Button>
        </AnimateIcon>

        <p className="text-xs text-muted-foreground text-center">
          We'll send you an email with instructions to reset your password.
        </p>
      </form>
    </Form>
  );
}
