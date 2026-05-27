import type { Root, RootContent } from "mdast";
import type { Plugin } from "unified";

interface RemarkSectionsOptions {
  /** heading depths that trigger a new section. Defaults to `[2]` (h2) */
  depth?: number[];
}

/**
 * Remark plugin that wraps heading-delimited content into `<section>` elements
 *
 * @example
 * remarkSections({ depth: [2, 3] })
 */
const remarkSections: Plugin<[RemarkSectionsOptions?], Root> = (
  options = {},
) => {
  const splitDepths = new Set(options.depth ?? [2]);

  return (tree) => {
    const children = tree.children;
    const sections: RootContent[] = [];
    let current: RootContent[] = [];

    const flushSection = () => {
      if (current.length === 0) return;
      sections.push({
        type: "section",
        data: { hName: "section" },
        children: current,
      } as unknown as RootContent);
      current = [];
    };

    for (const node of children) {
      if (node.type === "heading" && splitDepths.has(node.depth)) {
        flushSection();
      }
      current.push(node);
    }

    flushSection();
    tree.children = sections;
  };
};

export default remarkSections;
