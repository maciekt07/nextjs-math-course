export function getRequestedFilename(pathname?: string | null): string | null {
  if (!pathname?.includes("/file/")) return null;

  const parts = pathname.split("/file/");

  if (parts.length < 2 || !parts[1]) return null;

  const filename = parts[1].split("/").filter(Boolean).pop();

  return filename ? decodeURIComponent(filename) : null;
}
