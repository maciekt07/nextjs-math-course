"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AnimateIcon } from "@/components/animate-ui/icons/icon";
import { Send } from "@/components/animate-ui/icons/send";
import { Button } from "@/components/ui/button";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { authClient } from "@/lib/auth/auth-client";

interface SendVerificationButtonProps {
  email: string;
  initialCooldown?: number;
}

export function SendVerificationButton({
  email,
  initialCooldown = 60,
}: SendVerificationButtonProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [cooldown, setCooldown] = useState<number>(0);
  const [firstSent, setFirstSent] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (cooldown <= 0) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [cooldown]);

  async function SendVerificationEmail() {
    if (cooldown > 0) return;

    setIsLoading(true);
    try {
      const { error } = await authClient.sendVerificationEmail({
        email,
        callbackURL: "/auth/email-verified",
      });

      if (error) {
        if (error.status === 429) return;
        toast.error(error.message || "Failed to send verification email");
      } else {
        toast.success(
          firstSent
            ? "Verification email sent again"
            : "Verification email sent successfully",
        );
        setCooldown(initialCooldown);
        setFirstSent(true);
      }
    } catch (err) {
      toast.error("Something went wrong. Please try again later.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AnimateIcon animateOnHover className="w-full">
      <Button
        onClick={SendVerificationEmail}
        className="w-full cursor-pointer"
        disabled={isLoading || cooldown > 0}
      >
        <LoadingSwap isLoading={isLoading}>
          {cooldown > 0 ? (
            `Resend in ${cooldown}s`
          ) : firstSent ? (
            "Resend email"
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Send /> Send email
            </span>
          )}
        </LoadingSwap>
      </Button>
    </AnimateIcon>
  );
}
