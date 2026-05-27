import type { Heading, Root } from "mdast";
import { visit } from "unist-util-visit";
import { createHeadingIdGenerator } from "@/lib/markdown/extract-headings";
import { getText } from "../utils";

/**
 * Remark plugin that assigns stable, unique `id` attributes to `h2` and `h3` headings.
 * {@link createHeadingIdGenerator}
 */
export function remarkHeadingIds() {
  return (tree: Root) => {
    const getHeadingId = createHeadingIdGenerator();

    visit(tree, "heading", (node: Heading) => {
      if (node.depth !== 2 && node.depth !== 3) return;

      const { id } = getHeadingId(node.depth, getText(node));
      node.data ??= {};
      node.data.hProperties = {
        ...node.data.hProperties,
        id,
      };
    });
  };
}
