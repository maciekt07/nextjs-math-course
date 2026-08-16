import type { Node, Root } from "mdast";
import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { type Pluggable, unified } from "unified";
import { visit } from "unist-util-visit";

type HastData = {
  hName?: string;
  hProperties?: Record<string, unknown>;
  hChildren?: unknown[];
};

const processor = (plugins: Pluggable[]) =>
  unified().use([remarkParse, ...plugins]);

export function createTreeParser(plugin: Pluggable, extras: Pluggable[] = []) {
  return (markdown: string): Root => {
    const proc = processor([...extras, plugin]);
    return proc.runSync(proc.parse(markdown)) as Root;
  };
}

// hProperties alone can lie
export function createHtmlParser(plugin: Pluggable, extras: Pluggable[] = []) {
  return (markdown: string): string =>
    String(
      processor([...extras, plugin])
        .use(remarkRehype, { allowDangerousHtml: false })
        .use(rehypeStringify)
        .processSync(markdown),
    );
}

export function findByHName(tree: Root, hName: string): Node[] {
  const found: Node[] = [];
  visit(tree, (node) => {
    const data = (node as { data?: HastData }).data;
    if (data?.hName === hName) found.push(node);
  });
  return found;
}

export function hProps(node: Node): Record<string, unknown> {
  const props = (node as { data?: HastData }).data?.hProperties;
  if (!props) throw new Error("Expected node.data.hProperties to be set.");
  return props;
}

export function hChildren(node: Node): unknown[] | undefined {
  return (node as { data?: HastData }).data?.hChildren;
}
