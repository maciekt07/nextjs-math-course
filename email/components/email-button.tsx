import { Link, Section } from "@react-email/components";
import type { ReactNode } from "react";
import { cn } from "@/lib/ui";

interface EmailButtonProps {
  url: string;
  children: ReactNode;
  className?: string;
}

export default function EmailButton({
  url,
  children,
  className,
}: EmailButtonProps) {
  return (
    <Section className="text-center my-8">
      <Link
        href={url}
        className={cn(
          "inline-block rounded-xl bg-[#0A0A0A] px-6 py-3 text-white text-sm font-medium no-underline",
          className,
        )}
      >
        {children}
      </Link>
    </Section>
  );
}
