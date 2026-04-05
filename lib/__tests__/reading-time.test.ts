import { describe, expect, it } from "vitest";
import { getReadingTime, READING_TIME_DEFAULTS } from "@/lib/reading-time";

const D = READING_TIME_DEFAULTS;

function nWords(n: number, word = "hello"): string {
  return Array(n).fill(word).join(" ");
}

function wordSecs(n: number, wpm = D.wordsPerMinute): number {
  return Math.round((n / wpm) * 60);
}

describe("getReadingTime", () => {
  describe("edge cases", () => {
    it("returns 0 for empty string", () => {
      expect(getReadingTime("")).toBe(0);
    });

    it("returns 0 for whitespace-only input", () => {
      expect(getReadingTime("   \n\n\t  ")).toBe(0);
    });

    it("returns 0 for markdown symbols with no real words", () => {
      expect(getReadingTime("### --- *** ___")).toBe(0);
    });

    it("always returns a finite number", () => {
      expect(Number.isFinite(getReadingTime("some text"))).toBe(true);
    });
  });

  // Plain text

  describe("plain text / word counting", () => {
    it(`counts words at the default ${D.wordsPerMinute} wpm`, () => {
      // D.wordsPerMinute words -> exactly 60s
      expect(getReadingTime(nWords(D.wordsPerMinute))).toBe(60);
    });

    it("rounds fractional seconds correctly", () => {
      // 1 word at 180 wpm = 0.333s -> 0
      expect(getReadingTime("hello")).toBe(0);
      // 2 words = 0.667s -> 1
      expect(getReadingTime("hello world")).toBe(1);
    });

    it("handles multiline plain text", () => {
      const n = 90; // 30s at default wpm
      const multiline = nWords(n).replace(/ /g, "\n");
      expect(getReadingTime(multiline)).toBe(wordSecs(n));
    });

    it("strips markdown symbols before counting words", () => {
      expect(getReadingTime("**hello** _world_")).toBe(
        getReadingTime("hello world"),
      );
    });

    it("strips markdown headings before counting words", () => {
      expect(getReadingTime("## Title")).toBe(getReadingTime("Title"));
    });

    it("strips HTML tags, counts text content", () => {
      expect(getReadingTime("<p>hello world</p>")).toBe(
        getReadingTime("hello world"),
      );
    });

    it("strips HTML comments entirely", () => {
      expect(getReadingTime("<!-- hidden --> hello")).toBe(
        getReadingTime("hello"),
      );
    });
  });

  // Block math

  describe("block math ($$...$$)", () => {
    it(`adds ${D.mathTimePerExpression}s per block expression`, () => {
      expect(getReadingTime("$$x^2$$")).toBe(D.mathTimePerExpression);
    });

    it("accumulates time for multiple block expressions", () => {
      expect(getReadingTime("$$a$$ $$b$$")).toBe(D.mathTimePerExpression * 2);
    });

    it("handles multiline block math", () => {
      expect(getReadingTime("$$\n\\int_0^1 f(x)\\,dx\n$$")).toBe(
        D.mathTimePerExpression,
      );
    });

    it("removes block math before counting words", () => {
      const withMath = getReadingTime(`$$x^2$$ ${nWords(D.wordsPerMinute)}`);
      expect(withMath).toBe(D.mathTimePerExpression + 60);
    });
  });

  // Inline math

  describe("inline math ($...$)", () => {
    it(`adds ${D.mathTimePerExpression * 0.5}s per inline expression`, () => {
      expect(getReadingTime("$x^2$")).toBe(D.mathTimePerExpression * 0.5);
    });

    it("accumulates time for multiple inline expressions", () => {
      expect(getReadingTime("$a$ and $b$")).toBe(
        Math.round(D.mathTimePerExpression * 0.5 * 2 + wordSecs(1)),
      );
    });

    it("does not treat $$ as two inline expressions", () => {
      // $$ is block math should get block time
      expect(getReadingTime("$$x$$")).toBe(D.mathTimePerExpression);
    });

    it("removes inline math before counting words", () => {
      const withInline = getReadingTime(`$x$ ${nWords(D.wordsPerMinute)}`);
      expect(withInline).toBe(Math.round(D.mathTimePerExpression * 0.5 + 60));
    });
  });

  // Images

  describe("images (![alt](url))", () => {
    it(`adds ${D.imageTimePerImage}s per image`, () => {
      expect(getReadingTime("![cat](https://example.com/cat.jpg)")).toBe(
        D.imageTimePerImage,
      );
    });

    it("accumulates time for multiple images", () => {
      expect(getReadingTime("![a](1.jpg) ![b](2.jpg)")).toBe(
        D.imageTimePerImage * 2,
      );
    });

    it("works with empty alt text", () => {
      expect(getReadingTime("![](https://example.com/img.png)")).toBe(
        D.imageTimePerImage,
      );
    });

    it("removes image syntax before counting words", () => {
      // alt text words must not be double-counted
      const withImage = getReadingTime(
        `![hello world](img.jpg) ${nWords(D.wordsPerMinute)}`,
      );
      expect(withImage).toBe(D.imageTimePerImage + 60);
    });
  });

  // Desmos graphs

  describe("desmos graphs (::desmos{...})", () => {
    it(`adds ${D.desmosTimePerGraph}s per graph`, () => {
      expect(getReadingTime('::desmos{url="https://desmos.com/1"}')).toBe(
        D.desmosTimePerGraph,
      );
    });

    it("accumulates time for multiple graphs", () => {
      expect(getReadingTime('::desmos{url="a"} ::desmos{url="b"}')).toBe(
        D.desmosTimePerGraph * 2,
      );
    });

    it("removes desmos syntax before counting words", () => {
      const withGraph = getReadingTime(
        `::desmos{url="x"} ${nWords(D.wordsPerMinute)}`,
      );
      expect(withGraph).toBe(D.desmosTimePerGraph + 60);
    });
  });

  // Custom config

  describe("custom config overrides", () => {
    it("respects custom wordsPerMinute", () => {
      // 60 words at 60 wpm -> 60s
      expect(getReadingTime(nWords(60), { wordsPerMinute: 60 })).toBe(60);
    });

    it("respects custom mathTimePerExpression", () => {
      expect(getReadingTime("$$x$$", { mathTimePerExpression: 20 })).toBe(20);
    });

    it("respects custom imageTimePerImage", () => {
      expect(getReadingTime("![a](b.jpg)", { imageTimePerImage: 5 })).toBe(5);
    });

    it("respects custom desmosTimePerGraph", () => {
      expect(
        getReadingTime('::desmos{url="x"}', { desmosTimePerGraph: 30 }),
      ).toBe(30);
    });

    it("inline math time is half of custom mathTimePerExpression", () => {
      expect(getReadingTime("$x$", { mathTimePerExpression: 20 })).toBe(10);
    });

    it("partial config leaves unspecified values at defaults", () => {
      const result = getReadingTime("![a](b.jpg) $$x$$", {
        imageTimePerImage: 5,
      });
      expect(result).toBe(5 + D.mathTimePerExpression);
    });
  });

  // Combined

  // describe("combined inputs", () => {
  //   it("sums all element types correctly", () => {
  //     const input = [
  //       `![fig](fig.jpg)`, // +12s image
  //       `$$E = mc^2$$`, // +8s block math
  //       `The value is $x^2$ here.`, // +4s inline math + "The value is here" = 4 words
  //       `::desmos{url="graph"}`, // +12s graph
  //     ].join("\n");

  //     const expectedSpecial =
  //       D.imageTimePerImage +
  //       D.mathTimePerExpression +
  //       D.mathTimePerExpression * 0.5 +
  //       D.desmosTimePerGraph;
  //     const expected = Math.round(expectedSpecial + wordSecs(4));
  //     expect(getReadingTime(input)).toBe(expected);
  //   });

  //   it("a realistic lesson is in the 5-12 minute range", () => {
  //     const lesson = [
  //       "## Introduction to Trigonometry",
  //       "",
  //       nWords(400),
  //       "",
  //       "$$\\sin^2\\theta + \\cos^2\\theta = 1$$",
  //       "",
  //       nWords(200),
  //       "",
  //       "![Unit circle](unit-circle.png)",
  //       "",
  //       nWords(200),
  //       "",
  //       '::desmos{url="https://desmos.com/trig"}',
  //       "",
  //       nWords(100),
  //       "",
  //       "The identity $e^{i\\pi} + 1 = 0$ is elegant.",
  //     ].join("\n");

  //     const seconds = getReadingTime(lesson);
  //     expect(seconds).toBeGreaterThanOrEqual(5 * 60);
  //     expect(seconds).toBeLessThanOrEqual(12 * 60);
  //   });
  // });
});
