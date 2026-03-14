"use client";

import { isAPIError } from "better-auth/api";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { authClient } from "@/lib/auth/auth-client";

export function RevokeButton({ token }: { token: string }) {
  const [isRevoking, setIsRevoking] = useState<boolean>(false);
  const router = useRouter();

  async function handleRevoke() {
    try {
      setIsRevoking(true);
      await authClient.revokeSession({ token });
      router.refresh();
    } catch (error) {
      if (isAPIError(error)) {
        toast.error(error.message);
      }
    } finally {
      setIsRevoking(false);
    }
  }

  return (
    <Button
      variant="destructive"
      size="sm"
      disabled={isRevoking}
      onClick={handleRevoke}
      className="cursor-pointer text-xs"
    >
      <LoadingSwap isLoading={isRevoking}>Revoke</LoadingSwap>
    </Button>
  );
}
