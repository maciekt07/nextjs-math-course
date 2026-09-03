import { Separator } from "@radix-ui/react-dropdown-menu";
import { SettingsIcon } from "lucide-react";
import { Settings } from "@/components/settings";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function SettingsDialogContent() {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle className="flex items-center justify-center gap-2 text-2xl sm:justify-start">
          <SettingsIcon className="size-6" />
          Settings
        </DialogTitle>
        <DialogDescription>
          Customize your preferences and app behavior
        </DialogDescription>
      </DialogHeader>

      <Separator />
      <Settings />
    </DialogContent>
  );
}
