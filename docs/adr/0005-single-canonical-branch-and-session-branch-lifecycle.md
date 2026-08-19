# ADR-0005: One canonical branch; session branches are ephemeral

- Status: Proposed
- Date: 2026-08-19
- Owners: repo owner (HSpector1) — requires an Owner ruling to supersede the marathon
  publication ruling

## Context

The repo currently has **56 remote branches and no canonical line**:

- GitHub's default branch is `phase-5.1-talent` — which is an *ancestor* of `main`
  (`git merge-base origin/main phase-5.1-talent` = `3ac66bb` = its own HEAD), so the
  landing page and fresh clones show outdated code.
- `DECISIONS.md` (on `main`) names a *different* frontier: `first-movie-journey-v1`,
  opened 2026-08-17 by Owner order.
- The marathon-era publication ruling says "**Never merge or push `main`**" — a
  session-scoped safety rule that, left standing, permanently prevents any branch from
  ever becoming canonical.
- Work is preserved as branch-per-session (`asset-lab-05a`…`05i`,
  `operation-hollywood-autonomous-marathon`, `tycoon-world-conversion-12h`, …) and
  "sealed" states are kept as branches, though the marathon seal itself already uses an
  annotated tag (`operation-hollywood-marathon-sealed`).

## Decision

1. **`main` is the canonical line.** Set it as the GitHub default branch. The
   marathon publication ruling is superseded for `main` *merges*; the force-push and
   tag-hygiene provisions stay.
2. Land the current frontier: merge (or rebase-land) `first-movie-journey-v1` and any
   other branch whose closure doc says "accepted" into `main`. A branch not landed
   within one milestone of its closure is presumed abandoned.
3. **Session branches are ephemeral**: created per session, merged or explicitly
   rejected, then deleted. "Sealed" checkpoints become **annotated tags**, matching the
   marathon precedent — tags don't clutter branch listings and can't drift.
4. One triage pass over the existing 55: land the accepted, tag the sealed, delete the
   rest (they remain reachable via tags/reflog on the fork if ever needed).

## Options considered

1. **Status quo** (branch museum) — rejected: nobody, including the owner's own
   decision index, can name the current build; it also blocks ADR-0006's history purge
   because stale branches keep dead blobs reachable.
2. **Declare `first-movie-journey-v1` canonical instead of `main`** — viable if `main`
   is considered historical; still requires picking exactly one and deleting the rest.
   The Owner should choose; this ADR defaults to `main` because the decision index and
   protections already live there.
3. **One canonical branch + tags for seals (chosen).**

## Consequences

- "Which build is current" becomes answerable by URL.
- Session workflows need one new habit: end a session by landing or deleting the
  branch, and recording seals as tags.
- Deleting branches changes commit reachability — do the triage *before* the ADR-0006
  history rewrite so the rewrite actually shrinks the repo.

## Revisit when

Multiple long-lived product lines genuinely exist (e.g. a stable playtest line vs an
experimental engine line) — that's release branching, a different decision.
