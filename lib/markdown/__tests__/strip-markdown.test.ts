import { describe, expect, it } from "vitest";
import {
  stripBasicMarkdown,
  stripMarkdown,
} from "@/lib/markdown/strip-markdown";

describe("stripMarkdown", () => {
  // Passthrough
  describe("plain text passthrough", () => {
    it("returns plain text unchanged", () => {
      expect(stripMarkdown("Hello, world!")).toBe("Hello, world!");
    });

    it("trims leading and trailing whitespace", () => {
      expect(stripMarkdown("  hello  ")).toBe("hello");
    });

    it("returns empty string for empty input", () => {
      expect(stripMarkdown("")).toBe("");
    });
  });

  // Custom directives
  describe("block directives", () => {
    it("removes a basic fenced directive block", () => {
      const input = ":::note\nsome content\n:::";
      expect(stripMarkdown(input)).toBe("");
    });

    it("removes a directive with attributes", () => {
      const input = ':::tip{title="Watch out"}\ncontent\n:::';
      expect(stripMarkdown(input)).toBe("");
    });

    it("removes a directive with 4 colons", () => {
      const input = "::::warning\ncontent\n::::";
      expect(stripMarkdown(input)).toBe("");
    });

    it("preserves surrounding text when removing directive", () => {
      // The block directive regex consumes the newline before :::, leaving a blank line
      const input = "Before\n:::note\ncontent\n:::\nAfter";
      expect(stripMarkdown(input)).toBe("Before\n\nAfter");
    });
  });

  describe("inline directives", () => {
    it("removes a basic inline directive", () => {
      expect(stripMarkdown("See ::desmos")).toBe("See");
    });

    it("removes an inline directive with attributes", () => {
      expect(stripMarkdown('See ::desmos{url="https://example.com"}')).toBe(
        "See",
      );
    });

    it("removes inline directive in the middle of text", () => {
      expect(stripMarkdown("Before ::chart{id=1} after")).toBe("Before  after");
    });
  });

  // LaTeX
  describe("LaTeX", () => {
    it("removes a block LaTeX expression", () => {
      expect(stripMarkdown("$$x^2 + y^2 = z^2$$")).toBe("");
    });

    it("removes multiline block LaTeX", () => {
      const input = "$$\n\\int_0^1 f(x)\\,dx\n$$";
      expect(stripMarkdown(input)).toBe("");
    });

    it("removes inline LaTeX", () => {
      expect(stripMarkdown("The value is $x^2$")).toBe("The value is");
    });

    it("preserves surrounding text around inline LaTeX", () => {
      expect(stripMarkdown("Where $a=1$ and $b=2$.")).toBe("Where  and .");
    });
  });

  // Code
  describe("fenced code blocks", () => {
    it("removes a fenced code block", () => {
      const input = "```js\nconsole.log('hi');\n```";
      expect(stripMarkdown(input)).toBe("");
    });

    it("removes a fenced code block with language tag", () => {
      const input = "```typescript\nconst x: number = 1;\n```";
      expect(stripMarkdown(input)).toBe("");
    });

    it("preserves text around fenced code blocks", () => {
      // The code block regex consumes the surrounding newlines, leaving a blank line
      const input = "Intro\n```js\ncode();\n```\nOutro";
      expect(stripMarkdown(input)).toBe("Intro\n\nOutro");
    });
  });

  describe("inline code", () => {
    it("removes inline code", () => {
      expect(stripMarkdown("Use `console.log` here")).toBe("Use  here");
    });

    it("removes multiple inline code spans", () => {
      // First span leaves no space before "and"; result is trimmed
      expect(stripMarkdown("`foo` and `bar`")).toBe("and");
    });
  });

  // Headings
  describe("ATX headings", () => {
    it("removes h1", () => expect(stripMarkdown("# Title")).toBe("Title"));
    it("removes h2", () => expect(stripMarkdown("## Section")).toBe("Section"));
    it("removes h6", () => expect(stripMarkdown("###### Deep")).toBe("Deep"));
  });

  describe("setext headings", () => {
    it("removes === underline", () => {
      const input = "Title\n=====";
      expect(stripMarkdown(input)).toBe("Title");
    });

    it("removes --- underline", () => {
      const input = "Title\n-----";
      expect(stripMarkdown(input)).toBe("Title");
    });
  });

  // Blockquotes
  describe("blockquotes", () => {
    it("removes blockquote marker", () => {
      expect(stripMarkdown("> quoted text")).toBe("quoted text");
    });

    it("only strips the outermost blockquote marker per line", () => {
      // BLOCKQUOTE regex strips `> ` once per line — a second `>` is left intact
      // This is a known limitation of the single-pass regex approach
      expect(stripMarkdown("> > double quoted")).toBe("> double quoted");
    });
  });

  // Horizontal rules
  describe("horizontal rules", () => {
    it("removes --- rule", () => expect(stripMarkdown("---")).toBe(""));
    it("removes *** rule", () => expect(stripMarkdown("***")).toBe(""));
    it("removes ___ rule", () => expect(stripMarkdown("___")).toBe(""));
  });

  // Links & images
  describe("images", () => {
    it("replaces image with alt text", () => {
      expect(stripMarkdown("![A cat](https://example.com/cat.jpg)")).toBe(
        "A cat",
      );
    });

    it("returns empty string for image with no alt text", () => {
      expect(stripMarkdown("![](https://example.com/cat.jpg)")).toBe("");
    });
  });

  describe("inline links", () => {
    it("replaces link with its text", () => {
      expect(stripMarkdown("[Click here](https://example.com)")).toBe(
        "Click here",
      );
    });

    it("removes link definition lines", () => {
      const input = '[id]: https://example.com "Title"';
      expect(stripMarkdown(input)).toBe("");
    });

    it("replaces reference-style link with text", () => {
      expect(stripMarkdown("[link text][ref]")).toBe("link text");
    });
  });

  // Emphasis
  describe("bold and italic", () => {
    it("removes bold markers (asterisks)", () => {
      expect(stripMarkdown("**bold text**")).toBe("bold text");
    });

    it("removes bold markers (underscores)", () => {
      expect(stripMarkdown("__bold text__")).toBe("bold text");
    });

    it("removes italic markers (asterisk)", () => {
      expect(stripMarkdown("*italic text*")).toBe("italic text");
    });

    it("removes italic markers (underscore)", () => {
      expect(stripMarkdown("_italic text_")).toBe("italic text");
    });

    it("removes bold+italic markers", () => {
      expect(stripMarkdown("***bold italic***")).toBe("bold italic");
    });

    it("removes strikethrough", () => {
      expect(stripMarkdown("~~struck~~")).toBe("struck");
    });
  });

  // Lists
  describe("lists", () => {
    it("removes unordered list markers (dash)", () => {
      expect(stripMarkdown("- item one")).toBe("item one");
    });

    it("removes unordered list markers (asterisk)", () => {
      expect(stripMarkdown("* item")).toBe("item");
    });

    it("removes unordered list markers (plus)", () => {
      expect(stripMarkdown("+ item")).toBe("item");
    });

    it("removes ordered list markers", () => {
      expect(stripMarkdown("1. first\n2. second")).toBe("first\nsecond");
    });

    it("removes indented list markers", () => {
      expect(stripMarkdown("  - nested")).toBe("nested");
    });
  });

  // HTML
  describe("HTML", () => {
    it("removes HTML tags", () => {
      expect(stripMarkdown("<p>Hello</p>")).toBe("Hello");
    });

    it("removes self-closing tags", () => {
      expect(stripMarkdown("Line<br/>break")).toBe("Linebreak");
    });

    it("removes named HTML entities", () => {
      expect(stripMarkdown("AT&amp;T")).toBe("ATT");
    });

    it("removes decimal HTML entities", () => {
      expect(stripMarkdown("space&#160;here")).toBe("spacehere");
    });

    it("removes hex HTML entities", () => {
      expect(stripMarkdown("&#xA0;")).toBe("");
    });
  });

  // Whitespace cleanup
  describe("excess blank lines", () => {
    it("collapses 3+ blank lines to 2", () => {
      const input = "a\n\n\n\nb";
      expect(stripMarkdown(input)).toBe("a\n\nb");
    });

    it("leaves double newlines unchanged", () => {
      expect(stripMarkdown("a\n\nb")).toBe("a\n\nb");
    });
  });

  // Combined / real-world
  describe("combined real-world inputs", () => {
    it("strips a mixed markdown paragraph", () => {
      const input =
        "## Introduction\n\nThis is **bold** and _italic_ text with a [link](https://example.com).";
      expect(stripMarkdown(input)).toBe(
        "Introduction\n\nThis is bold and italic text with a link.",
      );
    });

    it("strips a full lesson-like block", () => {
      const input = [
        "# Geometry Basics",
        "",
        ':::card{title="Overview"}',
        "Learn about shapes.",
        ":::",
        "",
        "The area formula is $A = \\pi r^2$.",
        "",
        "- Circle",
        "- Square",
      ].join("\n");

      const result = stripMarkdown(input);
      expect(result).toContain("Geometry Basics");
      expect(result).not.toContain(":::");
      expect(result).not.toContain("$");
      expect(result).not.toContain("- ");
    });
  });
});

// stripBasicMarkdown

describe("stripBasicMarkdown", () => {
  it("returns plain text unchanged", () => {
    expect(stripBasicMarkdown("Hello world")).toBe("Hello world");
  });

  it("removes asterisks", () => {
    expect(stripBasicMarkdown("**bold**")).toBe("bold");
  });

  it("removes underscores", () => {
    expect(stripBasicMarkdown("_italic_")).toBe("italic");
  });

  it("removes tildes (strikethrough)", () => {
    expect(stripBasicMarkdown("~~struck~~")).toBe("struck");
  });

  it("removes backticks", () => {
    expect(stripBasicMarkdown("`code`")).toBe("code");
  });

  it("replaces inline link with its text", () => {
    expect(stripBasicMarkdown("[Click here](https://example.com)")).toBe(
      "Click here",
    );
  });

  it("handles link with no text", () => {
    expect(stripBasicMarkdown("[](https://example.com)")).toBe("");
  });

  it("removes multiple marker types in one string", () => {
    expect(stripBasicMarkdown("**bold** and _italic_ and `code`")).toBe(
      "bold and italic and code",
    );
  });

  it("trims leading and trailing whitespace", () => {
    expect(stripBasicMarkdown("  hello  ")).toBe("hello");
  });

  it("returns empty string for empty input", () => {
    expect(stripBasicMarkdown("")).toBe("");
  });

  it("does NOT strip block directives (out of scope)", () => {
    // stripBasicMarkdown only handles basic symbols - directives are preserved
    const input = ":::note\ncontent\n:::";
    expect(stripBasicMarkdown(input)).toContain(":::");
  });

  it("does NOT strip HTML tags (out of scope)", () => {
    expect(stripBasicMarkdown("<b>bold</b>")).toContain("<b>");
  });

  it("strips all asterisks including unpaired ones", () => {
    // The regex removes all * chars, not just balanced pairs
    expect(stripBasicMarkdown("*hello")).toBe("hello");
  });
});
