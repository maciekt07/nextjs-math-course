"use client";

import { ChevronLeft, PanelLeft, PanelLeftClose } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { startTransition } from "react";
import { AnimateIcon } from "@/components/animate-ui/icons/icon";
import { Settings } from "@/components/animate-ui/icons/settings";
import { ThemeSelect } from "@/components/theme-select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/ui";

interface SidebarControlsProps {
  open: boolean;
  prefersReducedMotion: boolean;
  onOpenSettings: () => void;
  onToggleSidebar: () => void;
}

export function SidebarControls({
  open,
  prefersReducedMotion,
  onOpenSettings,
  onToggleSidebar,
}: SidebarControlsProps) {
  return (
    <>
      <div className="flex items-center flex-row-reverse fixed top-4 right-4 z-50 gap-3">
        <ThemeSelect />
        <AnimatePresence>
          {!open && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
            >
              <AnimateIcon animateOnHover>
                <Button
                  variant="outline"
                  size="icon"
                  className="cursor-pointer"
                  onClick={onOpenSettings}
                >
                  <Settings />
                </Button>
              </AnimateIcon>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="fixed top-4 left-4 z-50 flex items-center gap-3">
        <Button
          variant={open ? "ghost" : "outline"}
          size="icon"
          aria-label="Toggle Sidebar"
          onClick={() => startTransition(onToggleSidebar)}
          className={cn(
            "cursor-pointer bg-background",
            !open && "backdrop-blur-md",
          )}
        >
          {open ? (
            <PanelLeftClose className="w-5 h-5" />
          ) : (
            <PanelLeft className="w-5 h-5" />
          )}
        </Button>

        <AnimatePresence mode="wait">
          {!open && (
            <motion.div
              key="home-button"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
              className="rounded-md"
            >
              <Button variant="outline" asChild className="backdrop-blur-md">
                <Link href="/">
                  <ChevronLeft className="w-4 h-4" />
                  Home
                </Link>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
