import { AlertTriangle, Link2Off, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { buildNoIndexMetadata } from "@/lib/seo";
import { AuthIconCard } from "../_components/auth-card";

interface PageProps {
  searchParams: Promise<{
    error?: string;
  }>;
}

type ErrorConfig = {
  icon: LucideIcon;
  title: string;
  description: React.ReactNode;
};

export const metadata = buildNoIndexMetadata({
  title: "Authentication Error",
  description:
    "There was a problem completing authentication. Please try again.",
});

const ERROR_MAP = {
  account_not_linked: {
    icon: Link2Off,
    title: "Account not linked",
    description:
      "An account with this email already exists using a different sign-in method. Please sign in using the original provider.",
  },
} as const satisfies Record<string, ErrorConfig>;

export default async function AuthErrorPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const errorCode = params?.error;

  const error =
    errorCode && errorCode in ERROR_MAP
      ? ERROR_MAP[errorCode as keyof typeof ERROR_MAP]
      : null;

  const Icon = error?.icon ?? AlertTriangle;

  return (
    <AuthIconCard
      variant="destructive"
      icon={Icon}
      title={error?.title ?? "Authentication error"}
      description={
        error?.description ?? (
          <div className="flex items-center flex-col">
            <span>Something went wrong</span>
            {errorCode && (
              <>
                <br />
                <span className="text-sm font-mono text-white bg-black p-2 rounded-sm">
                  Error code: <code>{errorCode}</code>
                </span>
              </>
            )}
          </div>
        )
      }
    >
      <Button asChild className="w-full">
        <Link href="/">Go to home</Link>
      </Button>
    </AuthIconCard>
  );
}
