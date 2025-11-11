import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

interface DesmosGraphProps {
  graphUrl: string;
  noEmbed?: boolean;
}

//TODO: add setting to not force the darkmode
export function DesmosGraph({ graphUrl, noEmbed = false }: DesmosGraphProps) {
  const graphId = graphUrl.split("/").pop() || graphUrl;
  const iframeUrl = noEmbed ? graphUrl : `${graphUrl}?embed`;
  const editUrl = graphUrl.includes("?") ? graphUrl.split("?")[0] : graphUrl;

  return (
    <div className="flex flex-col items-start gap-2">
      <iframe
        title={`Desmos Graph: ${graphId}`}
        src={iframeUrl}
        width="100%"
        height="500"
        className={cn(
          "rounded-2xl transition-all duration-300",
          !noEmbed
            ? "border border-gray-300 dark:[filter:invert(1)_hue-rotate(180deg)_brightness(0.9)_contrast(1.1)]"
            : "border-none",
        )}
        loading="lazy"
      />
      <Button asChild className="mt-1 w-full" variant="outline">
        <a
          href={editUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="no-underline"
        >
          Edit Graph on Desmos <ExternalLink />
        </a>
      </Button>
    </div>
  );
}
