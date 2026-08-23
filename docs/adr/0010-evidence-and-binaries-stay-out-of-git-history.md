# ADR 0010: Evidence and binary artifacts stay out of git history

- Status: Accepted
- Date: 2026-08-23
- Credit: forward policy distilled from PR #5 (`ask-the-six`) ADR-0006, which
  measured ~1.7 GB of historical evidence blobs against a ~2 MB working tree.
  Its history-rewrite remedy is explicitly rejected here.

## Context

The verification workflow produces large native evidence artifacts constantly:
screenshots, proof reports, masks, videos, builds, profiles, and checkpoints.
Earlier project phases committed rendered evidence into git; those blobs remain
in history and are paid for on every clone. The Unity-convergence campaign
already practices the correct forward policy — `Evidence/`, `Builds/`,
profiles, and `dist/` are ignored, evidence is recorded in ledgers by absolute
path, byte size, and SHA-256, and the repository hygiene audit fails on stray
artifacts — but that practice was never recorded as a durable decision.

## Decision

1. **Forward policy (binding):** rendered evidence and binary build artifacts
   are never committed to this repository. Closure and checkpoint documents
   record exact paths, byte sizes, and SHA-256 digests instead. Durable
   off-repo archival (for example a release asset per sealed checkpoint) is
   permitted and encouraged; small authored source assets that the build
   actually consumes stay in-repo.
2. **History rewriting is rejected** while `golden/unity-convergence-m1..m5`
   (and any successor Golden tags) serve as recovery authority. A
   `git filter-repo`-style purge would invalidate every recorded recovery SHA,
   which is a worse loss than the pack-size cost. This trade may only be
   revisited by an explicit Owner ruling that re-establishes recovery
   authority first.

## Consequences

- Clone cost stops growing with evidence volume from this point forward.
- Historical blob weight remains until an Owner-ruled recovery re-baselining;
  that cost is accepted and documented rather than silently carried.

## Revisit when

An Owner ruling proposes re-baselining recovery authority, or evidence volume
begins materially degrading contributor workflows despite the forward policy.
