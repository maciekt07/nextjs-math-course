"use client";

import { AnimateIcon } from "@animate-ui/react/icons";
import { useRouter } from "nextjs-toploader/app";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Fingerprint } from "@/components/animate-ui/icons/fingerprint";
import { Button } from "@/components/ui/button";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { useMounted } from "@/hooks/use-mounted";
import { authClient } from "@/lib/auth/auth-client";
import { cn } from "@/lib/ui";
import { LastUsedBadge } from "./last-used-badge";

interface PasskeyAuthButtonProps extends React.ComponentProps<typeof Button> {
  returnTo?: string;
}

export function PasskeyAuthButton({
  className,
  returnTo,
  ...props
}: PasskeyAuthButtonProps) {
  const router = useRouter();
  const mounted = useMounted();
  const [loading, setLoading] = useState<boolean>(false);
  const [isSupported, setIsSupported] = useState<boolean>(false);

  useEffect(() => {
    setIsSupported(Boolean(window.PublicKeyCredential));
  }, []);

  const wasPasskey = mounted && authClient.isLastUsedLoginMethod("passkey");

  const handleSignInWithPasskey = async () => {
    setLoading(true);

    await authClient.signIn.passkey({
      fetchOptions: {
        onSuccess: () => {
          router.push(returnTo || "/");
          router.refresh();
          toast.success("Signed in successfully");
        },
        onError: ({ error }) => {
          setLoading(false);
          // The user dismissed the browser's passkey prompt.
          if (error.code === "AUTH_CANCELLED") return;
          toast.error(error.message || "Passkey sign-in failed");
        },
      },
    });

    setLoading(false);
  };

  if (!isSupported) return null;

  return (
    <AnimateIcon animateOnHover className="w-full">
      <Button
        className={cn(
          "relative w-full rounded-full cursor-pointer text-[14px]",
          className,
        )}
        onClick={handleSignInWithPasskey}
        type="button"
        variant="outline"
        size="lg"
        disabled={loading}
        {...props}
      >
        <LoadingSwap isLoading={loading}>
          <span className="flex items-center justify-center gap-2">
            <Fingerprint className="size-4" />
            Sign in with a passkey
          </span>
        </LoadingSwap>
        {wasPasskey && !loading && <LastUsedBadge />}
      </Button>
    </AnimateIcon>
  );
}
