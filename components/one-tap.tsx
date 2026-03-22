"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth/auth-client";

let oneTapTriggered = false;

export function OneTap() {
  const router = useRouter();
  const { data, isPending } = authClient.useSession();

  // biome-ignore lint/correctness/useExhaustiveDependencies: router is stable across renders
  useEffect(() => {
    if (isPending || data?.user || oneTapTriggered) return;

    oneTapTriggered = true;

    authClient
      .oneTap({
        fetchOptions: {
          onSuccess: (ctx) => {
            if (ctx?.data?.user) {
              toast.success("Signed in successfully");
              router.push("/");
              router.refresh();
            }
          },
          onError: (ctx) => {
            toast.error(ctx.error.message);
            oneTapTriggered = false;
          },
        },
      })
      .catch((error) => {
        console.error("OneTap initialization failed:", error);
        oneTapTriggered = false;
      });
  }, [isPending, data?.user]);

  return null;
}
