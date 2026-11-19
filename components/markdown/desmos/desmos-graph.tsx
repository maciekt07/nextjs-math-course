"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink } from "@/components/animate-ui/icons/external-link";
import { AnimateIcon } from "@/components/animate-ui/icons/icon";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/ui";
import { useSettingsStore } from "@/stores/settings-store";

interface DesmosGraphProps {
  graphUrl: string;
  noEmbed?: boolean;
}

export function DesmosGraph({ graphUrl, noEmbed = false }: DesmosGraphProps) {
  const desmosForceDarkMode = useSettingsStore(
    (state) => state.desmosForceDarkMode,
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState<boolean>(false);

  useEffect(() => {
    const element = containerRef.current;
    if (!element || shouldLoad) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "800px 0px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [shouldLoad]);

  const [baseUrl] = graphUrl.split("?");

  const graphId = baseUrl.split("/").pop() ?? graphUrl;
  const iframeUrl = noEmbed ? graphUrl : `${baseUrl}?embed`;
  const editUrl = baseUrl;
  const forceDarkMode = !noEmbed && desmosForceDarkMode;

  return (
    <div
      className={cn(
        "w-full rounded-2xl border-1 border-border bg-background shadow-sm",
        "flex flex-col overflow-hidden",
      )}
    >
      <div
        ref={containerRef}
        className="relative w-full h-[400px] sm:h-[500px]"
      >
        {shouldLoad ? (
          <iframe
            title={`Desmos Graph: ${graphId}`}
            src={iframeUrl}
            loading="lazy"
            className={cn(
              "block size-full transition-all duration-300",
              forceDarkMode && "dark:[filter:invert(1)_hue-rotate(180deg)]",
            )}
          />
        ) : (
          <div className="size-full flex items-center justify-center bg-background" />
        )}
      </div>
      <div className="border-t-1 border-border p-3">
        <AnimateIcon animateOnHover>
          <Button asChild className="w-full" variant="outline">
            <a
              href={editUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="no-underline"
            >
              Edit Graph on Desmos <ExternalLink size={24} />
            </a>
          </Button>
        </AnimateIcon>
      </div>
    </div>
  );
}
