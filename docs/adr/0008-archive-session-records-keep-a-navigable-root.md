# ADR-0008: Archive session records; keep a navigable root

- Status: Proposed
- Date: 2026-08-19
- Owners: repo owner (HSpector1)

## Context

The repo root and `docs/` mix three unrelated audiences:

- **Players/visitors**: nothing — there is no README; the entry docs
  (`START-HERE.md`, `KICKOFF-PROMPT.md`) are instructions for setting up the *agent
  workspace*, not the game.
- **Standing policy**: `DECISIONS.md`, `docs/build-contract.md`,
  `docs/SHIFT-OPERATIONAL-LAWS.md` — load-bearing, but adrift among…
- **Session narrative**: ~18 root-level LOG/HANDOFF/CHARTER/REPORT files and ~90
  CONTRACT/CLOSURE/EVIDENCE docs in `docs/`, all historically valuable, none of it
  *current*.

Every new session (human or agent) pays a triage tax to find what's authoritative, and
`CLAUDE.md`-driven sessions read the root first — so the root's noise directly shapes
agent behavior.

## Decision

Restructure documentation by audience, moving files without editing their content:

```
README.md                     ← new: what the game is, quickstart, status, map (≤150 lines)
CLAUDE.md                     ← stays: agent entry point, updated paths only
ROADMAP.md                    ← stays
docs/
  adr/                        ← standing decisions (ADR-0001)
  build-contract.md           ← standing: the frozen engine contract
  operational-laws.md         ← standing (moved from SHIFT-OPERATIONAL-LAWS.md)
  records/                    ← everything session-shaped, moved verbatim:
    marathons/  missions/  labs/   (LOGs, HANDOFFs, CONTRACT/CLOSURE/EVIDENCE triplets,
                                    CHARTERs, LESSONS-LEARNED.md, M0A-REPORT.md, …)
```

Rules going forward: the root gains no new narrative files; a session's records are
born in `docs/records/<mission>/`; anything a future session must *obey* is an ADR or
the contract, not a record.

## Options considered

1. **Status quo** — rejected: the decision index already drifted from reality once
   (save-version claim); noise is causing real errors.
2. **Delete the narrative docs** — rejected: they are the project's provenance and the
   evidence chain for owner rulings.
3. **Separate wiki/repo for records** — heavier than needed; history docs referencing
   in-repo commits are best kept beside the code.
4. **Move-only restructure by audience (chosen).**

## Consequences

- One mechanical PR of `git mv`s (history preserved via `--follow`), plus link fixes in
  `DECISIONS.md`/`CLAUDE.md` — grep for the moved filenames to catch references.
- New-session onboarding shrinks from ~30 candidate entry files to README + CLAUDE.md +
  `docs/adr/`.
- The GitHub landing page finally describes a game (pairs with filed issue #4).

## Revisit when

`docs/records/` needs its own index to navigate (>~30 missions) — add a generated
index then, not directory nesting now.
