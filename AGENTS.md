# AGENTS.md

## Overview

Full-stack math-course platform built with Next.js 16. Manages and sells courses containing text, video, quizzes, LaTeX, interactive Desmos graphs, Mermaid diagrams, and custom callouts. Includes a public learner site, authenticated accounts, Stripe checkout, a Payload CMS admin panel, scheduled publishing, transactional email, media delivery, and an MCP interface for CMS workflows.

## Technology and architecture

- **Web:** Next.js 16, React 19, React Compiler, Turbopack, TypeScript, pnpm.
- **CMS:** Payload CMS 3 with MongoDB. Payload is the source of truth for courses, chapters, lessons, posters, media, CMS users, feedback, drafts, versions, and publishing workflows.
- **Application data:** PostgreSQL via Drizzle ORM. Postgres is the source of truth for Better Auth data and course enrollments/payment state.
- **Authentication:** Better Auth with Google OAuth & email auth.
- **Payments:** Stripe Checkout for one-time purchases; Stripe webhooks update enrollment state.
- **Video:** Mux uploads and playback. Free videos may be public; paid videos use signed playback URLs.
- **Email:** Resend + React Email templates.
- **Jobs:** Payload Jobs Queue triggered by QStash through `/api/cron/run`, for scheduled publishing and failure notifications.
- **Storage:** S3-compatible (AWS S3 or Cloudflare R2), split into public CDN and private buckets.
- **Tooling:** Biome, Vitest, Playwright (Chromium), Knip.

## Environment variables

T3 Env in `env/server.ts` and `env/client.ts`.

- Import `serverEnv` for server-only config/secrets, `clientEnv` for browser-safe `NEXT_PUBLIC_*` config.
- Never read application config with `process.env` in feature code — reserved for bootstrap/validation and process metadata (`NODE_ENV`, `CI`, `SKIP_ENV_VALIDATION`).
- Add variables to the correct T3 Env schema and `.env.example` together.

## Rendering, access, and caching

- Free lessons are statically generated for SEO; paid lessons render on demand so enrollment can be checked server-side.
- Never rely on client-only checks for paid content, private media, or signed Mux playback.
- Public posters/free media use the public CDN; paid media uses private storage and short-lived presigned URLs.
- Lesson/enrollment data is cached — preserve existing cache tags and revalidation behavior.
- Payload hooks and Stripe webhooks revalidate affected pages/data after content or access changes.

## Authentication, payments, and security

- Keep auth/authorization in established Better Auth, access-control, and server-side data-access modules.
- Validate untrusted input at API, server-action, webhook, and CMS boundaries.
- Verify Stripe webhook signatures; enrollment updates must be idempotent.
- Restrict CMS admin, Mux management, private media, and MCP operations to appropriate admin/editor or authenticated access rules.

## Payload CMS workflow

Payload runs at `/admin`, API under the Payload route group. MongoDB, Lexical, Resend, Mux, optional S3/R2 adapters, GraphQL disabled.

After changing collections, fields, hooks, or Payload config:

```bash
pnpm cms:gen-types
pnpm cms:gen-map
```

Types generate to `types/payload-types.ts`; admin import map generates under the Payload app route. Don't hand-edit generated files.

MCP endpoint is `/api/mcp`. MCP changes are draft/version-controlled content changes and must not bypass CMS access controls or publication workflow.

## Verification

```bash
pnpm lint
pnpm test:typecheck
pnpm knip
pnpm test:unit
pnpm test:int
pnpm test:e2e
```

Full suite: `pnpm test`. Integration tests require Postgres and MongoDB; E2E uses Chromium and starts the dev server automatically. For changes affecting shared infrastructure, auth, payments, CMS, storage, caching, routing, or lesson rendering, run lint, typecheck, and relevant integration/E2E coverage before finishing.

## Engineering conventions

- Follow existing patterns before adding abstractions; keep changes focused.
- Use server actions or route handlers for mutations and privileged work.
- Keep server-only modules, secrets, database clients, and privileged integrations out of client bundles.
- Use Biome, not ESLint or Prettier.
- Don't verify with browsers or computer use unless the user explicitly agrees or requests it.
- Inferred types over annotations. `any` is the enemy.
- Avoid unnecessary comments; only add comments that provide meaningful context or explain non-obvious engineering decisions.
