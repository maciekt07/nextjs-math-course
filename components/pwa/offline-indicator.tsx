"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { WifiOff } from "@/components/animate-ui/icons/wifi-off";

export function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState<boolean>(false);

  useEffect(() => {
    const update = () => setIsOffline(!navigator.onLine);

    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);

    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.2 }}
          className="pointer-events-none fixed inset-x-0 bottom-[calc(1.5rem+env(safe-area-inset-bottom))] z-[60] mx-auto flex w-fit items-center gap-2 rounded-full border bg-background/70 px-4 py-2 text-sm shadow-lg backdrop-blur text-muted-foreground"
        >
          <WifiOff
            animation="off"
            animate
            className="size-4.5 text-orange-600 dark:text-orange-500"
          />
          You're offline
        </motion.div>
      )}
    </AnimatePresence>
  );
}
