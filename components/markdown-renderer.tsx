import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import "katex/dist/katex.min.css";
import Image from "next/image";
import { ImageZoom } from "./ui/shadcn-io/image-zoom";

interface MarkdownRendererProps {
  content: string;
  unoptimized?: boolean;
}

export function MarkdownRenderer({
  content,
  unoptimized,
}: MarkdownRendererProps) {
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
              <ImageZoom>
                <Image
                  {...props}
                  src={props.src as string}
                  alt={props.alt || "Image"}
                  width={800}
                  height={500}
                  unoptimized={unoptimized || true}
                  className="w-full rounded-2xl object-contain"
                />
              </ImageZoom>
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
