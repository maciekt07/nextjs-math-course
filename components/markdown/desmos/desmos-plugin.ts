import type { Root } from "mdast";
import type {
  ContainerDirective,
  LeafDirective,
  TextDirective,
} from "mdast-util-directive";
import { visit } from "unist-util-visit";

type DirectiveNode = ContainerDirective | LeafDirective | TextDirective;

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
      if (
        node.type === "containerDirective" ||
        node.type === "leafDirective" ||
        node.type === "textDirective"
      ) {
        const directiveNode = node as DirectiveNode;

        if (directiveNode.name === "desmos") {
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
        }
      }
    });
  };
}
