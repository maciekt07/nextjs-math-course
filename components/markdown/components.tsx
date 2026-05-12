import Image from "next/image";
import Link from "next/link";
import type { Components } from "react-markdown";
import { ExternalLink } from "@/components/animate-ui/icons/external-link";
import { AnimateIcon } from "@/components/animate-ui/icons/icon";
import { CalloutBlock } from "@/components/markdown/blocks/callout-block";
import type { BlockType } from "@/components/markdown/blocks/callout-config";
import { stripBasicMarkdown } from "@/lib/markdown/strip-markdown";
import { slug } from "@/lib/slugify";
import type { Media } from "@/types/payload-types";
import { ImageZoom } from "../ui/shadcn-io/image-zoom";
import type { CalloutDivProps } from "./blocks/blocks-plugin";
import { DesmosGraph } from "./desmos/desmos-graph";
import type { DesmosDivProps } from "./desmos/desmos-plugin";
import { Heading } from "./heading";
import { KatexRenderer } from "./katex/katex-renderer";
import type { MathElementProps } from "./types";
import { getText } from "./utils";

let currentH2Text = "";

interface CreateMarkdownComponentsOptions {
  media?: Media[];
  optimizeMath?: boolean;
  optimizeImages?: boolean;
}

const MATH_SSR_THRESHOLD = 15;

export function createMarkdownComponents({
  media,
  optimizeMath = false,
  optimizeImages = false,
}: CreateMarkdownComponentsOptions): Components {
  let mathElementCount = 0;
  return {
    a: ({ node, href, children, ...props }) => {
      const isExternal = href?.startsWith("http") || href?.startsWith("//");

      if (isExternal) {
        return (
          <AnimateIcon animateOnHover>
            <a
              {...props}
              href={href}
              className="inline-flex items-center gap-1 text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              {/* <span className="inline-flex items-center justify-center size-5">
                <img
                  src={`https://www.google.com/s2/favicons?sz=32&domain_url=${href}`}
                  alt="favicon"
                  className="size-4"
                />
              </span> */}

              <span>{children}</span>

              <ExternalLink className="ml-0.5 size-4" />
            </a>
          </AnimateIcon>
        );
      }

      return (
        <Link
          {...props}
          href={href ?? "#"}
          className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
        >
          {children}
        </Link>
      );
    },
    img: ({ node, ...props }) => {
      const matchedMedia = media?.find((m) => m.url === props.src);
      const blurhash = matchedMedia?.blurhash;
      const width = matchedMedia?.width ?? 800;
      const height = matchedMedia?.height ?? 500;

      return (
        <ImageZoom>
          <Image
            {...props}
            src={props.src as string}
            alt={props.alt || "Image"}
            width={width}
            height={height}
            loading="lazy"
            unoptimized={!optimizeImages}
            placeholder={blurhash ? "blur" : "empty"}
            blurDataURL={blurhash || undefined}
            className="w-full rounded-2xl object-contain border-1 shadow-sm"
          />
        </ImageZoom>
      );
    },

    div({
      className,
      children,
      ...props
    }: MathElementProps & DesmosDivProps & CalloutDivProps) {
      // handle callout blocks
      if (className?.includes("callout-block")) {
        const blockType = props["data-block-type"] as BlockType;
        const blockTitle = props["data-block-title"];
        // const blockDescription = props["data-block-description"];

        return (
          <CalloutBlock type={blockType} title={blockTitle}>
            {children}
          </CalloutBlock>
        );
      }

      // handle Desmos graphs
      if (className?.includes("desmos-graph")) {
        const graphUrl = props["data-graph-url"];
        const noEmbed = props["data-no-embed"] === "true";
        if (!graphUrl) return null;
        return <DesmosGraph graphUrl={graphUrl} noEmbed={noEmbed} />;
      }

      // KaTeX block math
      if (
        optimizeMath &&
        className === "math-display" &&
        typeof props["data-content"] === "string"
      ) {
        const shouldLazy = mathElementCount >= MATH_SSR_THRESHOLD;
        mathElementCount++;
        return (
          <KatexRenderer
            content={props["data-content"]}
            block
            shouldLazy={shouldLazy}
          />
        );
      }

      return <div className={className}>{children}</div>;
    },
    // KaTeX inline math
    ...(optimizeMath
      ? {
          span: ({ className, children, ...props }: MathElementProps) => {
            if (
              className === "math-inline" &&
              typeof props["data-content"] === "string"
            ) {
              const shouldLazy = mathElementCount >= MATH_SSR_THRESHOLD;
              mathElementCount++;
              return (
                <KatexRenderer
                  content={props["data-content"]}
                  block={false}
                  shouldLazy={shouldLazy}
                />
              );
            }
            return <span className={className}>{children}</span>;
          },
        }
      : {}),
    // generate stable IDs for h2/h3 for TOC
    // h3 IDs are namespaced under the last h2 to avoid collisions
    h2: ({ node, ...props }) => {
      const text = stripBasicMarkdown(getText(props.children));
      currentH2Text = text;
      const id = slug(text);

      return (
        <Heading as="h2" id={id}>
          {props.children}
        </Heading>
      );
    },
    h3: ({ node, ...props }) => {
      const text = stripBasicMarkdown(getText(props.children));
      const parent = currentH2Text || "section";
      const id = slug(`${parent}-${text}`);

      return (
        <Heading as="h3" id={id}>
          {props.children}
        </Heading>
      );
    },
    table: ({ node, ...props }) => (
      <div className="table-container">
        <table {...props} />
      </div>
    ),
  };
}
