import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/stores/settings-store";

interface DesmosGraphProps {
  graphUrl: string;
  noEmbed?: boolean;
}

//FIXME: iframe refresh on setting change
export function DesmosGraph({ graphUrl, noEmbed = false }: DesmosGraphProps) {
  const { desmosForceDarkMode } = useSettingsStore();

  const graphId = graphUrl.split("/").pop() || graphUrl;
  const iframeUrl = noEmbed ? graphUrl : `${graphUrl}?embed`;
  const editUrl = graphUrl.includes("?") ? graphUrl.split("?")[0] : graphUrl;
  const forceDarkMode = !noEmbed && desmosForceDarkMode;

  return (
    <div
      className={cn(
        "w-full rounded-2xl border-2 border-border bg-background",
        "flex flex-col overflow-hidden",
      )}
    >
      <div className="relative">
        <iframe
          title={`Desmos Graph: ${graphId}`}
          src={iframeUrl}
          loading="lazy"
          className={cn(
            "block h-[500px] w-full transition-all duration-300",
            forceDarkMode &&
              "dark:[filter:invert(1)_hue-rotate(180deg)_brightness(0.9)_contrast(1.1)]",
          )}
        />
      </div>
      <div className="border-t-2 border-border p-3">
        <Button asChild className="w-full" variant="outline">
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
    </div>
  );
}
