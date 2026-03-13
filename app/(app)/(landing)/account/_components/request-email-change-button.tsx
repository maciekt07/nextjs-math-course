"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { MailCheck, MailWarning, MailX } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { AnimateIcon } from "@/components/animate-ui/icons/icon";
import { Send } from "@/components/animate-ui/icons/send";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { authClient } from "@/lib/auth/auth-client";
import { emailSchema } from "@/lib/auth/auth-validation";

interface RequestEmailChangeButtonProps {
  currentEmail: string;
  isVerified: boolean;
}

const changeEmailSchema = z.object({
  newEmail: emailSchema,
});

type ChangeEmailSchema = z.infer<typeof changeEmailSchema>;

export function RequestEmailChangeButton({
  currentEmail,
  isVerified,
}: RequestEmailChangeButtonProps) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const form = useForm<ChangeEmailSchema>({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: {
      newEmail: "",
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: ChangeEmailSchema) {
    if (values.newEmail === currentEmail) {
      form.setError("newEmail", {
        message: "New email must be different from current email",
      });
      return;
    }

    setStatus("loading");
    try {
      const { error } = await authClient.changeEmail({
        newEmail: values.newEmail,
        callbackURL: "/auth/verify-email-change",
      });

      if (error) {
        setStatus("error");
        setErrorMessage(error.message);
        if (error.status !== 429) {
          toast.error(error.message || "Failed to request email change");
        }
      } else {
        setStatus("success");
        toast.success("Email change confirmation sent!");
      }
    } catch {
      setStatus("error");
      setErrorMessage("An unexpected error occurred");
    }
  }

  if (!isVerified) {
    return (
      <Alert variant="default">
        <MailWarning />
        <AlertTitle>Email verification required</AlertTitle>
        <AlertDescription>
          You must verify your email address before you can request an email
          change.
        </AlertDescription>
      </Alert>
    );
  }

  if (status === "success") {
    return (
      <Alert variant="success">
        <MailCheck />
        <AlertTitle>Email change requested!</AlertTitle>
        <AlertDescription>
          <div>
            We've sent a confirmation email to{" "}
            <b>your current email ({currentEmail})</b>. Please check your inbox
            and click the link to continue the change.
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  if (status === "error") {
    return (
      <Alert variant="destructive">
        <MailX />
        <AlertTitle>Failed to request email change.</AlertTitle>
        <AlertDescription>{errorMessage}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <AnimateIcon animateOnHover className="w-full">
          <Button variant="outline" className="w-full cursor-pointer">
            <Send />
            Request Email change
          </Button>
        </AnimateIcon>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Email Address</DialogTitle>
          <DialogDescription>
            Enter your new email address. We'll send a verification link to
            confirm the change.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-email">Current Email</Label>
              <Input
                id="current-email"
                type="email"
                value={currentEmail}
                disabled
                className="bg-muted"
              />
            </div>

            <FormField
              control={form.control}
              name="newEmail"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="new-email">New Email Address</Label>
                  <FormControl>
                    <Input
                      id="new-email"
                      type="email"
                      placeholder="your-new-email@example.com"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <AnimateIcon animateOnHover>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full cursor-pointer"
              >
                <LoadingSwap
                  isLoading={isSubmitting}
                  className="flex items-center gap-2"
                >
                  <Send />
                  Send Verification Email
                </LoadingSwap>
              </Button>
            </AnimateIcon>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
