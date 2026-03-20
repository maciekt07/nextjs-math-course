"use client";

import { useRouter } from "nextjs-toploader/app";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth/auth-client";

export function OneTap() {
  const oneTapInitialized = useRef<boolean>(false);
  const router = useRouter();

  const { data, isPending } = authClient.useSession();

  useEffect(() => {
    if (data?.user || isPending || oneTapInitialized.current) return;

    const triggerOneTap = async () => {
      oneTapInitialized.current = true;

      try {
        await authClient.oneTap({
          fetchOptions: {
            onSuccess: (ctx) => {
              if (ctx?.data?.user) {
                router.push("/");
                router.refresh();
                toast.success("Signed in successfully");
              }
            },
            onError: (ctx) => {
              toast.error(ctx.error.message);
              oneTapInitialized.current = false;
            },
          },
        });
      } catch (error) {
        console.error("OneTap initialization failed:", error);
        oneTapInitialized.current = false;
      }
    };

    triggerOneTap();
  }, [data?.user, isPending, router.push, router.refresh]);

  return null;
}
