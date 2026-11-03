import { WifiOff } from "lucide-react";
import type { Metadata } from "next";
import { EmptyState, EmptyStateCenterWrapper } from "@/components/empty-state";
import { OfflineActions } from "@/components/pwa/offline-actions";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = buildNoIndexMetadata({
  title: "You're offline",
  description:
    "This page isn't available without an internet connection. Check your connection and try again.",
});

export const dynamic = "force-static";

export default function OfflinePage() {
  return (
    <main>
      <EmptyStateCenterWrapper>
        <EmptyState
          icon={<WifiOff />}
          title="You're offline"
          description="This page isn't available without an internet connection. Check your connection and try again."
          action={<OfflineActions />}
        />
      </EmptyStateCenterWrapper>
    </main>
  );
}
