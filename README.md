# Project: Studio

Project: Studio is a private studio-management simulation and a modern successor to
*The Movies* (2005).

The product north star is deliberately direct:

> "This is *The Movies*."
>
> "Holy shit, this is what *The Movies* should be today."

The Studio Lot is the primary game surface. Players should understand the studio as a
place they operate, build, expand, and read through the world itself, with overlays only
where the decision complexity earns them.

The engine state is authoritative. Presentation reacts to simulation truth; presentation
never owns, creates, or persists simulation truth. Determinism, seeded simulation, and
versioned saves are product constraints, not implementation details.

## Quickstart

Install dependencies:

```bash
npm ci
```

Run locally:

```bash
npm run dev -- --host 127.0.0.1
```

Open `http://127.0.0.1:5173/`.

Run the test suite:

```bash
npm test
```

Run typecheck:

```bash
npm run typecheck
```

Additional scripts:

```bash
npm run test:core
npm run test:ui
npm run build
npm run preview
```

## Major Docs

Start with the current repository docs, not the GitHub landing branch if it is stale.

- [PROJECT-STUDIO-SUCCESS-BLUEPRINT.md](PROJECT-STUDIO-SUCCESS-BLUEPRINT.md) - destination, product bar, permanent development laws, and long-term successor standard.
- [THE-MOVIES-PARITY-MASTER-PLAN.md](THE-MOVIES-PARITY-MASTER-PLAN.md) - sequencing, parity gaps, campaign framing, and test gates.
- [CLAUDE.md](CLAUDE.md) - standing agent and engineering instructions, including historical notes and current authority warnings.
- [START-HERE.md](START-HERE.md) - local launch notes and project orientation.

For original-derived mechanics, read the Mechanics Bible before changing behavior:
`THE-MOVIES-2005-COMPLETE-MECHANICS-BIBLE.md` is the historical floor referenced by the
Blueprint.

## Current Development Rule

Contributors must:

- branch from the explicitly assigned authority;
- never directly push to `main`;
- never work on the active shared implementation branch unless assigned;
- use their own branch or worktree;
- submit work for review;
- preserve deterministic simulation;
- read the Mechanics Bible before changing original-derived mechanics.

Do not use a broad planning document as permission to implement a feature. Current scope
comes from the active charter, current Owner rulings, and the branch authority assigned
for the work.

## Engineering Boundaries

- Keep simulation logic in the engine. UI and rendering are presentation layers.
- Use seeded deterministic paths only; do not introduce unseeded randomness.
- Prefer existing Project: Studio systems before adding parallel machinery.
- Preserve save compatibility and migration discipline when touching persisted state.
- Keep documentation changes separate from code changes unless the assigned task says
  otherwise.
