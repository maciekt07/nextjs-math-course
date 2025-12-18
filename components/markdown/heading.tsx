"use client";
import { Link } from "lucide-react";
import { scrollToHeader } from "@/lib/markdown/scroll-to-header";
import { useSidebarStore } from "@/stores/sidebar-store";

type Heading = {
  as: "h2" | "h3";
  id: string;
  children: React.ReactNode;
};

export function Heading({ as: Tag, id, children }: Heading) {
  const sidebarOpen = useSidebarStore((state) => state.open);
  const iconSize = Tag === "h2" ? 20 : 16;

  return (
    <Tag id={id} className="group relative">
      <span className="inline">
        {children}
        <a
          href={`#${id}`}
          aria-label="link to section"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            scrollToHeader(id, { sidebarOpen });
          }}
          className="inline-flex items-center ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground align-middle"
        >
          <Link size={iconSize} />
        </a>
      </span>
    </Tag>
  );
}
