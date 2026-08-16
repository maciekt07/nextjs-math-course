import remarkDirective from "remark-directive";
import { describe, expect, it } from "vitest";
import {
  createHtmlParser,
  createTreeParser,
  findByHName,
  hProps,
} from "@/tests/unit/remark-test-utils";
import { desmos } from "./desmos-plugin";

const parseToTree = createTreeParser(desmos, [remarkDirective]);
const parseToHtml = createHtmlParser(desmos, [remarkDirective]);

describe("desmos plugin", () => {
  it("converts a directive with a url into a div with the correct data attributes", () => {
    const tree = parseToTree(
      '::desmos{url="https://www.desmos.com/calculator/abc123"}',
    );
    const [node] = findByHName(tree, "div");
    const props = hProps(node);

    expect(props.className).toBe("desmos-graph");
    expect(props["data-graph-url"]).toBe(
      "https://www.desmos.com/calculator/abc123",
    );
    expect(props["data-no-embed"]).toBe("false");
  });

  it("sets data-no-embed to true when noEmbed=true is passed", () => {
    const tree = parseToTree(
      '::desmos{url="https://www.desmos.com/calculator/abc123" noEmbed="true"}',
    );
    const [node] = findByHName(tree, "div");
    expect(hProps(node)["data-no-embed"]).toBe("true");
  });

  it("defaults data-no-embed to false when noEmbed is omitted", () => {
    const tree = parseToTree(
      '::desmos{url="https://www.desmos.com/calculator/xyz"}',
    );
    const [node] = findByHName(tree, "div");
    expect(hProps(node)["data-no-embed"]).toBe("false");
  });

  it("treats any noEmbed value other than the string 'true' as false", () => {
    const tree = parseToTree(
      '::desmos{url="https://www.desmos.com/calculator/xyz" noEmbed="yes"}',
    );
    const [node] = findByHName(tree, "div");
    expect(hProps(node)["data-no-embed"]).toBe("false");
  });

  it("sets data-graph-url to an empty string when url is missing", () => {
    const tree = parseToTree("::desmos");
    const [node] = findByHName(tree, "div");
    expect(hProps(node)["data-graph-url"]).toBe("");
  });

  it("does not touch directives with a different name", () => {
    const tree = parseToTree('::note{title="hi"}');
    expect(findByHName(tree, "div")).toHaveLength(0);
  });

  it("ignores the container (:::) form", () => {
    const tree = parseToTree(
      ':::desmos{url="https://www.desmos.com/calculator/abc"}\ncontent\n:::',
    );
    expect(findByHName(tree, "div")).toHaveLength(0);
  });

  it("ignores the text (:) form", () => {
    const tree = parseToTree(
      ':desmos{url="https://www.desmos.com/calculator/abc"}',
    );
    expect(findByHName(tree, "div")).toHaveLength(0);
  });

  it("handles multiple desmos directives independently", () => {
    const markdown = [
      '::desmos{url="https://www.desmos.com/calculator/one"}',
      "",
      '::desmos{url="https://www.desmos.com/calculator/two" noEmbed="true"}',
    ].join("\n");

    const nodes = findByHName(parseToTree(markdown), "div");
    expect(nodes).toHaveLength(2);
    expect(hProps(nodes[0])["data-graph-url"]).toBe(
      "https://www.desmos.com/calculator/one",
    );
    expect(hProps(nodes[0])["data-no-embed"]).toBe("false");
    expect(hProps(nodes[1])["data-graph-url"]).toBe(
      "https://www.desmos.com/calculator/two",
    );
    expect(hProps(nodes[1])["data-no-embed"]).toBe("true");
  });

  it("does not throw when directiveNode.data is initially undefined", () => {
    expect(() =>
      parseToTree('::desmos{url="https://www.desmos.com/calculator/abc"}'),
    ).not.toThrow();
  });

  it("renders to the expected final HTML output", () => {
    const html = parseToHtml(
      '::desmos{url="https://www.desmos.com/calculator/abc123" noEmbed="true"}',
    );

    expect(html).toContain('class="desmos-graph"');
    expect(html).toContain(
      'data-graph-url="https://www.desmos.com/calculator/abc123"',
    );
    expect(html).toContain('data-no-embed="true"');
  });
});
