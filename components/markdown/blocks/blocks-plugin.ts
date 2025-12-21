import type { Root } from "mdast";
import type {
  ContainerDirective,
  LeafDirective,
  TextDirective,
} from "mdast-util-directive";
import { visit } from "unist-util-visit";
import {
  type BlockType,
  VALID_BLOCK_TYPES,
} from "@/components/markdown/blocks/callout-config";

type DirectiveNode = ContainerDirective | LeafDirective | TextDirective;

export interface CalloutDivProps extends React.HTMLAttributes<HTMLDivElement> {
  "data-block-type"?: string;
  "data-block-title"?: string;
  "data-block-description"?: string;
}

/**
 * plugin to handle :::blockType ... ::: syntax in markdown
 * @example
 * :::note
 * This is a note
 * :::
 *
 * :::tip{title="Remember"}
 * This is a tip with a custom title
 * :::
 */
export function blocks() {
  return (tree: Root) => {
    visit(tree, (node) => {
      if (
        node.type === "containerDirective" ||
        node.type === "leafDirective" ||
        node.type === "textDirective"
      ) {
        const directiveNode = node as DirectiveNode;

        if (VALID_BLOCK_TYPES.includes(directiveNode.name as BlockType)) {
          if (!directiveNode.data) {
            directiveNode.data = {};
          }

          const blockType = directiveNode.name as BlockType;
          const title = directiveNode.attributes?.title;

          directiveNode.data.hName = "div";
          directiveNode.data.hProperties = {
            className: "callout-block",
            "data-block-type": blockType,
            ...(title && { "data-block-title": title }),
          };
        }
      }
    });
  };
}
