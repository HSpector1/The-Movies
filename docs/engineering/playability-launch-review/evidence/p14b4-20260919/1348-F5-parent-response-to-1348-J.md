# 1348-F5: parent response to 1348-J (slice A implementation review)

Review: [1348-J](1348-J-rel-sliceA-implementation-review.md), **KEEP**, no blocking defect. Candidate:
[1348-stage/1348-rel-sliceA-production-step3.patch](1348-stage/1348-rel-sliceA-production-step3.patch) (sha256
80540869…) with its prefixes step 1 and step 2, over the final RED
[1348-stage/1348-rel-sliceA-red-r5.patch](1348-stage/1348-rel-sliceA-red-r5.patch). The parent checked with a temporary
index that r5 and each step apply cleanly at HEAD c614b7e9.

## Decisions

1. **Adopt the candidate unchanged.** The reviewer re-derived the persistence conclusion at HEAD, after shelving:
   Save43 validates relationships under the era-42 rules, and no validator reconciles `peakTier` against closeness,
   evidence or a rules version. The rules-version bump therefore needs no era split.
2. **The shared helper is accepted** (1348-F4 item 4). The reviewer found `distinctActingFirstTakes` byte-identical to
   the block it replaced, and both callers unchanged. The parent's dry run supplies the behaviour half: the transition
   files named by 1348-J run at HEAD and on the candidate, and must give identical results.
3. **The stale describe title** (`tests/p14b5-relationships.test.ts:750`, "TIER RULE under RELATIONSHIP_RULES_VERSION
   1") is not edited now. Renaming a describe block changes every leaf identity under it, which would add noise to the
   Save43 attribution. It rides with slice B's RED, which touches the same file (brief 1358-C).

## Parent dry run (after the Save43 measurement ends), recorded as 1348-X5

- Scratch tree at the then-current HEAD, r5 applied, then step 3.
- The three RED files plus `tests/p14b5-t-failure-tuning.test.ts`: expect 80/80 and 12/12.
- The transition files of 1348-J check 3, at HEAD with r5 and on the candidate:
  `tests/p14c3-transition-owner-and-snapshots.test.ts`, `p14c3-transitions`, `p14c3-cohort-transition`,
  `p14c3-canonical-rival-history`, `p14c3-equal-tuple-evidence`, `p14c3-held-actor-evidence`,
  `p14c3-offmenu-extensions`. The pass/fail identities must be equal.
- The root, UI and Bridge type gates on the candidate.

## Landing (after 1348-X5 passes)

1. Commit the r5 tests with `git apply --index`; push; recorded RED run over the four test files.
2. Apply steps 1, 2 and 3 as incremental commits built from the cumulative patches; push; recorded GREEN run over the
   same files; `cmp` the landed files against the reviewed step 3 tree.
3. The broad gates after the Save43 sweep serve as slice A's broad gates.

Slice A stays **IN PROGRESS** until those gates are attributed.
