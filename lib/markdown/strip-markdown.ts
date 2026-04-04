/** Fenced directive blocks: :::name{...}\ncontent\n::: (3+ colons) */
const BLOCK_DIRECTIVE = /:{3,}[a-zA-Z]*(?:\{[^}]*\})?\s*\n[\s\S]*?:{3,}/gm;

/** Inline directives: ::name{...} or ::name */
const INLINE_DIRECTIVE = /:{2}[a-zA-Z]+(?:\{[^}]*\})?/g;

/** Block LaTeX: $$...$$ */
const LATEX_BLOCK = /\$\$[\s\S]*?\$\$/g;

/** Inline LaTeX: $...$ (no newlines, no nesting) */
const LATEX_INLINE = /\$[^$\n]+?\$/g;

/** Fenced code blocks: ```lang\n...\n``` */
const CODE_BLOCK = /`{3}[\s\S]*?`{3}/g;

/** Inline code: `...` */
const CODE_INLINE = /`[^`\n]+`/g;

/** ATX headings: ## Heading */
const HEADING_ATX = /^#{1,6}\s+/gm;

/** Setext heading underlines: === or --- on their own line */
const HEADING_SETEXT = /^[=-]{3,}\s*$/gm;

/** Blockquotes: > text */
const BLOCKQUOTE = /^>\s?/gm;

/** Horizontal rules: ---, ***, ___ */
const HORIZONTAL_RULE = /^([*\-_])(\s*\1){2,}\s*$/gm;

/** Images: ![alt](url) — preserves alt text */
const IMAGE = /!\[([^\]]*)\]\([^)]*\)/g;

/** Inline links: [text](url) — preserves text */
const LINK_INLINE = /\[([^\]]*)\]\([^)]*\)/g;

/** Reference-style links: [text][id] — preserves text */
const LINK_REFERENCE = /\[([^\]]*)\]\[[^\]]*\]/g;

/** Link definitions: [id]: url "title" */
const LINK_DEFINITION = /^\s*\[[^\]]+\]:\s*\S+.*$/gm;

/** Bold + italic: ***text*** or ___text___ */
const BOLD_ITALIC = /(\*{3}|_{3})(.+?)\1/g;

/** Bold: **text** or __text__ */
const BOLD = /(\*{2}|_{2})(.+?)\1/g;

/** Italic: *text* or _text_ */
const ITALIC = /([*_])(.+?)\1/g;

/** Strikethrough: ~~text~~ */
const STRIKETHROUGH = /~~(.+?)~~/g;

/** Unordered list markers: - , * , + */
const LIST_UNORDERED = /^[\s]*[-*+]\s+/gm;

/** Ordered list markers: 1. , 2. , etc. */
const LIST_ORDERED = /^[\s]*\d+\.\s+/gm;

/** HTML tags */
const HTML_TAG = /<[^>]+>/g;

/** HTML entities: &amp; &#160; &#xA0; */
const HTML_ENTITY = /&[a-zA-Z]+;|&#\d+;|&#x[0-9a-fA-F]+;/g;

/** 3+ consecutive blank lines */
const EXCESS_BLANK_LINES = /\n{3,}/g;

type Replacement = readonly [pattern: RegExp, replacement: string];

/**
 * Applies a sequence of find-replace pairs in order.
 * Each pattern is reset before use to avoid stateful lastIndex bugs.
 */
function applyReplacements(
  text: string,
  replacements: readonly Replacement[],
): string {
  return replacements.reduce((acc, [pattern, replacement]) => {
    pattern.lastIndex = 0;
    return acc.replace(pattern, replacement);
  }, text);
}

/**
 * Strips all markdown syntax, LaTeX expressions, and custom directive blocks
 * from the given string, returning clean plain text.
 *
 * Handles:
 * - Custom fenced directives  (:::note, :::tip{title="..."}, ::::, etc.)
 * - Inline directives         (::desmos{url="..."})
 * - Block and inline LaTeX    ($$...$$, $...$)
 * - Fenced and inline code    (``` ... ```, `...`)
 * - All standard markdown     (headings, bold, italic, links, lists, etc.)
 * - HTML tags and entities
 */
export function stripMarkdown(input: string): string {
  const replacements: readonly Replacement[] = [
    // --- Custom syntax ---
    [BLOCK_DIRECTIVE, ""],
    [INLINE_DIRECTIVE, ""],

    // --- LaTeX ---
    [LATEX_BLOCK, ""],
    [LATEX_INLINE, ""],

    // --- Code ---
    [CODE_BLOCK, ""],
    [CODE_INLINE, ""],

    // --- Structure ---
    [HEADING_ATX, ""],
    [HEADING_SETEXT, ""],
    [BLOCKQUOTE, ""],
    [HORIZONTAL_RULE, ""],

    // --- Links & images (preserve human-readable text) ---
    [IMAGE, "$1"],
    [LINK_INLINE, "$1"],
    [LINK_REFERENCE, "$1"],
    [LINK_DEFINITION, ""],

    // --- Emphasis (order: strongest first) ---
    [BOLD_ITALIC, "$2"],
    [BOLD, "$2"],
    [ITALIC, "$2"],
    [STRIKETHROUGH, "$1"],

    // --- Lists ---
    [LIST_UNORDERED, ""],
    [LIST_ORDERED, ""],

    // --- HTML ---
    [HTML_TAG, ""],
    [HTML_ENTITY, ""],

    // --- Whitespace cleanup ---
    [EXCESS_BLANK_LINES, "\n\n"],
  ];

  return applyReplacements(input, replacements).trim();
}

export function stripBasicMarkdown(md: string): string {
  return md
    .replace(/[*_~`]/g, "") //basic markdown symbols
    .replace(/\[(.*?)\]\(.*?\)/g, "$1") // links
    .trim();
}
