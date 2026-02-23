"use client";

import { useRouter } from "nextjs-toploader/app";
import type React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/auth-client";
import { useBuyCourse } from "@/lib/stripe/useBuyCourse";
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
  const { buy, loading, error } = useBuyCourse();
  const { data: session } = authClient.useSession();

  const handleClick = async () => {
    if (!session?.user) {
      toast.error("You must be signed in to purchase a course");
      router.push("/auth/sign-in");
      return;
    }

    await buy(courseId);

    if (error) {
      toast.error(error);
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
