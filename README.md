# GTD

A local-first task manager that follows David Allen's *Getting Things Done* as
closely as possible — see [DESIGN.md](DESIGN.md) for how each screen maps to the
book and what was deliberately left out.

- **Capture** from any screen straight into the Inbox.
- **Clarify** with the book's questions, one at a time: actionable? a project?
  under two minutes? do it, delegate it, or defer it?
- **Organize** into Next Actions (by context), Calendar, Waiting For, Projects,
  Someday/Maybe (with a tickler that returns items to the Inbox on their day) and
  Reference.
- **Never lose a project**: finishing any action of a project asks
  *"What's the next action?"* on the spot. Projects with nothing in motion are
  flagged as stalled everywhere until they get one.
- **Reflect** with the book's Weekly Review — Get clear, Get current, Get creative.

React, TypeScript, Vite, Zustand and Tailwind. Data syncs across devices through
Firebase Firestore (Google sign-in, works offline, installable as a PWA) — see
[docs/adr/0001-firestore-sync.md](docs/adr/0001-firestore-sync.md) and
[docs/firebase-setup.md](docs/firebase-setup.md). Export/Import stay as backups.

## Development

```bash
npm install
npm run dev
npm test        # domain + store tests
npm run lint
npm run build
```

## Deployment

Deployed on [Vercel](https://vercel.com), auto-deploying from the `master`
branch of this repository.
