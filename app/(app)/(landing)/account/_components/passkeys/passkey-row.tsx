"use client";

import { AnimateIcon } from "@animate-ui/react/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { Ellipsis, ShieldCheck } from "lucide-react";
import { useRouter } from "nextjs-toploader/app";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { Pencil } from "@/components/animate-ui/icons/pencil";
import { Trash2 } from "@/components/animate-ui/icons/trash-2";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  deletePasskeyAction,
  updatePasskeyAction,
} from "@/lib/actions/passkeys";
import { passkeyNameSchema } from "@/lib/auth/auth-validation";
import { LIMITS } from "@/lib/constants/limits";
import { PasskeyProviderIcon } from "./passkey-provider-icon";

const renamePasskeySchema = z.object({
  name: passkeyNameSchema,
});

type RenamePasskeySchema = z.infer<typeof renamePasskeySchema>;

interface PasskeyRowProps {
  id: string;
  name: string;
  createdAtLabel: string;
  deviceType: string;
  backedUp: boolean;
  providerName?: string;
  providerIcon?: string;
}

export function PasskeyRow({
  id,
  name,
  createdAtLabel,
  deviceType,
  backedUp,
  providerName,
  providerIcon,
}: PasskeyRowProps) {
  const router = useRouter();
  const [renameOpen, setRenameOpen] = useState<boolean>(false);
  const [deleteOpen, setDeleteOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const renameForm = useForm<RenamePasskeySchema>({
    resolver: zodResolver(renamePasskeySchema),
    defaultValues: { name },
  });

  const { isSubmitting: isRenaming } = renameForm.formState;

  function handleRenameOpenChange(nextOpen: boolean) {
    setRenameOpen(nextOpen);
    if (nextOpen) {
      renameForm.reset({ name });
    }
  }

  async function handleRename(values: RenamePasskeySchema) {
    const result = await updatePasskeyAction(id, values.name);

    if (!result.success) {
      renameForm.setError("name", { message: result.error });
      return;
    }

    setRenameOpen(false);
    toast.success("Passkey renamed");
    router.refresh();
  }

  async function handleDelete() {
    setIsDeleting(true);
    const result = await deletePasskeyAction(id);
    setIsDeleting(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    setDeleteOpen(false);
    toast.success("Passkey removed");
    router.refresh();
  }

  return (
    <div className="rounded-lg border bg-card shadow-xs">
      <div className="flex items-center gap-3 p-4">
        <PasskeyProviderIcon icon={providerIcon} providerName={providerName} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="truncate text-sm font-medium leading-none">
              {name}
            </span>
            {backedUp && (
              <Badge
                variant="secondary"
                className="h-4 gap-1 px-1.5 text-[10px] font-medium"
              >
                <ShieldCheck className="size-2.5" />
                Synced
              </Badge>
            )}
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">
            {providerName && (
              <span className="font-medium text-foreground/70">
                {providerName}
              </span>
            )}
            {providerName && " · "}
            {deviceType === "multiDevice"
              ? "Synced passkey"
              : "Device-bound passkey"}
            {createdAtLabel && ` · Added ${createdAtLabel}`}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 cursor-pointer"
                aria-label={`Actions for ${name}`}
              >
                <Ellipsis className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="cursor-pointer p-0"
                onSelect={() => setRenameOpen(true)}
              >
                <AnimateIcon
                  animateOnHover
                  className="flex w-full items-center gap-2 px-2 py-1.5"
                >
                  <Pencil />
                  Rename
                </AnimateIcon>
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                className="cursor-pointer p-0"
                onSelect={() => setDeleteOpen(true)}
              >
                <AnimateIcon
                  animateOnHover
                  className="flex w-full items-center gap-2 px-2 py-1.5"
                >
                  <Trash2 className="text-destructive" />
                  Remove
                </AnimateIcon>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Dialog open={renameOpen} onOpenChange={handleRenameOpenChange}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Rename passkey</DialogTitle>
                <DialogDescription>
                  Choose a name that helps you recognize this passkey.
                </DialogDescription>
              </DialogHeader>
              <Form {...renameForm}>
                <form
                  onSubmit={renameForm.handleSubmit(handleRename)}
                  className="space-y-4"
                >
                  <FormField
                    control={renameForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Passkey name</FormLabel>
                        <FormControl>
                          <Input
                            maxLength={LIMITS.auth.passkeyNameMaxLength}
                            disabled={isRenaming}
                            {...field}
                          />
                        </FormControl>
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
                        disabled={isRenaming}
                      >
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button
                      type="submit"
                      disabled={isRenaming}
                      className="cursor-pointer"
                    >
                      <LoadingSwap isLoading={isRenaming}>Save</LoadingSwap>
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  <span className="inline-flex items-center justify-center sm:justify-start gap-2">
                    <Trash2 className="size-5 text-destructive" />
                    Remove passkey?
                  </span>
                </DialogTitle>
                <DialogDescription>
                  You will no longer be able to use &ldquo;{name}&rdquo; to sign
                  in. Other sign-in methods on your account still work.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="cursor-pointer"
                    disabled={isDeleting}
                  >
                    Cancel
                  </Button>
                </DialogClose>
                <AnimateIcon animateOnHover>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="cursor-pointer w-full"
                  >
                    <LoadingSwap
                      isLoading={isDeleting}
                      className="flex items-center gap-2"
                    >
                      <Trash2 />
                      Remove passkey
                    </LoadingSwap>
                  </Button>
                </AnimateIcon>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
