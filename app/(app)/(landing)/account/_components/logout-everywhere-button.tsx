"use client";

import { ShieldOff } from "lucide-react";
import { useRouter } from "nextjs-toploader/app";
import { type ComponentProps, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { authClient } from "@/lib/auth/auth-client";

export function LogoutEverywhereButton({
  ...props
}: ComponentProps<typeof Button>) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleLogoutEverywhere = async () => {
    setIsLoading(true);
    await authClient.revokeSessions({
      fetchOptions: {
        onSuccess: async () => {
          await authClient.signOut({
            fetchOptions: {
              onSuccess: () => {
                router.push("/");
                toast.success("Logged out from all devices");
                router.refresh();
              },
            },
          });
        },
        onError: () => {
          setIsLoading(false);
          toast.error("Failed to revoke sessions");
        },
      },
    });
  };

  return (
    <Button
      variant="destructive"
      disabled={isLoading}
      className="cursor-pointer"
      onClick={handleLogoutEverywhere}
      {...props}
    >
      <LoadingSwap isLoading={isLoading} className="flex items-center gap-2">
        <ShieldOff /> Logout everywhere
      </LoadingSwap>
    </Button>
  );
}
