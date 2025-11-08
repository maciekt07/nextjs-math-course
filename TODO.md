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

- [ ] Add different lesson types:
  - [ ] Video lessons (Mux Video Payload Plugin)
  - [x] Quizzes
- [ ] Redesign custom fields
  - [ ] Markdown preview
  - [ ] Reorder
  - [ ] Quiz type fields
- [x] Protect media for premium lessons
  - [x] Optimize static images
- [x] Add optional Cloudflare R2 support for media uploads
- [x] Generate blur placeholder for media
  - [ ] Make it optional with automatic generation and cleanup

## UI / UX

- [ ] Improve sidebar animations
- [ ] Add settings dialog with option to disable colored markdown
- [ ] Animate hero svg
