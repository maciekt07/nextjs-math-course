import { Separator } from "@radix-ui/react-dropdown-menu";
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
        <DialogTitle className="text-2xl">Settings</DialogTitle>
        <DialogDescription>
          Customize your preferences and app behavior
        </DialogDescription>
      </DialogHeader>

      <Separator />
      <Settings />
    </DialogContent>
  );
}
