"use client";

import mermaid from "mermaid";
import { useTheme } from "next-themes";
import { useEffect, useId, useRef, useState } from "react";
import { getMermaidThemeVariables } from "./mermaid-theme";

interface MermaidDiagramProps {
  code: string;
}

let initializedTheme: string | undefined;

function ensureMermaidInitialized(resolvedTheme: string | undefined) {
  if (initializedTheme === resolvedTheme) return;

  mermaid.initialize({
    startOnLoad: false,
    securityLevel: "strict",
    theme: "base",
    themeVariables: getMermaidThemeVariables(resolvedTheme),
  });

  initializedTheme = resolvedTheme;
}

export function MermaidDiagram({ code }: MermaidDiagramProps) {
  const id = useId().replaceAll(":", "");
  const { resolvedTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;

    async function renderDiagram() {
      try {
        setError(null);
        setSvg(null);

        ensureMermaidInitialized(resolvedTheme);

        const result = await mermaid.render(`mermaid-${id}`, code);

        if (isCurrent) {
          setSvg(result.svg);
        }
      } catch (renderError) {
        if (isCurrent) {
          setError(
            renderError instanceof Error
              ? renderError.message
              : "Unable to render Mermaid diagram.",
          );
        }
      }
    }

    void renderDiagram();

    return () => {
      isCurrent = false;
    };
  }, [code, id, resolvedTheme]);

  useEffect(() => {
    if (!containerRef.current) return;

    containerRef.current.innerHTML = svg ?? "";
  }, [svg]);

  if (error) {
    return (
      <pre className="my-6 w-full whitespace-pre-wrap p-4 text-sm text-destructive">
        <code>{error}</code>
      </pre>
    );
  }

  return (
    <div
      ref={containerRef}
      className="my-6 w-full overflow-x-auto p-4 [scrollbar-width:auto] [&>svg]:mx-auto [&>svg]:block [&>svg]:h-auto [&>svg]:max-w-none"
    />
  );
}
