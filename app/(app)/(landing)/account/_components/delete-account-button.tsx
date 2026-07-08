"use client";

import { MailCheck, MailX, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AnimateIcon } from "@/components/animate-ui/icons/icon";
import { Send } from "@/components/animate-ui/icons/send";
import { Trash2 as AnimatedTrash2 } from "@/components/animate-ui/icons/trash-2";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { LoadingSwap } from "@/components/ui/loading-swap";
import { authClient } from "@/lib/auth/auth-client";

export function DeleteAccountButton() {
  const [open, setOpen] = useState<boolean>(false);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const handleDeleteRequest = async () => {
    setStatus("loading");
    setErrorMessage(undefined);

    try {
      const { error } = await authClient.deleteUser({
        callbackURL: "/auth/account-deleted",
      });

      if (error) {
        setStatus("error");
        setErrorMessage(error.message);
        if (error.status !== 429) {
          toast.error(error.message || "Failed to request account deletion");
        }
        return;
      }

      setStatus("success");
      setOpen(false);
    } catch {
      setStatus("error");
      setErrorMessage("Failed to request account deletion");
    }
  };

  if (status === "success") {
    return (
      <Alert variant="success">
        <MailCheck />
        <AlertTitle>Deletion confirmation sent</AlertTitle>
        <AlertDescription>
          Check your email and open the confirmation link to permanently delete
          your account.
        </AlertDescription>
      </Alert>
    );
  }

  if (status === "error") {
    return (
      <Alert variant="destructive">
        <MailX />
        <AlertTitle>Could not send deletion email</AlertTitle>
        <AlertDescription>{errorMessage}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <AnimateIcon animateOnHover className="w-full" asChild>
          <Button variant="destructive" className="w-full cursor-pointer">
            <AnimatedTrash2 />
            Delete account
          </Button>
        </AnimateIcon>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center sm:text-left">
            <span className="inline-flex items-center justify-center sm:justify-start gap-2">
              <Trash2 className="size-5 text-destructive" />
              Delete account?
            </span>
          </DialogTitle>
          <DialogDescription>
            We will send a confirmation email before deleting anything. Once you
            open that link, your account will be permanently deleted.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" className="cursor-pointer">
              Cancel
            </Button>
          </DialogClose>
          <AnimateIcon asChild animateOnHover>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteRequest}
              disabled={status === "loading"}
              className="cursor-pointer"
            >
              <LoadingSwap
                isLoading={status === "loading"}
                className="flex items-center gap-2"
              >
                <Send />
                Send confirmation
              </LoadingSwap>
            </Button>
          </AnimateIcon>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
