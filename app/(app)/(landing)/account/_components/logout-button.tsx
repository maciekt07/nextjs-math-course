"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "nextjs-toploader/app";
import { type ComponentProps, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { authClient } from "@/lib/auth/auth-client";

export function LogOutButton({ ...props }: ComponentProps<typeof Button>) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleLogout = async () => {
    setIsLoading(true);
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
          toast.success("Signed out successfully");
          router.refresh();
        },
        onError: () => {
          setIsLoading(false);
          toast.error("Failed to sign out");
        },
      },
    });
  };

  return (
    <Button
      size="lg"
      variant="destructive"
      disabled={isLoading}
      className="w-full cursor-pointer"
      onClick={handleLogout}
      {...props}
    >
      <LoadingSwap isLoading={isLoading} className="flex items-center gap-2">
        <LogOut /> Logout
      </LoadingSwap>
    </Button>
  );
}
