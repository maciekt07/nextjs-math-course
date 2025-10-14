"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { type ComponentProps, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { authClient } from "@/lib/auth-client";

export function LogOutButton({ ...props }: ComponentProps<typeof Button>) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  return (
    <Button
      size="lg"
      variant="destructive"
      disabled={isLoading}
      className="w-full cursor-pointer"
      onClick={async () => {
        setIsLoading(true);
        await authClient.signOut({
          fetchOptions: {
            onSuccess: () => {
              router.push("/");
              toast.success("Signed out successfully");
            },
            onError: () => {
              setIsLoading(false);
              toast.error("Failed to sign out");
            },
          },
        });
      }}
      {...props}
    >
      <LoadingSwap isLoading={isLoading} className="flex items-center gap-2">
        <LogOut /> Logout
      </LoadingSwap>
    </Button>
  );
}
