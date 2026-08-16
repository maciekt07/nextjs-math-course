import remarkDirective from "remark-directive";
import { describe, expect, it } from "vitest";
import {
  createHtmlParser,
  createTreeParser,
  findByHName,
  hProps,
} from "@/tests/unit/remark-test-utils";
import { blocks } from "./blocks-plugin";

const parseToTree = createTreeParser(blocks, [remarkDirective]);
const parseToHtml = createHtmlParser(blocks, [remarkDirective]);

describe("blocks plugin", () => {
  it("converts a container directive into a div with the block type", () => {
    const tree = parseToTree(":::note\nThis is a note.\n:::");
    const [node] = findByHName(tree, "div");

    expect(hProps(node).className).toBe("callout-block");
    expect(hProps(node)["data-block-type"]).toBe("note");
  });

  it("does not set a title attribute when title is omitted", () => {
    const tree = parseToTree(":::note\nThis is a note.\n:::");
    const [node] = findByHName(tree, "div");
    expect(hProps(node)["data-block-title"]).toBeUndefined();
  });

  it("sets data-block-title when a title is provided", () => {
    const tree = parseToTree(':::tip{title="Remember"}\nA tip.\n:::');
    const [node] = findByHName(tree, "div");
    expect(hProps(node)["data-block-title"]).toBe("Remember");
  });

  it("supports the card block type", () => {
    const tree = parseToTree(":::card\nYou will learn.\n:::");
    const [node] = findByHName(tree, "div");
    expect(hProps(node)["data-block-type"]).toBe("card");
  });

  it("ignores unknown block names", () => {
    const tree = parseToTree(":::foobar\nNot a block.\n:::");
    expect(findByHName(tree, "div")).toHaveLength(0);
  });

  it("does not touch directives belonging to other plugins", () => {
    const tree = parseToTree('::desmos{url="https://example.com"}');
    expect(findByHName(tree, "div")).toHaveLength(0);
  });

  it("handles multiple blocks independently with their own titles", () => {
    const markdown = [
      ":::note",
      "First note.",
      ":::",
      "",
      ':::warning{title="Heads up"}',
      "A warning.",
      ":::",
    ].join("\n");

    const nodes = findByHName(parseToTree(markdown), "div");
    expect(nodes).toHaveLength(2);
    expect(hProps(nodes[0])["data-block-type"]).toBe("note");
    expect(hProps(nodes[0])["data-block-title"]).toBeUndefined();
    expect(hProps(nodes[1])["data-block-type"]).toBe("warning");
    expect(hProps(nodes[1])["data-block-title"]).toBe("Heads up");
  });

  it("does not throw when directiveNode.data is initially undefined", () => {
    expect(() => parseToTree(":::note\nHi.\n:::")).not.toThrow();
  });

  it("renders to the expected final HTML output", () => {
    const html = parseToHtml(':::tip{title="Remember"}\nA tip.\n:::');

    expect(html).toContain('class="callout-block"');
    expect(html).toContain('data-block-type="tip"');
    expect(html).toContain('data-block-title="Remember"');
    expect(html).toContain("<p>A tip.</p>");
  });
});
