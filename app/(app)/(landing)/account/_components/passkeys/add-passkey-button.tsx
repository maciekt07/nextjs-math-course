"use client";

import { AnimateIcon } from "@animate-ui/react/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import Bowser from "bowser";
import { UserKey } from "lucide-react";
import { useRouter } from "nextjs-toploader/app";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { authClient } from "@/lib/auth/auth-client";
import { passkeyNameSchema } from "@/lib/auth/auth-validation";
import { LIMITS } from "@/lib/constants/limits";

const addPasskeySchema = z.object({
  name: passkeyNameSchema,
});

type AddPasskeySchema = z.infer<typeof addPasskeySchema>;

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

  const form = useForm<AddPasskeySchema>({
    resolver: zodResolver(addPasskeySchema),
    defaultValues: { name: "" },
  });

  const { isSubmitting, errors } = form.formState;

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen) {
      form.reset({ name: getDefaultPasskeyName() });
    }
  }

  async function handleAddPasskey(values: AddPasskeySchema) {
    const { error: addError } = await authClient.passkey.addPasskey({
      name: values.name,
    });

    if (addError) {
      const code = "code" in addError ? addError.code : undefined;
      if (
        code === "ERROR_CEREMONY_ABORTED" ||
        code === "REGISTRATION_CANCELLED"
      ) {
        return;
      }

      form.setError("name", {
        message: getErrorMessage(addError) ?? "Failed to add passkey",
      });
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

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleAddPasskey)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Passkey name</FormLabel>
                  <FormControl>
                    <Input
                      maxLength={LIMITS.auth.passkeyNameMaxLength}
                      placeholder="My passkey"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  {!errors.name && (
                    <p className="text-xs text-muted-foreground">
                      A name helps you identify this passkey later.
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="cursor-pointer"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </DialogClose>
              <AnimateIcon animateOnHover>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="cursor-pointer w-full"
                >
                  <LoadingSwap
                    isLoading={isSubmitting}
                    className="flex items-center gap-2"
                  >
                    <Fingerprint />
                    Add passkey
                  </LoadingSwap>
                </Button>
              </AnimateIcon>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
