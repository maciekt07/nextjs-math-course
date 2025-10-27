import Link from "next/link";

export function AuthFooter({
  message,
  linkText,
  linkHref,
}: {
  message: string;
  linkText: string;
  linkHref: string;
}) {
  return (
    <p className="text-sm text-muted-foreground mt-4 text-center">
      {message}{" "}
      <Link
        href={linkHref}
        className="text-primary font-medium hover:underline hover:opacity-90 transition"
      >
        {linkText}
      </Link>
    </p>
  );
}
