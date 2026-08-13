import "client-only"; // mermaid can't validate server side

import katex from "katex";
import mermaid from "mermaid";
import {
  type BlockType,
  VALID_BLOCK_TYPES,
} from "@/components/markdown/blocks/callout-config";

export interface MarkdownError {
  type: "latex" | "mermaid" | "block";
  message: string;
}

const latexRegex = /\$\$([\s\S]*?)\$\$|\$([^\n$]+?)\$/g;
const mermaidRegex = /```mermaid\s*\n([\s\S]*?)```/g;
const blockRegex = /:::(\w+)(?:\{[^}]*\})?/g;

/**
 * validates markdown content for latex, mermaid, and callout block syntax errors
 *
 * @param markdown - raw markdown source to check
 * @returns all detected errors, empty array if the content is valid
 */
export async function validateMarkdown(
  markdown: string,
): Promise<MarkdownError[]> {
  const errors: MarkdownError[] = [];

  // latex
  for (const match of markdown.matchAll(latexRegex)) {
    const math = match[1] ?? match[2];

    if (!math) continue;

    try {
      katex.renderToString(math, {
        throwOnError: true,
      });
    } catch (e) {
      errors.push({
        type: "latex",

        message: e instanceof Error ? e.message : "Invalid LaTeX",
      });
    }
  }

  // mermaid
  for (const match of markdown.matchAll(mermaidRegex)) {
    const diagram = match[1];

    if (!diagram) continue;

    try {
      await mermaid.parse(diagram);
    } catch (e) {
      errors.push({
        type: "mermaid",

        message: e instanceof Error ? e.message : "Invalid Mermaid",
      });
    }
  }

  // :::blocks
  for (const match of markdown.matchAll(blockRegex)) {
    const blockType = match[1];

    if (!blockType) continue;

    if (!VALID_BLOCK_TYPES.includes(blockType as BlockType)) {
      errors.push({
        type: "block",

        message: `Unknown callout block type "${blockType}". Available: ${VALID_BLOCK_TYPES.map((type) => `"${type}"`).join(", ")}`,
      });
    }
  }

  return errors;
}
