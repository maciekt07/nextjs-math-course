"use client";

import { useRouter } from "nextjs-toploader/app";
import type React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/auth-client";
import { useBuyCourse } from "@/lib/stripe/use-buy-course";
import { cn } from "@/lib/ui";
import { LoadingSwap } from "./ui/loading-swap";

interface BuyButtonProps extends React.ComponentProps<typeof Button> {
  courseId: string;
  children?: React.ReactNode;
}

export default function BuyCourseButton({
  courseId,
  children,
  className,
  ...props
}: BuyButtonProps) {
  const router = useRouter();
  const { buy, loading, setLoading } = useBuyCourse();

  const handleClick = async () => {
    setLoading(true);
    try {
      const { data: session } = await authClient.getSession({
        query: { disableCookieCache: true },
      });

      const user = session?.user;

      if (!user) {
        toast.error("You must be signed in to purchase a course.");
        router.push("/auth/sign-in");
        return;
      }

      if (!user.emailVerified) {
        toast.error("You must verify your email before purchasing a course.");
        router.push("/auth/verify-email");
        return;
      }

      const result = await buy(courseId);

      if (!result.success) {
        toast.error(result.error);
      }
    } catch (err) {
      console.error("[BuyCourseButton]", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={loading}
      className={cn("cursor-pointer", className)}
      {...props}
    >
      <LoadingSwap isLoading={loading} className="flex items-center gap-2">
        {children}
      </LoadingSwap>
    </Button>
  );
}
