# 1089-B — Independent endurance observer source review

Reviewed `bridge/testing/c3-active-endurance-observer.ts`, 29,142 bytes, SHA256 `a121e95e0d83f92db66fc255d098a05cb991a7b6482badf584e159e0637cb1c7`, against frozen1083-A and parent1089-A. Source-only review; no compiler, store/coordinator invocation, gameplay, driver or test was executed. The docs driver was still moving, so this is not its final review or a successful type-graph claim.

Disposition: **REFINE one bounded purity guard; otherwise KEEP the observer scope and source construction.**

## Required correction

1083-A requires complete isolated Save38 byte equality before/after every public-read group. The frozen source proves equality before the public-people discovery and once after all four subsequent groups. That detects net mutation across the invocation but does not establish each group's promised boundary independently.

After public discovery and each snapshot/Calendar/Industry/Market group, export the isolated state through the existing current writer/export boundary and compare the complete string with the captured input. The initial admission is the preceding boundary for discovery, and every successful equality is the preceding boundary for the next group. Record these as inspection timings. This adds no public projection call, gameplay, query descriptor, schedule or source-state mutation; the existing64 timing-row bound still accommodates it. Retain the final actual `isolatedAfter` identity and caller-owned authoritative-state comparison.

## Accepted read-side facts

- Current38 canonical-byte admission checks requested week, independent SHA, protocol4/projection53/schema, and actual Hollywood authority. `BridgeSession.fromSaveJson` supplies a detached graph. No old input is silently accepted as current by the observer.
- Exactly one public people discovery occurs first in either schedule; only subsequent groups and descriptor order reverse. This is explicitly disclosed in1089-A and does not claim reversal of the discovery call.
- Projection counters reserve before invocation: two snapshots, one people projection, one Calendar, at most18 Industry and six direct Market calls; four profile checks use already obtained public profiles. No action/tick/intent is dispatched. Strict actual wire schemas apply to snapshots, selected profiles, Industry and Market.
- Industry uses actual lane/period enums and pageSize25. Only existing page1 is requested, repeats use the exact same page0 query, and exact response strings are compared. Person/employment subjects come from actual public profiles. Unpaged side lists remain measured envelope bytes, not falsely bounded25-row claims.
- A selected person without a market case remains a lawful null detail. No historyPage1 is invented. Real closed/history sizes20/10 and actual totals control additional reads. Rival proposals retain literal UNKNOWN compensation; rival employer salary/bonus fields must be absent, while player-owned terms are not globally prohibited.
- Career privacy checks apply to career objects/news and actual Calendar rows. Calendar event IDs/dates independently join retained career changes/finality and the nonfuture13-week window. Industry schema admission retains its exact released field vocabulary. No synthetic states enter endurance.
- Read results retain byte identities, counts, sampled totals and timing, with compact256KiB/64-row guards. At most28 call records are emitted; four profile checks need not add duplicate projection calls. The supplementary profile selection is bounded and deterministic.

## Accepted runtime-side facts

- Only attained A weeks0/3120/6240 are accepted. The absolute target must lie below its provided exclusive root and must not exist. Actual `openBridgeCheckpointStore` uses the256MiB library limit; real coordinator initialization/commit/reopen keep default runtime limits. No mock store or production runtime change occurs.
- Store wrappers forward actual reads/writes/closes and count/time them. The factory independently imports captured bytes and must run exactly once across initial startup and actual disk reopen. Finally closes the real owner; no manual lock deletion or cleanup is performed.
- The fixed one-Save-As/Save-S1/exact-S1-retry/Save-S2/Load-L1/close/reopen/exact-L1-replay sequence uses actual revisions and original request/response strings. Campaign receipt identity/request/response and retained record identity are checked separately from the ordinary journal. Exact retry must not write.
- The one allowed actual rollover records the rejected attempt and validates unchanged full inner current/saved bytes, new logical session, revision0 and empty journal before one fresh-envelope retry. A second rollover is refused. The caps remain eight dispatch attempts, one campaign operation, one reopen, twelve boundary records and64 timing rows.
- Every distinct stored library string is decoded with the actual library codec and re-encoded to identical compressed bytes. Checkpoint inspection caches key the exact complete checkpoint text. They do not bypass real coordinator startup/reopen validation. All decoded cells, including repeated record/working text, contribute to the decoded-byte bound.
- Packed decoded-byte/SHA metadata is measured against each actual decoded cell. Every admitted cell carries the exact captured current/saved Save38 strings and requested week. Ordered working-journal rows are compared to accepted first-seen operations; byte totals use the real full canonical journal-entry rule, not a request/response-only estimate.
- Runtime results separate inspection and operation timing, preserve real nested store timing without adding it again as independent work, and fail on input, body, cleanup or compact-result failure. UUID-bearing outer artifacts are compared only within the actual sample; no false cross-sample outer-byte determinism is required.

## Release and claim limits

After the named correction and final source freeze, both this observer and the exact docs driver must appear in the recorded successful Bridge `--listFiles` type graph. Source readiness is not execution qualification. Three zero-tick persistence samples do not demonstrate6240 weeks of durable journal traffic, limit exhaustion, crash recovery or native parity. The two original R8 Vitest timeouts and the distinct1050 standalone result retain their existing scopes.

## Named correction closed — final source KEEP

Parent froze the corrected observer at29,553 bytes, SHA256 `7ba3b32f61aa4ec8509882712bc461a5fa6e55cb9682ca156459c0297c473524`; corrected1089-A is4,057 bytes, SHA256 `fddf9cce7320e2f468d7f2e72da3f00569f080688b7f3b427b80156f09ed3f41`. Independent file hashing matched both. A read-only string reconstruction removing only the named helper, discovery check and loop check reproduces exactly the reviewed29,142-byte `a121e95e…` source, confirming no unrelated delta.

The new `assertReadBoundary` performs the actual current validating export, records its complete byte identity and compares the full string to the captured input. It runs immediately after public discovery and after each actual group in the selected execution order. The original final export/equality remains. Failure preserves its actual phase and last measured identity, rather than inventing a post-read success. Projection calls, query descriptors, source graph, runtime code and caps are unchanged. This closes the one named REFINE: **KEEP for source readiness**, pending the exact driver freeze and required recorded type graph. No execution result is claimed.

## 1054 type attribution and narrow follow-up

1054 closed compiler exit2 after27.711 seconds on fixed source. Both exact observer/driver paths were present in its actual graph, but that is not a passing type gate. Ten observer diagnostics arose from accessing Industry-page members before narrowing the actual response union; two separate driver diagnostics were optional assertion messages. No gameplay ran.

The observer now uses `assert.ok('type' in page && page.type === 'industryPage', ...)` before its strict schema and member reads. This proves the real response arm without casting or accepting a protocol rejection. Corrected source is29,567 bytes, SHA256 `ddcb9e27f308d0be0fc4227c5b9c1945045318c1efe87b1cb2fc365e4ea2a245`, independently matched. Reversing only this guard reproduces exactly the previous29,553-byte `7ba3b32f…` source. Successful Industry behavior, counts, privacy/purity, runtime branch and bounds are unchanged. **KEEP this narrow correction**;1055 result remains pending at this review.

## 1055 complete type graph — final KEEP

The reviewer independently read1055 metadata and output: child0, zero TypeScript diagnostics,27.439 seconds, closing2026-09-27 02:41:43.036 UTC. Both exact absolute observer/driver paths appear in the actual Bridge `--listFiles` graph. Source stayed `e6475aca…` plus fixed `49c47c091943595f8d1a62d79679aa5d7802e59f6b242dc1684bec25bead02d8`; final observer `ddcb9e27…` and driver `f7d19d39…` stayed unchanged. This closes the previously pending type gate. **Final source disposition KEEP**. It does not replace1054's failed observation or qualify any store/gameplay/endurance outcome, which remain for parent execution and separate review.
