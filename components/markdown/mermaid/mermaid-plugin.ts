import type { Code, Root } from "mdast";
import { visit } from "unist-util-visit";

export interface MermaidDivProps extends React.HTMLAttributes<HTMLDivElement> {
  "data-mermaid-code"?: string;
}

/**
 * plugin to handle Mermaid diagrams in fenced code blocks
 * @see https://mermaid.js.org/intro/
 * @example
 * ```mermaid
 * flowchart TD
 *   A --> B
 * ```
 */
export function mermaid() {
  return (tree: Root) => {
    visit(tree, "code", (node: Code) => {
      if (node.lang !== "mermaid") return;

      if (!node.data) {
        node.data = {};
      }

      node.data.hName = "div";
      node.data.hProperties = {
        className: "mermaid-diagram",
        "data-mermaid-code": node.value,
      };
      node.data.hChildren = [];
    });
  };
}
