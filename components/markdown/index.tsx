import "katex/dist/katex.min.css";

import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import rehypeUnwrapImages from "rehype-unwrap-images";
import remarkDirective from "remark-directive";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import type { Pluggable } from "unified";
import type { Lesson } from "@/types/payload-types";
import { blocks } from "./blocks/blocks-plugin";
import { createMarkdownComponents } from "./components";
import { desmos } from "./desmos/desmos-plugin";
import { KATEX_REHYPE_OPTIONS } from "./katex/katex-rehype-options";
import { mermaid } from "./mermaid/mermaid-plugin";
import { remarkHeadingIds } from "./remark/remark-heading-ids";
import remarkSections from "./remark/remark-sections";
import { MarkdownWrapper } from "./wrapper";

const BASE_REMARK_PLUGINS: Pluggable[] = [
  remarkGfm,
  remarkMath,
  remarkDirective,
  desmos,
  blocks,
  mermaid,
  remarkHeadingIds,
];

const REHYPE_PLUGINS: Pluggable[] = [rehypeUnwrapImages, rehypeKatex];

interface MarkdownRendererProps {
  content: string;
  media?: NonNullable<Lesson["uploadImage"]> | null;

  /**
   * SSR just a placeholder so the page loads fast.
   * The actual KaTeX content can be very long and nested and is only rendered
   * on the client as it scrolls into view.
   * This prevents blocking the main thread and FPS drops on long pages with lots of formulas.
   */
  optimizeMath?: boolean;

  /**
   * wrap markdown in sections to apply content-visibility
   */
  useSections?: boolean;
  isFreeLesson?: boolean;
}

export function MarkdownRenderer({
  content,
  media,
  optimizeMath = false,
  isFreeLesson = false,
  useSections = false,
}: MarkdownRendererProps) {
  const components = createMarkdownComponents({
    media,
    optimizeMath,
    optimizeImages: isFreeLesson,
  });

  const remarkPlugins: Pluggable[] = useSections
    ? [...BASE_REMARK_PLUGINS, [remarkSections, { depth: [2] }]]
    : BASE_REMARK_PLUGINS;

  return (
    <MarkdownWrapper>
      <ReactMarkdown
        // biome-ignore lint/correctness/noChildrenProp: cannot pass content as JSX children
        children={content}
        components={components}
        remarkPlugins={remarkPlugins}
        rehypePlugins={REHYPE_PLUGINS}
        remarkRehypeOptions={optimizeMath ? KATEX_REHYPE_OPTIONS : undefined}
      />
    </MarkdownWrapper>
  );
}
