import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkDirective from "remark-directive";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import "katex/dist/katex.min.css";
import Image from "next/image";
import React from "react";
import rehypeUnwrapImages from "rehype-unwrap-images";
import { stripMarkdown } from "@/lib/markdown/strip";
import { slug } from "@/lib/slugify";
import { cn } from "@/lib/utils";
import type { Media } from "@/payload-types";
import { useSettingsStore } from "@/stores/settings-store";
import { type DesmosDivProps, desmos } from "../lib/markdown/desmos";
import { DesmosGraph } from "./desmos-graph";
import { ImageZoom } from "./ui/shadcn-io/image-zoom";

interface MarkdownRendererProps {
  content: string;
  media?: Media[];
}

let currentH2Text = "";

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
              // FIXME: hydration error still occurs in some cases
              <ImageZoom>
                <Image
                  {...props}
                  src={props.src as string}
                  alt={props.alt || "Image"}
                  width={width}
                  height={height}
                  loading="lazy"
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
          // generate stable IDs for h2/h3 for TOC
          // h3 IDs are namespaced under the last h2 to avoid collisions
          h2: ({ node, ...props }) => {
            const text = stripMarkdown(getText(props.children));
            currentH2Text = text;
            const id = slug(text);

            return <h2 id={id} {...props} />;
          },
          h3: ({ node, ...props }) => {
            const text = stripMarkdown(getText(props.children));
            const parent = currentH2Text || "section";
            const id = slug(`${parent}-${text}`);

            return <h3 id={id} {...props} />;
          },
        }}
        // biome-ignore lint/correctness/noChildrenProp: cannot pass content as JSX children
        children={content}
        remarkPlugins={[remarkGfm, remarkMath, remarkDirective, desmos]}
        rehypePlugins={[rehypeKatex, rehypeUnwrapImages]}
      />
    </div>
  );
}

// extract readable text from ReactMarkdown AST children
export function getText(children: React.ReactNode): string {
  if (!children) return "";

  if (typeof children === "string") return children;
  if (typeof children === "number") return String(children);

  if (Array.isArray(children)) return children.map(getText).join("");

  if (React.isValidElement(children)) {
    const element = children as React.ReactElement<{
      children?: React.ReactNode;
    }>;
    return getText(element.props.children);
  }

  return "";
}
