import type { Root } from "mdast";
import { visit } from "unist-util-visit";
import { describe, expect, it } from "vitest";
import {
  createHtmlParser,
  createTreeParser,
} from "@/tests/unit/remark-test-utils";
import { remarkHeadingIds } from "./remark-heading-ids";

const parseToTree = createTreeParser(remarkHeadingIds);
const parseToHtml = createHtmlParser(remarkHeadingIds);

const headingIds = (tree: Root): (string | undefined)[] => {
  const ids: (string | undefined)[] = [];
  visit(tree, "heading", (node) => {
    ids.push(
      (node.data as { hProperties?: { id?: string } } | undefined)?.hProperties
        ?.id,
    );
  });
  return ids;
};

describe("remarkHeadingIds plugin", () => {
  it("assigns a slug id to h2 headings", () => {
    expect(headingIds(parseToTree("## Introduction to Math"))).toEqual([
      "introduction-to-math",
    ]);
  });

  it("assigns a slug id to h3 headings", () => {
    expect(headingIds(parseToTree("### Getting Started"))).toEqual([
      "getting-started",
    ]);
  });

  it("prefixes h3 ids with the current h2 slug", () => {
    const tree = parseToTree("## Setup\n\n### Install\n\n### Configure");
    expect(headingIds(tree)).toEqual([
      "setup",
      "setup-install",
      "setup-configure",
    ]);
  });

  it("keeps h3 ids unique across different h2 sections", () => {
    const tree = parseToTree("## One\n\n### Notes\n\n## Two\n\n### Notes");
    expect(headingIds(tree)).toEqual(["one", "one-notes", "two", "two-notes"]);
  });

  it("ignores h1 and h4 headings", () => {
    const tree = parseToTree("# Title\n\n#### Detail");
    expect(headingIds(tree)).toEqual([undefined, undefined]);
  });

  it("renders the id into the final HTML", () => {
    const html = parseToHtml("## Introduction\n\nText.");
    expect(html).toContain('<h2 id="introduction">Introduction</h2>');
  });
});
