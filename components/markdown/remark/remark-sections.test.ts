import type { Root } from "mdast";
import { visit } from "unist-util-visit";
import { describe, expect, it } from "vitest";
import { getText } from "@/lib/markdown/get-text";
import {
  createHtmlParser,
  createTreeParser,
  findByHName,
} from "@/tests/unit/remark-test-utils";
import remarkSections from "./remark-sections";

const parseToTree = createTreeParser(remarkSections);
const parseToHtml = createHtmlParser(remarkSections);
const parseToTreeAtDepth = (depth: number[]) =>
  createTreeParser([remarkSections, { depth }]);

const sectionHeadingTexts = (tree: Root): string[][] =>
  findByHName(tree, "section").map((section) => {
    const texts: string[] = [];
    visit(section, "heading", (node) => {
      texts.push(getText(node));
    });
    return texts;
  });

describe("remarkSections plugin", () => {
  it("wraps content between h2 headings into separate sections", () => {
    const tree = parseToTree("## First\n\nText one.\n\n## Second\n\nText two.");
    expect(sectionHeadingTexts(tree)).toEqual([["First"], ["Second"]]);
  });

  it("puts content before the first heading into the first section", () => {
    const tree = parseToTree("Intro paragraph.\n\n## Main\n\nBody.");
    expect(sectionHeadingTexts(tree)).toEqual([[], ["Main"]]);
  });

  it("wraps everything in one section when there are no headings", () => {
    const tree = parseToTree("Just a paragraph.");
    expect(findByHName(tree, "section")).toHaveLength(1);
  });

  it("splits on h3 when configured via options", () => {
    const tree = parseToTreeAtDepth([3])("## H2\n\n### H3\n\nText.\n\n## Next");
    expect(sectionHeadingTexts(tree)).toEqual([["H2"], ["H3", "Next"]]);
  });

  it("supports multiple split depths", () => {
    const tree = parseToTreeAtDepth([2, 3])("## A\n\n### B\n\n## C");
    expect(sectionHeadingTexts(tree)).toEqual([["A"], ["B"], ["C"]]);
  });

  it("renders sections to the final HTML", () => {
    const html = parseToHtml("## First\n\nText.\n\n## Second\n\nMore.");
    expect(html.match(/<section>/g)).toHaveLength(2);
    expect(html).toContain("<h2>First</h2>");
    expect(html).toContain("<h2>Second</h2>");
  });
});
