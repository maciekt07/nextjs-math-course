"use client";

import { useSerwist } from "@serwist/turbopack/react";
import { RefreshCw } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const UPDATE_TOAST_ID = "pwa-update";

type LifecycleEvent = {
  isUpdate?: boolean;
};

export function PwaUpdatePrompt() {
  const { serwist } = useSerwist();

  useEffect(() => {
    if (!serwist) return;

    const handleWaiting = (event: LifecycleEvent) => {
      if (event.isUpdate === false) return;

      toast.custom(
        () => (
          <div className="select-none flex items-center gap-3 rounded-xl border bg-popover p-3 text-popover-foreground shadow-lg">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">Update available</p>
              <p className="text-xs text-muted-foreground">
                Reload to get the latest version of the app.
              </p>
            </div>
            <Button
              size="sm"
              className="cursor-pointer"
              onClick={() => serwist.messageSkipWaiting()}
            >
              <RefreshCw className="size-4" /> Reload
            </Button>
          </div>
        ),
        { id: UPDATE_TOAST_ID, duration: Number.POSITIVE_INFINITY },
      );
    };

    const handleControlling = (event: LifecycleEvent) => {
      if (event.isUpdate) window.location.reload();
    };

    serwist.addEventListener("waiting", handleWaiting);
    serwist.addEventListener("controlling", handleControlling);

    return () => {
      serwist.removeEventListener("waiting", handleWaiting);
      serwist.removeEventListener("controlling", handleControlling);
    };
  }, [serwist]);

  return null;
}
