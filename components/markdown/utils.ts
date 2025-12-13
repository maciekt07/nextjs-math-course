import React from "react";

export function stripMarkdown(md: string): string {
  return md
    .replace(/[*_~`]/g, "") //basic markdown symbols
    .replace(/\[(.*?)\]\(.*?\)/g, "$1") // links
    .trim();
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
