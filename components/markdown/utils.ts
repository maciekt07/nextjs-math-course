import React from "react";

type TextNode = {
  value?: unknown;
  children?: unknown;
};

// extract readable text from ReactMarkdown AST children
export function getText(children: React.ReactNode | unknown): string {
  if (!children) return "";

  if (typeof children === "string") return children;
  if (typeof children === "number") return String(children);

  if (Array.isArray(children)) return children.map(getText).join("");

  const textNode = children as TextNode;
  if (typeof textNode.value === "string") return textNode.value;
  if (Array.isArray(textNode.children)) {
    return textNode.children.map(getText).join("");
  }

  if (React.isValidElement(children)) {
    const element = children as React.ReactElement<{
      children?: React.ReactNode;
    }>;
    return getText(element.props.children);
  }

  return "";
}

export function getNodeId(node: unknown): string | undefined {
  const id = (node as { properties?: { id?: unknown } })?.properties?.id;
  return typeof id === "string" ? id : undefined;
}
