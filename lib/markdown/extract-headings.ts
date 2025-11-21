import { slug } from "../slugify";
import { stripMarkdown } from "./strip";

export interface Heading {
  id: string;
  text: string;
  level: number;
}

export function extractHeadings(markdown: string): Heading[] {
  const regex = /^(#{2,3})\s+(.*)$/gm;
  const headings: Heading[] = [];
  let match = regex.exec(markdown);

  let currentH2 = "";

  while (match !== null) {
    const level = match[1].length; // ## -> 2, ### -> 3
    const rawText = match[2].trim();
    const text = stripMarkdown(rawText);

    let id = "";
    if (level === 2) {
      currentH2 = text;
      id = slug(text);
    } else {
      id = slug(`${currentH2}-${text}`);
    }

    headings.push({ id, text, level });

    match = regex.exec(markdown);
  }

  return headings;
}
