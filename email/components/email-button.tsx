import { Link, Section } from "@react-email/components";
import type { ReactNode } from "react";

interface EmailButtonProps {
  url: string;
  children: ReactNode;
}

export default function EmailButton({ url, children }: EmailButtonProps) {
  return (
    <Section className="text-center my-8">
      <Link
        href={url}
        className="inline-block rounded-xl bg-black px-6 py-3 text-white text-sm font-medium no-underline"
      >
        {children}
      </Link>
    </Section>
  );
}
