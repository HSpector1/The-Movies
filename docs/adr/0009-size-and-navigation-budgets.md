# ADR 0009: Size and navigation budgets for touched code and documentation

- Status: Proposed
- Date: 2026-08-23
- Credit: distilled from PR #5 (`ask-the-six`), ADR-0007/0009/0010 there, re-scoped
  to the current Unity-convergence architecture rather than merged from its
  obsolete `phase-5.1-talent` base.

## Context

This codebase is built almost entirely by long agent sessions. Agents edit by
reading whole files into context, so file size is directly the cost, latency,
and merge risk of every future session. The repository demonstrates unbounded
accretion: `src/core/save.ts` is ~244 KB, `src/core/actions.ts` ~114 KB,
`src/core/placement.ts` ~92 KB, and several campaign documents exceed 4,000
lines. PR #5 made this case correctly; its exact thresholds and CI gates were
authored against a repository shape that no longer exists.

## Decision

1. **Guidance budgets, applied to new or substantially touched artifacts** —
   not retroactively: new production source files target ≤400 lines (review at
   700); new functions target ≤40 lines; new standalone docs target ≤400 lines
   with a hard preference for linking over inlining. Existing files are
   grandfathered; exceeding a budget in a touched file requires one sentence of
   justification in the commit or checkpoint record, not silence.
2. **Decompose on touch, by stable seams.** When a campaign materially rewrites
   part of a grandfathered monolith (for example `save.ts` frozen version
   schemas, `actions.ts` per-action validators), it should split along seams
   that already exist, mechanically and behavior-identically, in its own
   commit. No standalone big-bang decomposition campaign is authorized by this
   ADR; evidence of material maintenance benefit is required first.
3. **Navigable root.** Session-facing entry documents (`START-HERE.md`, the
   campaign handoff top section, the promotion register head) must stay
   current-first: the newest authoritative state appears before historical
   material, and historical sections are clearly marked as history.

No CI enforcement is introduced by this ADR; if budgets prove routinely
ignored, a follow-up ADR may add a new-files-only line-count check.

## Consequences

- New code and docs stay readable by future sessions without a repository-wide
  rewrite or a wall of failing gates on day one.
- Monolith decomposition happens where maintenance is already paying the cost,
  preserving the evidence-first law against speculative refactors.

## Revisit when

CI budget enforcement is proposed, a decomposition of `save.ts`/`actions.ts`
is actually scheduled, or the budgets prove miscalibrated in practice.
