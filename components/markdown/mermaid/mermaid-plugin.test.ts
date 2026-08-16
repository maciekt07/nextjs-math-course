import { describe, expect, it } from "vitest";
import {
  createHtmlParser,
  createTreeParser,
  findByHName,
  hChildren,
  hProps,
} from "@/tests/unit/remark-test-utils";
import { mermaid } from "./mermaid-plugin";

const parseToTree = createTreeParser(mermaid);
const parseToHtml = createHtmlParser(mermaid);

const diagram = "flowchart TD\n  A --> B";

// biome-ignore lint/style/useTemplate: it's fine
const fence = (code: string) => "```mermaid\n" + code + "\n```";

describe("mermaid plugin", () => {
  it("converts a mermaid fenced code block into a div with the diagram code", () => {
    const tree = parseToTree(fence(diagram));
    const [node] = findByHName(tree, "div");

    expect(hProps(node).className).toEqual(["mermaid-diagram"]);
    expect(hProps(node)["data-mermaid-code"]).toBe(diagram);
  });

  it("sets an empty hChildren so the code value is not rendered again", () => {
    const tree = parseToTree(fence(diagram));
    const [node] = findByHName(tree, "div");
    expect(hChildren(node)).toEqual([]);
  });

  it("does not touch code blocks in other languages", () => {
    const tree = parseToTree("```js\nconst x = 1;\n```");
    expect(findByHName(tree, "div")).toHaveLength(0);
  });

  it("does not touch plain paragraphs", () => {
    const tree = parseToTree("Just some text.");
    expect(findByHName(tree, "div")).toHaveLength(0);
  });

  it("handles multiple mermaid blocks independently", () => {
    const markdown = [
      fence("flowchart TD\n  A --> B"),
      fence("graph LR\n  X --> Y"),
    ].join("\n");

    const nodes = findByHName(parseToTree(markdown), "div");
    expect(nodes).toHaveLength(2);
    expect(hProps(nodes[0])["data-mermaid-code"]).toBe(
      "flowchart TD\n  A --> B",
    );
    expect(hProps(nodes[1])["data-mermaid-code"]).toBe("graph LR\n  X --> Y");
  });

  it("does not throw when node.data is initially undefined", () => {
    expect(() => parseToTree(fence(diagram))).not.toThrow();
  });

  it("renders to the expected final HTML output", () => {
    const html = parseToHtml(fence(diagram));

    expect(html).toContain('class="mermaid-diagram"');
    expect(html).toContain(`data-mermaid-code="${diagram}"`);
    expect(html).toContain("</div>");
  });
});
