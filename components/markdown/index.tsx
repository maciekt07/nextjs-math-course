import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import rehypeUnwrapImages from "rehype-unwrap-images";
import remarkDirective from "remark-directive";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import type { Pluggable } from "unified";
import type { Media } from "@/payload-types";
import { createMarkdownComponents } from "./components";
import { desmos } from "./desmos/desmos-plugin";
import { KATEX_REHYPE_OPTIONS } from "./katex/katex-rehype-options";
import { MarkdownWrapper } from "./wrapper";
import "katex/dist/katex.min.css";

interface MarkdownRendererProps {
  content: string;
  media?: Media[];
  optimizeMath?: boolean;
}

const REMARK_PLUGINS: Pluggable[] = [
  remarkGfm,
  remarkMath,
  remarkDirective,
  desmos,
];
const BASE_REHYPE_PLUGINS: Pluggable[] = [rehypeUnwrapImages];

// FOR MATH:
// SSR just a placeholder <div>/<span> so the page loads fast
// the actual KaTeX content can be very long and nested and is only rendered on the client as it scrolls into view
// this prevents blocking the main thread and FPS drops on long pages with lots of formulas

export function MarkdownRenderer({
  content,
  media,
  optimizeMath = false,
}: MarkdownRendererProps) {
  const components = createMarkdownComponents(media, optimizeMath);

  const rehypePlugins: Pluggable[] = [...BASE_REHYPE_PLUGINS];
  if (!optimizeMath) {
    rehypePlugins.push(rehypeKatex);
  }

  return (
    <MarkdownWrapper>
      <ReactMarkdown
        // biome-ignore lint/correctness/noChildrenProp: cannot pass content as JSX children
        children={content}
        components={components}
        remarkPlugins={REMARK_PLUGINS}
        rehypePlugins={rehypePlugins}
        remarkRehypeOptions={optimizeMath ? KATEX_REHYPE_OPTIONS : undefined}
      />
    </MarkdownWrapper>
  );
}
