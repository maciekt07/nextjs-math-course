import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkDirective from "remark-directive";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import "katex/dist/katex.min.css";
import rehypeUnwrapImages from "rehype-unwrap-images";
import { createMarkdownComponents } from "@/components/markdown/components";
import { cn } from "@/lib/utils";
import type { Media } from "@/payload-types";
import { useSettingsStore } from "@/stores/settings-store";
import { desmos } from "./desmos/desmos-plugin";

interface MarkdownRendererProps {
  content: string;
  media?: Media[];
}

export function MarkdownRenderer({ content, media }: MarkdownRendererProps) {
  const { coloredMarkdown, largeMath } = useSettingsStore();

  return (
    <div
      className={cn(
        "markdown-wrapper prose dark:prose-invert max-w-none break-words",
        coloredMarkdown && "colored-markdown marker:text-primary",
        largeMath && "large-math",
      )}
    >
      <ReactMarkdown
        // biome-ignore lint/correctness/noChildrenProp: cannot pass content as JSX children
        children={content}
        components={createMarkdownComponents(media)}
        remarkPlugins={[remarkGfm, remarkMath, remarkDirective, desmos]}
        rehypePlugins={[rehypeKatex, rehypeUnwrapImages]}
      />
    </div>
  );
}
