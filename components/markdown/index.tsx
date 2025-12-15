import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkDirective from "remark-directive";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import "katex/dist/katex.min.css";
import rehypeUnwrapImages from "rehype-unwrap-images";
import { createMarkdownComponents } from "@/components/markdown/components";
import { MarkdownWrapper } from "@/components/markdown/wrapper";
import type { Media } from "@/payload-types";
import { desmos } from "./desmos/desmos-plugin";

interface MarkdownRendererProps {
  content: string;
  media?: Media[];
}

export function MarkdownRenderer({ content, media }: MarkdownRendererProps) {
  return (
    <MarkdownWrapper>
      <ReactMarkdown
        // biome-ignore lint/correctness/noChildrenProp: cannot pass content as JSX children
        children={content}
        components={createMarkdownComponents(media)}
        remarkPlugins={[remarkGfm, remarkMath, remarkDirective, desmos]}
        rehypePlugins={[rehypeKatex, rehypeUnwrapImages]}
      />
    </MarkdownWrapper>
  );
}
