import Bowser from "bowser";
import { AlertCircle, Globe, Laptop, Shield, Smartphone } from "lucide-react";
import { headers } from "next/headers";
import { Badge } from "@/components/ui/badge";
import { auth } from "@/lib/auth/auth";
import { getServerSession } from "@/lib/auth/get-session";
import { RevokeButton } from "./revoke-button";

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

export default async function ActiveSessions() {
  const h = await headers();

  const [sessionResult, currentSessionResult] = await Promise.all([
    auth.api.listSessions({
      headers: h,
      query: {
        disableCookieCache: true,
      },
    }),
    getServerSession(),
  ]);

  const sessions = sessionResult ?? [];
  const currentToken = currentSessionResult?.session?.token;

  if (!sessions.length) {
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
        const isCurrent = session.token === currentToken;
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
                    {session.ipAddress
                      ?.split(/[:.]/)
                      .every((seg) => /^0+$/.test(seg))
                      ? "Unknown IP"
                      : (session.ipAddress ?? "Unknown IP")}
                  </span>
                </div>
              </div>

              {!isCurrent && <RevokeButton token={session.token} />}
            </div>
          </div>
        );
      })}
    </div>
  );
}
