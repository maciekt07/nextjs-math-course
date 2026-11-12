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
    setIsRevoking(true);

    try {
      await authClient.revokeSession({ token });
    } catch (error) {
      setIsRevoking(false);
      if (isAPIError(error)) {
        toast.error(error.message);
      }
      return;
    }

    setIsRevoking(false);
    toast.success("Session revoked");
    router.refresh();
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
