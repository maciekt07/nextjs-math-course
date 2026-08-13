export function getId(
  value: string | null | undefined | { id: string },
): string | null {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}
