# ✅ TODO

## Auth

- [ ] Integrate OAuth login with GitHub and Google
- [ ] Implement forgot password and reset password functionality
- [ ] Limit simultaneous logins per account

## Payments

- [ x ] Integrate Stripe one-time payments with Payload CMS
  - [ x ] Configure products, checkout sessions, and webhooks
  - [ x ] Protect paid lesson routes (require auth + payment check)
  - [ x ] Use hybrid SSR + SSG:
    - Free lessons: static pages
    - Paid/protected lessons: SSR
- [ ] Implement course bundles

## CMS

- [ ] Add different lesson types:
  - [ ] Video lessons
  - [ ] Quizzes
- [ ] Redesign custom fields
  - [ ] Markdown preview
  - [ ] Reorder

## UI / UX

- [ ] Make navbar, sidebar, and all components fully responsive
