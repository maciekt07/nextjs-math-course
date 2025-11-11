import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkDirective from "remark-directive";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import "katex/dist/katex.min.css";
import Image from "next/image";
import { type DesmosDivProps, desmos } from "../lib/desmos";
import { DesmosGraph } from "./desmos-graph";
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
          // handle desmos graphs
          div: ({ node, className, ...props }) => {
            const desmosProps = props as DesmosDivProps;

            if (className?.includes("desmos-graph")) {
              const graphUrl = desmosProps["data-graph-url"];
              const noEmbed = desmosProps["data-no-embed"] === "true";

              if (!graphUrl) return null;

              return <DesmosGraph graphUrl={graphUrl} noEmbed={noEmbed} />;
            }
            return <div className={className} {...props} />;
          },
        }}
        // biome-ignore lint/correctness/noChildrenProp: cannot pass content as JSX children
        children={content}
        remarkPlugins={[remarkGfm, remarkMath, remarkDirective, desmos]}
        rehypePlugins={[rehypeKatex]}
      />
    </div>
  );
}
