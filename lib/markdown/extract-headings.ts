import { slug } from "../slugify";

export interface Heading {
  id: string;
  text: string;
  level: number;
}

export function extractHeadings(markdown: string): Heading[] {
  const regex: RegExp = /^(#{2,3})\s+(.*)$/gm;
  const headings: Heading[] = [];

  let match: RegExpExecArray | null = regex.exec(markdown);

  while (match !== null) {
    const level = match[1].length; // ## -> 2, ### -> 3
    const text = match[2].trim();
    const id = slug(text);

    headings.push({ id, text, level });

    match = regex.exec(markdown);
  }

  return headings;
}
