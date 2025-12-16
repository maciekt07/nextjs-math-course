import type { User } from "better-auth";
import { LogIn } from "lucide-react";
import Link from "next/link";
import { memo } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface SidebarAccountProps {
  isPending: boolean;
  session: { user: User } | null;
  pathname: string;
}

export const SidebarAccount = memo(
  function SidebarAccount({
    isPending,
    session,
    pathname,
  }: SidebarAccountProps) {
    return (
      <>
        {isPending ? (
          <div className="space-y-2">
            <div className="flex items-center gap-3 rounded-lg p-2 -mx-2">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="flex-1 min-w-0 space-y-1.5">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          </div>
        ) : session?.user ? (
          <div className="space-y-2">
            <Link
              href="/account"
              className="flex items-center gap-3 rounded-lg hover:bg-secondary/80 transition-all duration-200 p-2 -mx-2"
            >
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                  {session.user.name?.charAt(0).toUpperCase() ||
                    session.user.email?.charAt(0).toUpperCase() ||
                    "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-tight truncate">
                  {session.user.name || "User"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {session.user.email}
                </p>
              </div>
            </Link>
          </div>
        ) : (
          <Button asChild className="w-full h-9 my-2" size="lg">
            <Link
              href={{
                pathname: "/auth/sign-in",
                query: { returnTo: pathname },
              }}
            >
              <LogIn className="w-4 h-4" />
              Log In
            </Link>
          </Button>
        )}
      </>
    );
  },
  (prev, next) => {
    return prev.isPending === next.isPending && prev.session === next.session;
  },
);
