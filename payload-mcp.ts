import type { MCPPluginConfig } from "@payloadcms/plugin-mcp";
import type { CollectionConfig } from "payload";
import { isAdmin, isAdminOrEditor } from "@/cms/access/roles";
import { APP_NAME } from "@/lib/constants/site";

const lessonContentSyntaxGuide = `The \`content\`, \`videoDescription\`, and all quiz fields are Markdown with custom extensions:
- LaTeX inline math as $...$ and block math as $$...$$ (exactly two dollar signs, never three or more, and never on the same line as other text for block math). Write LaTeX commands with a single backslash, e.g. \\frac{a}{b} and \\int_{a}^{b}, not \\\\frac or \\\\int — this is raw Markdown text, not a JSON or JS string, so backslashes must not be escaped.
- Mermaid diagrams as a fenced \`\`\`mermaid code block.
- Desmos graphs as ::desmos{url="..."}.
- Callout blocks as :::type{title="Custom Title"} content :::, where type is one of note, tip, important, warning, or card. Each type has a sensible default title if title is omitted (card defaults to "You will learn"); title must be plain text only, but the callout content can include math or any of the other custom syntax above.
- Structure content with Markdown headings: use ## for top-level sections and ### for subsections. Do not use # (h1)`;

// https://github.com/payloadcms/payload/issues/17125

/**
 * @see https://payloadcms.com/docs/plugins/mcp
 */
const PayloadMCPConfig: MCPPluginConfig = {
  userCollection: "users",
  mcp: {
    serverOptions: {
      instructions:
        "Use this MCP server to manage math-course content. Prefer read operations first, make the smallest necessary content changes.",
      serverInfo: {
        name: `${APP_NAME} CMS`,
        version: "0.1.0",
      },
    },
  },
  collections: {
    lessons: {
      enabled: { find: true, create: true, update: true, delete: false },
      description:
        "Individual lessons within a math course. Each belongs to a course and optional chapter, has a type (text/quiz/video), markdown content, quiz questions, or a linked Mux video with chapters. Use to draft, edit, or review lesson content.\n\n" +
        lessonContentSyntaxGuide,
      overrideResponse: (response) => {
        response.content = response.content.map((item) => ({
          ...item,
          text: item.text
            .replace(
              /"videoBlurDataURL":\s*"[^"]*"/g,
              '"videoBlurDataURL": "[omitted]"',
            )
            .replace(/"blurhash":\s*"[^"]*"/g, '"blurhash": "[omitted]"'),
        }));
        return response;
      },
    },
    chapters: {
      enabled: { find: true, create: true, update: true, delete: false },
      description:
        "Chapters group lessons within a course. Has a title and a course relation. Use to list, create, rename, or reorganize chapters.",
    },
    courses: {
      enabled: { find: true, create: true, update: true, delete: false },
      description:
        "Top-level math courses with pricing, description, and computed stats (lessonCount, totalVideoSeconds, etc). Use to look up course metadata or update description/title, not price.",
      overrideResponse: (response) => {
        response.content = response.content.map((item) => ({
          ...item,
          text: item.text.replace(
            /"blurhash":\s*"[^"]*"/g,
            '"blurhash": "[omitted]"',
          ),
        }));
        return response;
      },
    },
  },

  overrideApiKeyCollection: (
    collection: CollectionConfig,
  ): CollectionConfig => ({
    ...collection,
    access: {
      read: ({ req }) => {
        const user = req.user;
        if (isAdmin(user)) return true;
        if (isAdminOrEditor(user)) {
          return {
            user: {
              equals: user?.id,
            },
          };
        }
        return false;
      },
      create: ({ req }) => isAdmin(req.user),
      update: ({ req }) => isAdmin(req.user),
      delete: ({ req }) => isAdmin(req.user),
    },
  }),
};

export default PayloadMCPConfig;
