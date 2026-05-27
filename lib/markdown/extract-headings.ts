import { stripBasicMarkdown } from "@/lib/markdown/strip-markdown";
import { slug } from "../slugify";

export interface Heading {
  id: string;
  text: string;
  level: number;
}

export function createHeadingIdGenerator() {
  let currentH2 = "";

  return (level: number, rawText: string) => {
    const text = stripBasicMarkdown(rawText);

    if (level === 2) {
      currentH2 = text;
      return { id: slug(text), text };
    }

    return {
      id: slug(currentH2 ? `${currentH2}-${text}` : text),
      text,
    };
  };
}

export function extractHeadings(
  markdown: string | undefined | null,
): Heading[] {
  if (!markdown) return [];
  const regex = /^(#{2,3})\s+(.*)$/gm;
  const headings: Heading[] = [];
  let match = regex.exec(markdown);
  const getHeadingId = createHeadingIdGenerator();

  while (match !== null) {
    const level = match[1].length; // ## -> 2, ### -> 3
    const rawText = match[2].trim();
    const text = stripBasicMarkdown(rawText);
    const { id } = getHeadingId(level, rawText);

    headings.push({ id, text, level });

    match = regex.exec(markdown);
  }

  return headings;
}
