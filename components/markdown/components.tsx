import Image from "next/image";
import type { Components } from "react-markdown";
import { Heading } from "@/components/markdown/heading";
import { getText, stripMarkdown } from "@/components/markdown/utils";
import { slug } from "@/lib/slugify";
import type { Media } from "@/payload-types";
import { ImageZoom } from "../ui/shadcn-io/image-zoom";
import { DesmosGraph } from "./desmos/desmos-graph";
import type { DesmosDivProps } from "./desmos/desmos-plugin";

let currentH2Text = "";

export function createMarkdownComponents(media?: Media[]): Components {
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
  };
}
