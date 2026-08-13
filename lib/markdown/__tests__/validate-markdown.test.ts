import { describe, expect, it } from "vitest";

import { validateMarkdown } from "../validate-markdown";

describe("validateMarkdown", () => {
  it("returns no errors for plain markdown with nothing to validate", async () => {
    const errors = await validateMarkdown("just some regular text, no code");
    expect(errors).toEqual([]);
  });

  it("returns no errors for an empty string", async () => {
    const errors = await validateMarkdown("");
    expect(errors).toEqual([]);
  });

  describe("latex", () => {
    it("accepts valid block latex ($$...$$)", async () => {
      const errors = await validateMarkdown(`
$$
x^2 + y^2 = z^2
$$
`);
      expect(errors).toEqual([]);
    });

    it("accepts valid inline latex ($...$)", async () => {
      const errors = await validateMarkdown("the value $x^2$ is squared");
      expect(errors).toEqual([]);
    });

    it("rejects invalid latex", async () => {
      const errors = await validateMarkdown(`
$$
\\notarealcommand
$$
`);
      expect(errors).toHaveLength(1);
      expect(errors[0].type).toBe("latex");
    });

    it("reports one error per broken formula", async () => {
      const errors = await validateMarkdown("$\\badone$ some text $\\badtwo$");
      const latexErrors = errors.filter((e) => e.type === "latex");
      expect(latexErrors).toHaveLength(2);
    });

    it("does not treat an empty inline formula as an error", async () => {
      const errors = await validateMarkdown("price: $5 and $10");
      expect(errors.filter((e) => e.type === "latex")).toEqual([]);
    });
  });

  describe("mermaid", () => {
    it("accepts a valid diagram", async () => {
      const errors = await validateMarkdown(`
\`\`\`mermaid
graph TD
A --> B
\`\`\`
`);
      expect(errors).toEqual([]);
    });

    it("rejects an invalid diagram", async () => {
      const errors = await validateMarkdown(`
\`\`\`mermaid
this is not a real diagram type (((
\`\`\`
`);
      expect(errors).toHaveLength(1);
      expect(errors[0].type).toBe("mermaid");
    });

    it("validates multiple diagrams independently", async () => {
      const errors = await validateMarkdown(`
\`\`\`mermaid
graph TD
A --> B
\`\`\`

some text between

\`\`\`mermaid
not valid mermaid (((
\`\`\`
`);
      expect(errors).toHaveLength(1);
      expect(errors[0].type).toBe("mermaid");
    });

    it("ignores an empty mermaid block", async () => {
      const errors = await validateMarkdown("```mermaid\n```");
      expect(errors.filter((e) => e.type === "mermaid")).toEqual([]);
    });
  });

  describe(":::blocks", () => {
    it("accepts a known block type", async () => {
      const errors = await validateMarkdown(":::tip\nsome content\n:::");
      expect(errors).toEqual([]);
    });

    it("accepts a known block type with attributes", async () => {
      const errors = await validateMarkdown(
        ':::warning{title="Heads up"}\nsome content\n:::',
      );
      expect(errors).toEqual([]);
    });

    it("rejects an unknown block type", async () => {
      const errors = await validateMarkdown(":::bogus\nsome content\n:::");
      expect(errors).toHaveLength(1);
      expect(errors[0].type).toBe("block");
      expect(errors[0].message).toContain("bogus");
    });

    it("flags each unknown block type separately", async () => {
      const errors = await validateMarkdown(":::bogus1\n:::\n\n:::bogus2\n:::");
      const blockErrors = errors.filter((e) => e.type === "block");
      expect(blockErrors).toHaveLength(2);
    });
  });

  it("combines errors of different types in one pass", async () => {
    const errors = await validateMarkdown(`
$$
\\notarealcommand
$$

\`\`\`mermaid
not valid (((
\`\`\`

:::bogus
:::
`);

    expect(errors).toHaveLength(3);
    expect(errors.map((e) => e.type).sort()).toEqual([
      "block",
      "latex",
      "mermaid",
    ]);
  });
});
