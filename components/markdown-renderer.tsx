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
  media?: {
    url?: string | null;
    blurhash?: string | null;
    width?: number | null;
    height?: number | null;
  }[];
}

export function MarkdownRenderer({
  content,
  unoptimized,
  media,
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
            const matchedMedia = media?.find((m) => m.url === props.src);
            const blurhash = matchedMedia?.blurhash;
            const width = matchedMedia?.width ?? 800;
            const height = matchedMedia?.height ?? 500;

            return (
              // FIXME: hydration error.
              <ImageZoom>
                <Image
                  {...props}
                  src={props.src as string}
                  alt={props.alt || "Image"}
                  width={width}
                  height={height}
                  unoptimized={unoptimized || true}
                  placeholder={blurhash ? "blur" : "empty"}
                  blurDataURL={blurhash || undefined}
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
