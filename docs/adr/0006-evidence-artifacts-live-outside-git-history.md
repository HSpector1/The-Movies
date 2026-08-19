# ADR-0006: Evidence artifacts live outside git history

- Status: Proposed
- Date: 2026-08-19
- Owners: repo owner (HSpector1)

## Context

The verification workflow — every session screenshots its proof — put **2,840 PNGs
(~1.9 GB) under `proof/`** plus a 75 MB `project-studio-backup/` into git. Both were
later deleted from the tree, but every historical blob remains in the pack files:

- A full clone downloads **1.7 GB for a ~2 MB working tree** (measured 2026-08-19 via
  `git rev-list --objects --all` + `cat-file --batch-check`, summed by path).
- The cost recurs on every clone, fork, and CI checkout, forever, and grows with every
  session that commits screenshots.

Evidence *matters* to this project — closure docs cite specific images — so the policy
must preserve the evidence trail, not discard it.

## Decision

1. **Policy (forward):** rendered evidence (screenshots, videos, exported models,
   backups) is never committed to this repo. Evidence for a closure goes to a GitHub
   Release asset (zip per closure, immutable, linkable) — or Git LFS if inline paths
   are strongly preferred. Closure docs link the release URL. Small authored *source*
   art (e.g. `art/hollywood/*.source.json`, turnaround sheets actually consumed by the
   build) stays in-repo under a size gate.
2. **Cleanup (history):** after the ADR-0005 branch triage, rewrite history with
   `git filter-repo --invert-paths --path proof --path project-studio-backup`, then
   force-push all refs. Export the purged blobs to a release asset first, so nothing is
   destroyed — only relocated.
3. **Guard:** a pre-receive-equivalent check in CI (or a local pre-commit hook): fail
   any commit adding a file >2 MB or any path under `proof/`.

## Options considered

1. **Do nothing** — rejected: 1.7 GB clones for a 2 MB project, growing without bound.
2. **Git LFS for everything** — keeps paths but adds LFS dependency for every cloner
   and GitHub LFS quota costs; evidence is write-once/read-rarely, which is what
   release assets are for.
3. **Release assets + history rewrite + size guard (chosen).**
4. **Shallow/partial clones as the permanent answer** — a workaround, not a fix; every
   tool that does a full clone (forks, some CI) still pays.

## Consequences

- History rewrite changes every commit hash: existing clones must re-clone, and the
  commit ids cited in closure docs and `DECISIONS.md` become stale — the rewrite
  commit's message should carry an old→new mapping for the ~15 ids the docs cite, or
  the docs get a one-time sed pass.
- This is the single most disruptive action proposed in this ADR set; it is gated on
  the Owner accepting it explicitly and doing it in one announced operation.
- Post-rewrite clone size drops from ~1.7 GB to roughly the working tree + real
  history (tens of MB).

## Revisit when

GitHub ships repo-level partial-clone defaults or the project moves hosts — the guard
policy stands regardless; only the cleanup mechanics would change.
