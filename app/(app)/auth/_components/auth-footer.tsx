import Link from "next/link";

export function AuthFooter({
  message,
  linkText,
  linkHref,
  returnTo,
}: {
  message: string;
  linkText: string;
  linkHref: string;
  returnTo?: string;
}) {
  const href = returnTo
    ? `${linkHref}?returnTo=${encodeURIComponent(returnTo)}`
    : linkHref;

  return (
    <p className="text-sm text-muted-foreground mt-4 text-center">
      {message}{" "}
      <Link
        href={href}
        className="text-primary font-medium hover:underline hover:opacity-90 transition"
      >
        {linkText}
      </Link>
    </p>
  );
}
