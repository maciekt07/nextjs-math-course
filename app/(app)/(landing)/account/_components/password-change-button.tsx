"use client";

import { MailCheck, MailWarning } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AnimateIcon } from "@/components/animate-ui/icons/icon";
import { Send } from "@/components/animate-ui/icons/send";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { authClient } from "@/lib/auth/auth-client";

interface PasswordChangeButtonProps {
  email: string;
  isVerified: boolean;
}

export function PasswordChangeButton({
  email,
  isVerified,
}: PasswordChangeButtonProps) {
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const handleRequest = async () => {
    setStatus("loading");
    try {
      const { error } = await authClient.requestPasswordReset({
        email,
        redirectTo: "/auth/reset-password",
      });

      if (error) {
        toast.error(error.message || "Failed to request password change");
        setStatus("error");
      } else {
        setStatus("success");
      }
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <Alert variant="success">
        <MailCheck />
        <AlertTitle>Password change requested!</AlertTitle>
        <AlertDescription>
          Check your email to reset your password.
        </AlertDescription>
      </Alert>
    );
  }

  if (!isVerified) {
    return (
      <Alert variant="default">
        <MailWarning />
        <AlertTitle>Email verification required</AlertTitle>
        <AlertDescription>
          You must verify your email address before you can request a password
          change.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <AnimateIcon animateOnHover className="w-full">
      <Button
        className="w-full cursor-pointer"
        onClick={handleRequest}
        disabled={status === "loading"}
      >
        <LoadingSwap
          isLoading={status === "loading"}
          className="flex items-center gap-2"
        >
          <Send />
          Request password change
        </LoadingSwap>
      </Button>
    </AnimateIcon>
  );
}
