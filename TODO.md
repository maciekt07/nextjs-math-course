# ✅ TODO

## Auth

- [ ] Integrate OAuth login with Google
- [ ] Implement forgot password and reset password functionality
- [ ] Limit simultaneous logins per account

## Payments

- [x] Integrate Stripe one-time payments with Payload CMS
  - [x] Configure products, checkout sessions, and webhooks
  - [x] Protect paid lesson routes (require auth + payment check)
  - [x] Use hybrid SSR + SSG:
    - Free lessons: static pages
    - Paid/protected lessons: SSR
- [ ] Implement course bundles

## CMS

- [x] Add different lesson types:
  - [x] Video lessons (Mux Video Payload Plugin)
  - [x] Quizzes
- [ ] Redesign custom fields
  - [x] Markdown preview
  - [ ] Lesson image upload
- [x] Integrate Desmos graphs support
- [x] Protect media for premium lessons
  - [x] Optimize static images
- [x] Add optional Cloudflare R2 support for media uploads
- [x] Generate blur placeholder for media
  - [ ] Make it optional with automatic generation and cleanup
- [x] Improve caching and add on-demand revalidation
- [x] Add video chapters [docs](https://www.mux.com/docs/guides/player-advanced-usage#chapters-example)
- [x] Add lesson feedback form
- [ ] Add course-release email notifications
- [x] Add custom Markdown callout blocks
- [ ] Add drafts [docs](https://payloadcms.com/docs/versions/drafts)
- [ ] Add lesson groups

## UI / UX

- [x] Improve sidebar animations
- [x] Add settings dialog for course view
- [x] Animate hero svg [video](https://www.youtube.com/watch?v=SrmTDrN1lkU)
- [ ] Add ambient light effect for video [demo](https://codesandbox.io/p/sandbox/ambient-mode-vv63e9)
- [x] Add top loading bar
- [x] Add TOC to markdown
- [x] Add OpenDyslexic font for lessons
- [x] Add next/previous lesson navigation
- [x] Add heading anchor links on hover to markdown
- [ ] Use responsive pagination for quiz [shadcn](https://ui.shadcn.com/docs/components/pagination)
- [x] Redesign course cards to be more responsive

## Backend

- [x] Add in-memory rate limiting
- [ ] Track lesson completion and quiz progress per user in DB
- [ ] Update Next.js caching [payload/pull/14456](https://github.com/payloadcms/payload/pull/14456)
