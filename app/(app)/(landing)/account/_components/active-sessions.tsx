"use client";

import type { Session } from "better-auth";
import Bowser from "bowser";
import { AlertCircle, Globe, Laptop, Shield, Smartphone } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth/auth-client";

export default function ActiveSessions({
  currentSession,
}: {
  currentSession: Session;
}) {
  const [sessions, setSessions] = useState<Session[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [revoking, setRevoking] = useState<string | null>(null);

  async function loadSessions() {
    try {
      const result = await authClient.listSessions();
      setSessions((result?.data ?? []) as Session[]);
    } finally {
      setLoading(false);
    }
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: safe
  useEffect(() => {
    loadSessions();
  }, []);

  async function revokeSession(token: string) {
    try {
      setRevoking(token);
      await authClient.revokeSession({ token });
      await loadSessions();
    } finally {
      setRevoking(null);
    }
  }

  function parseDevice(userAgent?: string | null) {
    if (!userAgent) {
      return { name: "Unknown device", os: "Unknown OS", type: "desktop" };
    }
    const parser = Bowser.getParser(userAgent);
    return {
      name: parser.getBrowserName() ?? "Unknown browser",
      os: parser.getOSName() ?? "Unknown OS",
      type: parser.getPlatformType() ?? "desktop",
    };
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        {[...Array(2)].map((_, i) => (
          <Skeleton
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
            key={i}
            className="h-[72px] rounded-md"
          />
        ))}
      </div>
    );
  }

  if (!sessions?.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-8 text-center">
        <AlertCircle className="size-5 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          No active sessions found.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {sessions.map((session) => {
        const device = parseDevice(session.userAgent);
        const isCurrent = session.token === currentSession.token;
        const isRevoking = revoking === session.token;
        const Icon =
          device.type === "mobile" || device.type === "tablet"
            ? Smartphone
            : Laptop;

        return (
          <div
            key={session.token}
            className="rounded-lg border bg-card shadow-xs"
          >
            <div className="flex items-center gap-3 p-4">
              <Icon className="size-6 shrink-0" />

              <div className="min-w-0 flex-1">
                {/* row 1 */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-sm font-medium leading-none">
                    {device.name}
                  </span>
                  {isCurrent && (
                    <Badge
                      variant="default"
                      className="h-4 px-1.5 text-[10px] font-semibold tracking-wide"
                    >
                      Current
                    </Badge>
                  )}
                  <Badge
                    variant="secondary"
                    className="h-4 px-1.5 text-[10px] font-medium"
                  >
                    Active
                  </Badge>
                </div>

                {/* row 2 */}
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Shield className="size-3 shrink-0" />
                    {device.os}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Globe className="size-3 shrink-0" />
                    <span className="text-xs text-muted-foreground">
                      {session.ipAddress
                        ?.split(/[:.]/)
                        .every((seg) => /^0+$/.test(seg))
                        ? "Unknown IP"
                        : (session.ipAddress ?? "Unknown IP")}
                    </span>
                  </span>
                </div>
              </div>

              {!isCurrent && (
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={isRevoking}
                  onClick={() => revokeSession(session.token)}
                  className="cursor-pointer text-xs"
                >
                  <LoadingSwap isLoading={isRevoking}>Revoke</LoadingSwap>
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
