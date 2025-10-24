import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import "katex/dist/katex.min.css";
import Image from "next/image";

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose dark:prose-invert max-w-none marker:text-primary">
      <ReactMarkdown
        components={{
          a: ({ node, ...props }) => (
            <a
              {...props}
              className="text-primary underline"
              target="_blank"
              rel="noopener noreferrer"
            />
          ),
          img: ({ node, ...props }) => {
            return (
              <Image
                {...props}
                src={props.src as string}
                alt={props.alt || "Image"}
                width={800}
                height={500}
                className="w-full rounded-2xl object-contain"
              />
            );
          },
        }}
        // biome-ignore lint/correctness/noChildrenProp: cannot pass content as JSX children
        children={content}
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
      />
    </div>
  );
}
