# ADR 0005: Compatible-pair Golden promotion

- Status: Accepted
- Date: 2026-08-20

## Context

The authoritative TypeScript engine and schema-pinned Unity client live in
separate repositories. Promoting only one side can leave default branches
incompatible, while many historical branches make an unrecorded "latest" state
ambiguous.

## Decision

A Golden Checkpoint identifies one exact TypeScript commit and one exact Unity
commit that passed the campaign's product, determinism, save/load/reconnect,
Movie #2, test, build, runtime, and evidence gates. Each repository receives an
immutable annotated tag with the same Golden name. The promotion register names
the current best pair and never moves an older tag.

Canonical promotion is a separate, higher gate. Compare both candidates with
their current default branches, construct deliberate merge candidates, inspect
the complete diffs, validate the exact compatible pair, and promote through a
reviewable PR/merge path. A campaign technical PM may perform that promotion
when authorized and when all gates pass. Never promote one half of a
schema-coupled pair merely because it can fast-forward.

Do not rebase or rewrite campaign history, delete historical branches, move
Golden tags, or auto-delete the only recovery ref.

## Consequences

- "Current best" is an operational fact rather than an inference from branch
  names.
- A regression can return to a preserved compatible pair.
- Promotion risk includes repository ancestry and the entire candidate diff,
  not only the newest feature commit.

## Revisit when

The repositories adopt a single coordinated release manifest or an automated
cross-repository promotion system with equivalent immutable pair guarantees.
