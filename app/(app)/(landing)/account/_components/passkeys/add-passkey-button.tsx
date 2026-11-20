"use client";

import { AnimateIcon } from "@animate-ui/react/icons";
import Bowser from "bowser";
import { UserKey } from "lucide-react";
import { useRouter } from "nextjs-toploader/app";
import { useState } from "react";
import { toast } from "sonner";
import { Fingerprint } from "@/components/animate-ui/icons/fingerprint";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { authClient } from "@/lib/auth/auth-client";
import { passkeyNameSchema } from "@/lib/auth/auth-validation";
import { LIMITS } from "@/lib/constants/limits";

function getDefaultPasskeyName() {
  if (typeof window === "undefined") return "Passkey";

  const parser = Bowser.getParser(window.navigator.userAgent);
  const browser = parser.getBrowserName();
  const os = parser.getOSName();

  const name =
    browser && os ? `${browser} on ${os}` : (browser ?? os ?? "Passkey");

  return name.slice(0, LIMITS.auth.passkeyNameMaxLength);
}

function getErrorMessage(error: { message?: unknown }) {
  const message = error.message;
  if (typeof message === "string") return message;

  if (message && typeof message === "object" && "message" in message) {
    const nested = (message as { message?: unknown }).message;
    if (typeof nested === "string") return nested;
  }

  return undefined;
}

export function AddPasskeyButton({ disabled }: { disabled?: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>();

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen) {
      setName(getDefaultPasskeyName());
      setError(undefined);
    }
  }

  async function handleAddPasskey() {
    const parsedName = passkeyNameSchema.safeParse(name);
    if (!parsedName.success) {
      setError(parsedName.error.issues[0]?.message ?? "Invalid passkey name");
      return;
    }

    setError(undefined);
    setIsLoading(true);

    const { error: addError } = await authClient.passkey.addPasskey({
      name: parsedName.data,
    });

    setIsLoading(false);

    if (addError) {
      const code = "code" in addError ? addError.code : undefined;
      if (
        code === "ERROR_CEREMONY_ABORTED" ||
        code === "REGISTRATION_CANCELLED"
      ) {
        return;
      }
      toast.error(getErrorMessage(addError) ?? "Failed to add passkey");
      return;
    }

    setOpen(false);
    toast.success("Passkey added");
    router.refresh();
  }

  if (disabled) {
    return (
      <AnimateIcon animateOnHover className="w-full">
        <Button variant="outline" className="w-full mt-1" disabled>
          <Fingerprint />
          Add a passkey
        </Button>
      </AnimateIcon>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <AnimateIcon animateOnHover className="w-full">
          <Button
            variant="outline"
            className="w-full cursor-pointer mt-1"
            disabled={disabled}
          >
            <Fingerprint />
            Add a passkey
          </Button>
        </AnimateIcon>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <span className="inline-flex items-center justify-center sm:justify-start gap-2">
              <UserKey />
              Add a passkey
            </span>
          </DialogTitle>
          <DialogDescription>
            Use Face ID, Touch ID, Windows Hello, or a security key to sign in
            without a password.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="passkey-name">Passkey name</Label>
          <Input
            id="passkey-name"
            value={name}
            maxLength={LIMITS.auth.passkeyNameMaxLength}
            onChange={(event) => {
              setName(event.target.value);
              setError(undefined);
            }}
            placeholder="My passkey"
            disabled={isLoading}
          />
          {error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              A name helps you identify this passkey later.
            </p>
          )}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              disabled={isLoading}
            >
              Cancel
            </Button>
          </DialogClose>
          <AnimateIcon animateOnHover>
            <Button
              type="button"
              onClick={handleAddPasskey}
              disabled={isLoading}
              className="cursor-pointer w-full"
            >
              <LoadingSwap
                isLoading={isLoading}
                className="flex items-center gap-2"
              >
                <Fingerprint />
                Add passkey
              </LoadingSwap>
            </Button>
          </AnimateIcon>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
