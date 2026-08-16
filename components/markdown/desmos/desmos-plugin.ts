import type { Root } from "mdast";
import type { LeafDirective } from "mdast-util-directive";
import { visit } from "unist-util-visit";

export interface DesmosDivProps extends React.HTMLAttributes<HTMLDivElement> {
  "data-graph-url"?: string;
  "data-no-embed"?: string;
}

/**
 * plugin to handle Desmos graph syntax in markdown
 * @example
 * ::desmos{url="https://www.desmos.com/calculator/id"}
 * ::desmos{url="https://www.desmos.com/calculator/id" noEmbed=true}
 */
export function desmos() {
  return (tree: Root) => {
    visit(tree, (node) => {
      if (node.type !== "leafDirective") return;
      const directiveNode = node as LeafDirective;
      if (directiveNode.name !== "desmos") return;

      if (!directiveNode.data) {
        directiveNode.data = {};
      }

      const graphUrl = directiveNode.attributes?.url;
      const noEmbed = directiveNode.attributes?.noEmbed === "true";

      directiveNode.data.hName = "div";
      directiveNode.data.hProperties = {
        className: "desmos-graph",
        "data-graph-url": graphUrl || "",
        "data-no-embed": noEmbed.toString(),
      };
    });
  };
}
