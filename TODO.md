# ✅ TODO

## Auth

- [ ] Integrate OAuth login with GitHub and Google
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
  - [ ] Markdown preview
  - [ ] Reorder
  - [ ] Quiz type fields
- [x] Integrate Desmos graphs support
- [x] Protect media for premium lessons
  - [x] Optimize static images
- [x] Add optional Cloudflare R2 support for media uploads
- [x] Generate blur placeholder for media
  - [ ] Make it optional with automatic generation and cleanup
- [ ] Improve caching and add on-demand revalidation
- [x] Add video chapters

## UI / UX

- [ ] Improve sidebar animations
- [x] Add settings dialog for course view
- [x] Animate hero svg [video](https://www.youtube.com/watch?v=SrmTDrN1lkU)
- [ ] Add ambient light effect for video [demo](https://codesandbox.io/p/sandbox/ambient-mode-vv63e9)
- [ ] Track lesson completion and quiz progress per user in DB
- [x] Add top loading bar
- [x] Add TOC to markdown
- [ ] Add feedback form
- [ ] Add OpenDyslexic font for lessons
