import { Check } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { buildNoIndexMetadata } from "@/lib/seo";
import { AuthIconCard } from "../_components/auth-card";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildNoIndexMetadata({
  title: "Account Deleted",
  description: "Your account has been deleted.",
});

// BetterAuth does not redirect back here with params on failure like on other routes

export default function AccountDeletedPage() {
  return (
    <AuthIconCard
      icon={Check}
      title="Account deleted"
      description="Your account has been permanently deleted."
      variant="default"
    >
      <Button asChild className="w-full">
        <Link href="/">Go to home</Link>
      </Button>
    </AuthIconCard>
  );
}
