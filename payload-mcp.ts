import type { MCPPluginConfig } from "@payloadcms/plugin-mcp";
import type { CollectionConfig } from "payload";
import { isAdmin, isEditor } from "@/cms/access/roles";
import { VALID_BLOCK_TYPES } from "@/components/markdown/blocks/callout-config";
import { APP_NAME } from "@/lib/constants/site";

const formattedBlockTypes = new Intl.ListFormat("en", {
  type: "disjunction", // or
}).format(VALID_BLOCK_TYPES);

const lessonContentSyntaxGuide = `
The \`content\`, \`videoDescription\`, and all quiz fields are Markdown
with custom extensions:

- LaTeX inline math: $...$
- LaTeX block math: $$...$$
  - Exactly two dollar signs, never three or more.
  - Block math must not share a line with other text.
  - Use a single backslash for LaTeX commands, e.g. \\frac{a}{b}
    and \\int_{a}^{b}.
  - This is raw Markdown text, not a JSON or JS string, so
    backslashes must not be escaped.

- Mermaid (https://mermaid.js.org/) diagrams: fenced \`\`\`mermaid code blocks.
  - Math inside Mermaid uses KaTeX via \`$$...$$\` (double dollar,
    even for inline expressions — not the single \`$\` used
    elsewhere), and only works in flowchart/sequence diagrams.
  - Never write math as a literal text string in a label.
  - A node/label must be either pure math or pure text, never both
    mixed in the same node.

- Desmos graphs: ::desmos{url="..."}.
  - Use \`noEmbed=true\` to show the full calculator instead of the preview.
  - Example: ::desmos{url="https://www.desmos.com/calculator/id" noEmbed=true}
  - Never invent or guess a Desmos calculator ID or URL.
  - If a graph is needed but no URL was provided, search desmos.com
    for an existing public calculator that matches the concept and
    use that URL.

- Callout blocks:
  :::type{title="Custom Title"} content :::
  - \`type\` must be one of ${formattedBlockTypes}.
  - Each type has a sensible default title if \`title\` is omitted.
  - \`card\` defaults to "You will learn".
  - \`title\` must be plain text only.
  - Callout content may contain math or any other custom syntax above.

- Markdown headings:
  - Use ## for top-level sections.
  - Use ### for subsections.
  - Do not use # (h1).
`;

// https://github.com/payloadcms/payload/issues/17125

/**
 * @see https://payloadcms.com/docs/plugins/mcp
 */
const PayloadMCPConfig: MCPPluginConfig = {
  userCollection: "users",
  mcp: {
    serverOptions: {
      instructions:
        "Use this MCP server to manage math-course content. " +
        "Prefer read operations first, make the smallest necessary content changes. " +
        "Use `select` parameter to request only the fields needed for the task. " +
        "You are not allowed to publish or delete content.",
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
        "Individual lessons within a math course. Each belongs to a course and optional chapter, has a type (text/quiz/video), markdown content, quiz questions, or a linked Mux video with chapters. " +
        "Use to draft, edit, or review lesson content.\n\n" +
        lessonContentSyntaxGuide,
      overrideResponse: (response) => {
        response.content = response.content.map((item) => ({
          ...item,
          text: item.text
            .replace(
              /"videoBlurDataURL":\s*"[^"]*"/g,
              '"videoBlurDataURL": "[omitted]"',
            )
            .replace(/"blurhash":\s*"[^"]*"/g, '"blurhash": "[omitted]"')
            .replace(
              /"playbackOptions":\s*\[[\s\S]*?\](?=,|\s*})/g,
              '"playbackOptions": "[omitted]"',
            ),
        }));
        return response;
      },
    },
    chapters: {
      enabled: { find: true, create: true, update: true, delete: false },
      description:
        "Chapters group lessons within a course. " +
        "Has a title and a course relation. " +
        "Use to list, create, rename, or reorganize chapters.",
    },
    courses: {
      enabled: { find: true, create: true, update: true, delete: false },
      description:
        "Top-level math courses with pricing, description, and computed stats (lessonCount, totalVideoSeconds, etc). " +
        "Use to look up course metadata or update description/title. " +
        "You are not allowed to change the price.",
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
        if (isEditor(user)) {
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
