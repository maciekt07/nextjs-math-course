"use client";

import type { User } from "better-auth";
import { AnimateIcon } from "@/components/animate-ui/icons/icon";
import { Settings } from "@/components/animate-ui/icons/settings";
import { Button } from "@/components/ui/button";
import { SidebarAccount } from "./sidebar-account";

interface SidebarFooterProps {
  isPending: boolean;
  onOpenSettings: () => void;
  pathname: string;
  session: { user: User } | null;
}

export function SidebarFooter({
  isPending,
  onOpenSettings,
  pathname,
  session,
}: SidebarFooterProps) {
  return (
    <div className="p-4 border-t bg-background">
      <AnimateIcon animateOnHover>
        <Button
          variant="outline"
          className="w-full mb-3 cursor-pointer"
          aria-label="Open settings"
          onClick={onOpenSettings}
        >
          <Settings className="w-4 h-4" /> Settings
        </Button>
      </AnimateIcon>

      <SidebarAccount
        isPending={isPending}
        session={session}
        pathname={pathname}
      />
    </div>
  );
}
