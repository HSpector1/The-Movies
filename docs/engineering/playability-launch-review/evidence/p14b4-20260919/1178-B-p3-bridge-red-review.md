# 1178-B — Independent Bridge compiler and actual RED review

**KEEP the observed RED and its bounded attribution.** Directly reviewed both complete logs, closed recorder JSON, preflights and unchanged test identities.1177 still fails on two production diagnostics;1178 executes all three selected leaves and fails in two primary diagnostic groups, with zero advancing calls. This is sufficient evidence for the corresponding Bridge conversion/current-schema work, not qualification of the masked behavior. No project code was executed by this reviewer. Author1178-A was not available when this direct-evidence record froze; no cross-review or delayed appendix is implied.

Both records use published `d2f615b015bfb673b8b69d188d592b710bb9aecb`, exact empty consumed diffs at both ends, `fixedSource:true`, no untracked source and null signal/error.1177 preflight records clean whole worktree and matching remote.1178 preflight honestly lists only the four newly produced1177 evidence files in its nonempty worktree, verifies clean consumed source and explicitly permits the two known production diagnostics; it does not label the compiler successful.

| Closed record | UTC interval | Wrapper elapsed | Actual result |
|---|---|---:|---|
|1177 Bridge types|16:03:31.415–16:03:59.999|28.584s|child2; exactly two production diagnostics, no test diagnostics|
|1178 exact three-leaf core file|16:04:24.556–16:04:33.392|8.836s|child1; one file, three tests, all failed|

1177 retains `bridge/people.ts:1048` TS2322 (`directingOpportunity` missing from transport enum) and `bridge/promises.ts:111` TS2339 (generic tagged predicate lacks `seatClass`). All three prior test diagnostics are absent after the exact1176 amendment. This is a measured narrowing of the failed type gate, not a type PASS.

## Actual first causes

**D15 and D16 share one cached failure.** D15 reaches strict/full39 captured45 admission, the valid public request and all seven closed-request negatives. Its actual public quote envelope is accepted and schema-checked; the returned feasibility payload instead has `ok:false`, `promise.ok:false`, classification `IMPOSSIBLE`, versus required `REASONABLY_ACHIEVABLE`. First assertion is test153:21; its shared stack continues through `memo:76`, `attached45:149`, caller442. D16 rethrows that same unsuccessful attachment cache and does not independently execute its disclosures.

The source-supported explanation is specific: `bridge/promises.ts corePredicateOf` maps a count-only wire P3 to `{count}`, while current core `promiseFeasibility` explicitly refuses fresh `DIRECTING_COUNT` without `directorCount`. The raw does not print that refusal message, so it is not attributed as a separately observed message. The current45 setup and public transport ran; no attachment commit, settlement52, bound root, duplicate, stale-intent, disclosure/waiver or reminder control was reached.

**D17 reaches its independent prior-schema boundary.** Before any bound52 dependency, the actual outgoing natural53 checkpoint passes its pinned original slot/journal preparation, then `loadBridgeRuntimeCheckpoint` reaches the current decoder and fails: `checkpoint.currentSaveJson: must be a current V39 save, received V38`. The full tail runs from `fail:366` through `validateCanonicalCurrentSave:489`, hydration1111, decode1264, load1315, `qualifyPrior53:318`, caller565. Current projection53 still identifies this outgoing envelope as current, and its live-save decoder now demands39. This supports a governed prior53/current54 boundary; it does not justify weakening current39 admission.

The first natural load prevents all later migration/reset/reload assertions, the second waiver checkpoint, corrupted-slot negatives and the actual coordinator lifecycle. No migration/factory or storage success is inferred from the reached prefix. Both complete primary diagnostics and their shared/full printed tails remain in the immutable raw. There is no missing-module failure, timeout, unhandled-error section or recorder failure in this run.

The single counter marker reports reservations0, actual advancing dispatch invocations0, verified advances0, session attempts0, coordinator attempts0 and duplicates0 (cap12). Its only phases are `captured45:true` and `actualAttached45:false`. Thus no hidden tick, partial seven-week trajectory or duplicate work is credited. Vitest’s tests subtotal3.47s and overall7.68s are distinct from the8.836s recorder interval.

## Evidence identities and scope

| Artifact | Bytes | SHA256 |
|---|---:|---|
|1177 raw|850|`6ce5230245324b8121d5f7d73e576f1e1d853138896d6808ff35bb18a28e0fb4`|
|1177 JSON|641|`a149d1e59cbfeba54de5e0c57d7b02f741c528bca1dc23c4f2d1e18317dfc05f`|
|1177 preflight|501|`8e6f77831b815a780e7b591e32f196b47b650f184f2e4d2e0dd897df6b56e44e`|
|1178 raw|4,443|`7908dcd5bffddb0f761c185781d24693c20b620be15c13aca3c132c80514fa54`|
|1178 JSON|683|`e4664c36f9239df6d6abd6e4da9c92c439638b0b7010fe8ae1310b0f243e0fbf`|
|1178 preflight|999|`5ec02f424478f8762e65de518fd04b251b8f0a73cd9f775128a457e5d139f7fe`|

Both recorded patches are zero bytes/SHA256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`. Live test rehashes match amended P3 `8f086d16818dd3449604f2da2b91ed575b1c5c04e5a656020867d5b140f6872d` and trust `7c9535be07f532d1d424525e8e1dd14ea9be2a3bd148773bb8b394772da197e8`.

Keep all1174/1176 expectations, input pins, counters and timeouts intact. The observations support matched Bridge work under the adopted contract while preserving strict old/current save boundaries. They make no staffing/rival policy, core-law, UI component, full-suite, disk/native, performance or masked-assertion claim. No source, test or index change was made by this review.
