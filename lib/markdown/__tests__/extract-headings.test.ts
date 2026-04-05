import { describe, expect, it } from "vitest";
import { extractHeadings } from "../extract-headings";

describe("extractHeadings", () => {
  describe("falsy input", () => {
    it("returns [] for undefined", () => {
      expect(extractHeadings(undefined)).toEqual([]);
    });

    it("returns [] for null", () => {
      expect(extractHeadings(null)).toEqual([]);
    });

    it("returns [] for empty string", () => {
      expect(extractHeadings("")).toEqual([]);
    });
  });

  describe("heading levels", () => {
    it("extracts h2", () => {
      expect(extractHeadings("## Introduction")).toEqual([
        { id: "introduction", text: "Introduction", level: 2 },
      ]);
    });

    it("extracts h3 nested under h2", () => {
      const result = extractHeadings("## Parent\n### Child");
      expect(result[1]).toEqual({
        id: "parent-child",
        text: "Child",
        level: 3,
      });
    });

    it("ignores h1", () => {
      expect(extractHeadings("# Title\n## Section")).toHaveLength(1);
    });

    it("ignores h4+", () => {
      expect(extractHeadings("#### Deep")).toEqual([]);
    });
  });

  describe("id generation", () => {
    it("h2 id is slug of its own text", () => {
      expect(extractHeadings("## Hello World")[0].id).toBe("hello-world");
    });

    it("h3 id is slug of parent h2 + h3 text", () => {
      const result = extractHeadings("## Algebra\n### Linear Equations");
      expect(result[1].id).toBe("algebra-linear-equations");
    });

    it("h3 tracks the most recent h2 as parent", () => {
      const md = "## First\n### Child\n## Second\n### Child";
      const result = extractHeadings(md);
      expect(result[1].id).toBe("first-child");
      expect(result[3].id).toBe("second-child");
    });

    it("h3 before any h2 uses empty string as parent", () => {
      const result = extractHeadings("### Orphan");
      expect(result[0].id).toBe("orphan");
    });
  });

  describe("multiple headings", () => {
    it("extracts all headings in correct order with correct levels", () => {
      const md =
        "## Section One\n### Part A\n### Part B\n## Section Two\n### Part C";
      const result = extractHeadings(md);

      expect(result).toHaveLength(5);
      expect(result.map((h) => h.text)).toEqual([
        "Section One",
        "Part A",
        "Part B",
        "Section Two",
        "Part C",
      ]);
      expect(result.map((h) => h.level)).toEqual([2, 3, 3, 2, 3]);
      expect(result.map((h) => h.id)).toEqual([
        "section-one",
        "section-one-part-a",
        "section-one-part-b",
        "section-two",
        "section-two-part-c",
      ]);
    });
  });
});
