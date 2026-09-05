
# Project: Studio — P08–P10 Branch, Candidate & Integration Plan

**Status:** READY FOR CURRENT OPS PM REVIEW

## Documentation authority

Canonical branch: `docs/p08-p10-autonomous-stack-launch-01`
Base: `2753e18ba8fb5f65b936c22cde9531646fecc6cd`
The earlier `foundation-marathon` name is a superseded draft alias, not a parallel authority.

## Implementation recommendation

```text
wip/p08-p10-autonomous-stack-01-ts
wip/p08-p10-autonomous-stack-01-client
```

Both begin exactly at the accepted P07 campaigns:

- TS `2753e18ba8fb5f65b936c22cde9531646fecc6cd`
- Unity `c4c65db464ef9abcf3bdcc088f5c8a47cc9081b6`

Push both empty before edits. Use explicit refspecs and verify local/upstream/advertised equality.

## Campaign freeze

Campaign branches remain at the accepted P07 pair throughout P08, P09, P10, technical seal, and Current Ops review. They move only after Owner accepts the chosen P08–P10 candidate. `main` and Golden never move in this task.

## Immutable checkpoints

Record and push exact paired checkpoint SHAs for:

- P08 core KEEP;
- P08 full-ready-scope KEEP;
- P09 core KEEP;
- P09 full-ready-scope KEEP;
- P10 core KEEP;
- P10 full-ready-scope/final stack KEEP.

A skipped ready extension is recorded with its failed activation gate; it does not erase the core checkpoint.

## Candidate directories

```text
~/Desktop/P08-Core-Technical-Candidate-<ts>-<unity>/
~/Desktop/P08-Full-Ready-Candidate-<ts>-<unity>/
~/Desktop/P09-Core-Technical-Candidate-<ts>-<unity>/
~/Desktop/P09-Full-Ready-Candidate-<ts>-<unity>/
~/Desktop/P10-Core-Technical-Candidate-<ts>-<unity>/
~/Desktop/P08-P10-Combined-Owner-Candidate-<ts>-<unity>/
```

Do not create duplicate directories when core and full-ready SHAs are identical; the manifest must state that identity.

Every candidate includes executable, launcher, compatible profile copies, exact product/docs SHAs, player/engine/Assembly hashes, save/protocol/projection/schema, evidence index, hostile disposition, known limits, rollback references, and playtest script.

## Save-compatible rollback

- Never launch an old binary against a profile migrated by a newer checkpoint.
- Preserve one compatible profile copy per candidate.
- Bisect by exact checkpoint pair and matching profile copy.
- The Owner’s original profile is never mutated by automation.

## Failure behavior

- P08 failure: remain at accepted P07; preserve honest failed branch/evidence.
- P09 failure: retain P08 checkpoint/candidate; do not advance to P10.
- P10 failure: retain P08 and P09 candidates; final recommendation may stop at P09.
- Ready-extension failure: retain core KEEP and continue only if the extension is independent and the wave plan permits.
- Cross-stack regression: bisect with P08/P09/P10 checkpoint pairs; fix at the owning package.

No rebase, squash, force push, merge commit, or history rewrite.
