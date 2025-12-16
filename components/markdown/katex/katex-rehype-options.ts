import type { Handler } from "mdast-util-to-hast";
import type { Options } from "remark-rehype";

export const KATEX_REHYPE_OPTIONS: Options = {
  handlers: {
    math: ((_, node) => ({
      type: "element",
      tagName: "div",
      properties: {
        className: "math-display",
        "data-content": node.value?.trim(),
      },
      children: [],
    })) as Handler,

    inlineMath: ((_, node) => ({
      type: "element",
      tagName: "span",
      properties: {
        className: "math-inline",
        "data-content": node.value?.trim(),
      },
      children: [],
    })) as Handler,
  },
};
