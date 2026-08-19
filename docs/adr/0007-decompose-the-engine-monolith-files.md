# ADR-0007: Decompose the engine's monolith files

- Status: Proposed
- Date: 2026-08-19
- Owners: repo owner (HSpector1)

## Context

The core's *module* boundary is clean (ADR-0002/0003), but inside `src/core/` several
files have become session-accretion monoliths (sizes on `main`, 2026-08-19):

| File | Size | What's inside |
|---|---|---|
| `save.ts` | 190 KB (~4,400+ lines) | 13 frozen version schemas + 12 migrations + writer |
| `placement.ts` | 91 KB | lot/world placement |
| `actions.ts` | 83 KB | every action validator+applier |
| `tuning.ts` | 74 KB | all constants |
| `types.ts` | 60 KB | all shared types |

Cost is concrete for this project's workflow: agent sessions edit by reading whole
files into context; a 190 KB file makes every save-touching session slower, riskier,
and more merge-prone. `DECISIONS.md` already had to cite `save.ts:4388` to prove what
the writer version was — a fact that would be a filename in a decomposed layout.

## Decision

Split by **stable seams that already exist**, mechanically, with zero behavior change:

1. `save/` — one module per frozen version (`v1.ts` … `v13.ts`: schema + its inbound
   migration), plus `write.ts` (current writer) and `index.ts` (public API unchanged).
   Frozen versions become genuinely frozen *files* that no future diff touches.
2. `actions/` — one module per action family (assembly, casting, facilities, …), an
   `index.ts` dispatch table preserving the current `applyActions` signature.
3. `tuning.ts` / `types.ts` — split along the same family lines as (2) once actions
   are split; keep barrel exports so imports don't churn.
4. Guard: the ADR-0009 size budgets (file 200/350/500, function 20/40/60) enforced in
   CI on new-or-touched core files, with frozen `save/v*.ts` exempt (write-once).

Verification per step: `npm run typecheck`, full vitest suite, plus one harness run
with a pinned seed asserting an identical end-state digest before/after the move.

## Options considered

1. **Leave it** — the code works; but growth is monotonic (V14, V15… land in the same
   file) and each session pays the context tax again. Rejected.
2. **Full re-architecture** (feature folders, aggregate extraction) — more design risk
   than value while the sim is still being tuned; the module map is not the problem,
   file granularity is. Rejected for now.
3. **Mechanical split along existing seams (chosen)** — reversible, reviewable,
   verifiable by digest.

## Consequences

- One noisy-but-mechanical PR series; `git log --follow` preserves file history.
- Future save versions arrive as one new file + one line in the writer — the frozen
  property becomes visible in the diff, not just in comments.
- Merge conflicts between parallel sessions drop sharply (today any two
  action-touching sessions collide in `actions.ts`).

## Revisit when

After the split, if any single module crosses ~500 lines again, the seam was wrong —
revisit the boundary rather than re-splitting arbitrarily.
