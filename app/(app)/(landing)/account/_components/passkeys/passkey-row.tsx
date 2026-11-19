"use client";

import { AnimateIcon } from "@animate-ui/react/icons";
import { KeyRound, ShieldCheck } from "lucide-react";
import { useRouter } from "nextjs-toploader/app";
import { useState } from "react";
import { toast } from "sonner";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSwap } from "@/components/ui/loading-swap";
import {
  deletePasskeyAction,
  updatePasskeyAction,
} from "@/lib/actions/passkeys";
import { LIMITS } from "@/lib/constants/limits";

interface PasskeyRowProps {
  id: string;
  name: string;
  createdAtLabel: string;
  deviceType: string;
  backedUp: boolean;
}

export function PasskeyRow({
  id,
  name,
  createdAtLabel,
  deviceType,
  backedUp,
}: PasskeyRowProps) {
  const router = useRouter();
  const [renameOpen, setRenameOpen] = useState<boolean>(false);
  const [deleteOpen, setDeleteOpen] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>(name);
  const [isRenaming, setIsRenaming] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [renameError, setRenameError] = useState<string | undefined>();

  async function handleRename() {
    setIsRenaming(true);
    const result = await updatePasskeyAction(id, newName);
    setIsRenaming(false);

    if (!result.success) {
      setRenameError(result.error);
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
        <KeyRound className="size-6 shrink-0" />

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
            {deviceType === "multiDevice"
              ? "Synced passkey"
              : "Device-bound passkey"}
            {createdAtLabel && ` · Added ${createdAtLabel}`}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
            <DialogTrigger asChild>
              <AnimateIcon animateOnHover>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 cursor-pointer"
                  aria-label={`Rename ${name}`}
                >
                  <Pencil className="size-4" />
                </Button>
              </AnimateIcon>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Rename passkey</DialogTitle>
                <DialogDescription>
                  Choose a name that helps you recognize this passkey.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <Label htmlFor={`passkey-name-${id}`}>Passkey name</Label>
                <Input
                  id={`passkey-name-${id}`}
                  value={newName}
                  maxLength={LIMITS.auth.passkeyNameMaxLength}
                  disabled={isRenaming}
                  onChange={(event) => {
                    setNewName(event.target.value);
                    setRenameError(undefined);
                  }}
                />
                {renameError && (
                  <p className="text-sm text-destructive">{renameError}</p>
                )}
              </div>
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
                  type="button"
                  onClick={handleRename}
                  disabled={isRenaming}
                  className="cursor-pointer"
                >
                  <LoadingSwap isLoading={isRenaming}>Save</LoadingSwap>
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogTrigger asChild>
              <AnimateIcon animateOnHover>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 cursor-pointer hover:text-destructive"
                  aria-label={`Remove ${name}`}
                >
                  <Trash2 className="size-4" />
                </Button>
              </AnimateIcon>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Remove passkey?</DialogTitle>
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
