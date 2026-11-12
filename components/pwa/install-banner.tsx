"use client";

import { X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { toast } from "sonner";
import { Download } from "@/components/animate-ui/icons/download";
import { AnimateIcon } from "@/components/animate-ui/icons/icon";
import { useInstallPrompt } from "@/hooks/use-install-prompt";

export function InstallBanner() {
  const { canInstall, isIos, isStandalone, isDismissed, install, dismiss } =
    useInstallPrompt();
  const prefersReducedMotion = useReducedMotion();
  const reducedMotion = prefersReducedMotion ?? false;

  const visible = !isStandalone && !isDismissed && (canInstall || isIos);

  const handleInstall = async () => {
    if (canInstall) {
      await install();
      return;
    }

    toast("Install this app", {
      description: "Tap Share, then “Add to Home Screen”.",
      duration: 8000,
    });
  };

  return (
    <AnimatePresence initial={false}>
      {visible && (
        <motion.div
          initial={reducedMotion ? false : { height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={reducedMotion ? undefined : { height: 0, opacity: 0 }}
          transition={{
            duration: reducedMotion ? 0 : 0.2,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          className="overflow-hidden"
        >
          <motion.div
            initial={reducedMotion ? false : { y: 16 }}
            animate={{ y: 0 }}
            exit={reducedMotion ? undefined : { y: 16 }}
            transition={{
              duration: reducedMotion ? 0 : 0.2,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className="flex items-center border-t bg-background"
          >
            <AnimateIcon
              animateOnHover
              className="flex w-full items-center justify-between transition-colors duration-200 hover:bg-muted/70"
            >
              <button
                type="button"
                onClick={handleInstall}
                className="group flex min-w-0 flex-1 cursor-pointer items-center gap-3 px-4 py-3 text-left"
              >
                <Download
                  animation="default-loop"
                  className="size-5 shrink-0"
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium leading-tight">
                    Install app as PWA
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    Add to your home screen
                  </span>
                </span>
              </button>

              <button
                type="button"
                aria-label="Dismiss install banner"
                onClick={dismiss}
                className="mr-3 ml-2 cursor-pointer rounded-full p-1.5 text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-foreground"
              >
                <X className="size-5 sm:size-4" />
              </button>
            </AnimateIcon>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
