import Image from "next/image";
import type { Components } from "react-markdown";
import { CalloutBlock } from "@/components/markdown/blocks/callout-block";
import type { BlockType } from "@/components/markdown/blocks/callout-config";
import { slug } from "@/lib/slugify";
import type { Media } from "@/payload-types";
import { ImageZoom } from "../ui/shadcn-io/image-zoom";
import type { CalloutDivProps } from "./blocks/blocks-plugin";
import { DesmosGraph } from "./desmos/desmos-graph";
import type { DesmosDivProps } from "./desmos/desmos-plugin";
import { Heading } from "./heading";
import { KatexRenderer } from "./katex/katex-renderer";
import type { MathElementProps } from "./types";
import { getText, stripMarkdown } from "./utils";

let currentH2Text = "";

export function createMarkdownComponents(
  media?: Media[],
  optimizeMath?: boolean,
): Components {
  return {
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
            className="w-full rounded-2xl object-contain border-2 border-border"
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
        return <KatexRenderer content={props["data-content"]} block />;
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
              return (
                <KatexRenderer content={props["data-content"]} block={false} />
              );
            }
            return <span className={className}>{children}</span>;
          },
        }
      : {}),
    // generate stable IDs for h2/h3 for TOC
    // h3 IDs are namespaced under the last h2 to avoid collisions
    h2: ({ node, ...props }) => {
      const text = stripMarkdown(getText(props.children));
      currentH2Text = text;
      const id = slug(text);

      return (
        <Heading as="h2" id={id}>
          {props.children}
        </Heading>
      );
    },
    h3: ({ node, ...props }) => {
      const text = stripMarkdown(getText(props.children));
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
