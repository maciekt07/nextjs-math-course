export function stripMarkdown(md: string): string {
  return md
    .replace(/[*_~`]/g, "") //basic markdown symbols
    .replace(/\[(.*?)\]\(.*?\)/g, "$1") // links
    .trim();
}
