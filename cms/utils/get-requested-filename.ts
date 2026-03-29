export function getRequestedFilename(pathname?: string | null): string | null {
  if (!pathname?.includes("/file/")) return null;

  const filename = pathname.split("/").filter(Boolean).pop();

  return filename ? decodeURIComponent(filename) : null;
}
