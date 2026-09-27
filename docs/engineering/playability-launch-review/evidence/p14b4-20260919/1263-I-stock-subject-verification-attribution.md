# 1263-I — combined actual stock-subject verification

Q15 now passes on `d787d92cbe6653916b8ca977b798f3b92c7d72b5` after the reviewed single-literal release-stamp oracle correction. The original1265 failure on `9f33653d6d177752267d7244ff03de9cfff1fea3` remains preserved. Both runs completed the same fixed13-advance/five-action route, and **all27 factual marker lines are literally byte-identical**. Corrected1265b additionally reached and passed every final assertion blocked by the original stamp mismatch.

This attribution covers only the standalone fifteenth leaf. It does not turn the original failure into a pass or qualify a wider selected group, retirement, rival offers, general stock feasibility, new P4/P5 obligations/outcomes or any full suite. Only raw/record/source and standard-library verification reads prepared this document; no test, compiler, simulation or production/source mutation was performed by its author.

## Four separate gate records

All UTC timestamps below are2026-09-27. The exact compiler command in both records is `node_modules/.bin/tsc --noEmit -p tsconfig.json`. Both runtime records use `node_modules/.bin/vitest run --project core tests/p14p4p5-stock-subject.test.ts -t 'Q15 '`.

|Gate|Source|UTC start → end|Recorder|Actual outcome|
|---|---|---|---:|---|
|1264 types|9f33653d|22:23:12.205→22:23:47.930|35.725s|exit0, no diagnostics|
|1265 Q15|9f33653d|22:24:21.979→22:24:35.557|13.578s|exit1;1FAIL,0filtered; one failed file|
|1264b types|d787d92c|22:33:49.836→22:34:24.769|34.933s|exit0, no diagnostics|
|1265b Q15|d787d92c|22:35:10.776→22:35:24.250|13.474s|exit0;1PASS,0filtered; one passed file|

The exact unchanged test identity is `P4/P5 genuine stock material subject > Q15 retains a post-cutover stock null-project subject through actual managed release`. Original leaf9.115s/file9.119s/Vitest12.50s; corrected leaf9.349s/file9.352s/Vitest12.47s. Its60,000ms declaration remains unchanged. These are recorded durations, not a general latency guarantee. No signal, recorder error or unhandled runtime error was recorded in any gate.

## Source and execution guards

Each gate's preflight has exact published remote equality and its own source HEAD; each postflight matches the full preflight HEAD, source paths/count/inventory, manual pins, raw index and stage entries. All four records report fixedSource true, same source at start/end, empty tested diff and no untracked consumed files. Compiler advanceCap is0; runtime advanceCap is13. The source population remains1,684 files; only the authorized test expectation differs between the two consumed source versions.

The original pair's153 manual entries and corrected pair's160 entries were independently checked against full files and recorded identities, along with all four raw/record/empty-patch joins. The original live test preimage now correctly resolves to its preserved original frozen stage when rechecking the old identity after authorized application; the current live file matches the corrected postimage. This does not falsely claim the old and new test bytes are equal.

|Recorded pair|Source-inventory bytes/SHA256|Raw index bytes/SHA256|Stage entries bytes/SHA256|
|---|---|---|---|
|1264/1265|255,653 / `2d355a07067f37494085d2a8233bc1334bdead7f50bac00da5f0d70ef257dc87`|1,109,681 / `2aef09dc3d7fb2ae8004e3a7e10f6c27486282e712de4933d7279f8078653ef8`|985,519 / `78301aeea68736cba4e8cd5255d9c2324cf069783e23496133bd296be2502e6c`|
|1264b/1265b|255,653 / `d2a93d5541c57edf371f059cf4894eea8594d88ff4cbfce1c194248c87e88416`|1,112,832 / `525566f98a39d45b9d9acd4d965ec5cb45a6ac04551ca1b39da3b39c754509ef`|988,302 / `2a7eed357614bfac74b5a164c2d1734a3624bcafcda73f28d3184804ffb40489`|

Original test/stage25,170B / `9222330c3734325fb934c2d98c684cb3b71eaa3611c4748c5accbeb963e6ebd3`; corrected test/stage25,170B / `060ac12b20b2cce1310d940589c2a9e886a8be0dbbbd904036fe6d5e848ebed8`. Frozen1263-G/H preserve the exact one-literal correction and its full inverse. No action, counter, guard, input, timeout, source production or following assertion was changed.

## Original failure and matched resolution

Original1265 has exactly one primary FAIL group, at `tests/p14p4p5-stock-subject.test.ts:322:53`:

```text
AssertionError: expected { productionId: 'prod-0052', …(14) } to match object { conceptId: 'c-00', …(2) }
(28 matching properties omitted from actual)

- Expected
+ Received

  Object {
    "conceptId": "c-00",
    "directorId": "t-dir-01",
-   "releaseTick": 65,
+   "releaseTick": 64,
  }
```

The complete FAIL header/primary/only printed frame/context/separator is retained verbatim in frozen1263-G and raw1265 byte interval[119156,120236):1,080B / `7d3519b2cbdbab2aaa9ddf07c0ac1027df8304817ea8536a6de644fb96c1a2cc`. Vitest's own omitted-property/source ellipses remain as printed; no additional stack context is invented. Corrected1265b has no failure group, diagnostic tail or new failure identity.

The independently inspected owner `tick.ts` uses the input `currentTick` for `buildFilmResult.releaseTick` at629, then returns `market.tick = currentTick + 1` at1077. Thus the actual64→65 advance creates a film stamped64 and an attained state65. The corrected test expects persisted stamp64 while retaining attained65. First-take receipts follow their separate actual append clock; the stock take is61. The correction addresses the test's assumption about the stamp, not a changed production behavior.

The original run had already completed all seven caches and the final advance's suffix/current-admission checks, but failed before lines323 onward. The matched PASS now executes those previously blocked assertions: locked participant equality, real released-film concept join, explicit retained player null-project fact, exact take61 receipt/fact prefix at65, legacy empty projects, repeated full suffix/current lossless admission, exact13-step chronology/counters and all five accepted action identities. No Q15 assertion remains masked in the corrected run.

## Literal actual route evidence

The27 LF-preserved `1263-` marker lines in1265 and1265b are equal byte for byte:118,066B / `43a9aefbfc2cabca9cde6e612a36d2936584ee8f4117260d605fe7110288f422`. This comparison uses every original byte line beginning `1263-`, in order with its LF; no JSON normalization or truncation. The complete raw files differ in recorder source/time and test report, as expected. The initial INPUT, all five attempt/accepted pairs, all13 ADVANCE records, STOCK-TAKE, RELEASE and final COUNTERS are covered by literal equality.

Actual shared outcomes:

- The unchanged generated Save31 corpus strictly admits before real40 migration and exact current roundtrip. Its old20 receipt prefix and two bound old P1 roots survive. The input's historical fund-helper delta is explicitly disclosed; this is not an Owner save or natural self-funding evidence. No old builder, minter, prefix or extra fixture route ran.
- Fixed six-person crew/contracts/current provenance/admission, actual free facility claims and standing Grand Ballroom premises passed. Greenlight52 accepted real stock c-00/comedy/prod-0052, exact budget debit and actual workflow with legacy screenplay projects[]. No project authority was invented.
- Recipe55 used actual planRevision0. Returned60 was remaining5/shooting/unassigned/unblocked; public Director assignment and schedule both accepted at60, producing a real scheduled take. Actual event24 at61 names locked t-dir-01 and cast t-act-09/t-act-12/t-act-13, with c-00/comedy/**null** material subject.
- Returned64 was remaining1/releaseReady. The exact public commitment `release-commitment-prod-0052`, committedAtWeek64, passed current admission. The thirteenth advance64→65 removed the active production/workflow and retained one real released film stamped64, with the same locked participants and concept. Final65 null-fact and lossless retention assertions now passed.
- Each advance preserved the original20 receipts and compared the complete new mixed player/rival suffix against independently derived owner-local production/concept/project links before full40 admission. This includes the last rival event27 at65; the take61 suffix was preserved as a prefix rather than frozen in length.

|New event|Week|Owner/production (abbreviated)|Material concept/genre|Project|
|---|---:|---|---|---|
|20|53|r01/film5|r01:concept5/comedy|script-0005|
|21|53|r03/film5|r03:concept5/crime|script-0005|
|22|54|r02/film5|r02:concept5/comedy|script-0005|
|23|57|r04/film6|r04:concept6/romance|script-0006|
|24|61|player/prod-0052|c-00/comedy|null|
|25|62|r03/film6|r03:concept6/horror|script-0006|
|26|63|r02/film6|r02:concept6/romance|script-0006|
|27|65|r01/film7|r01:concept7/comedy|script-0007|

Raw markers retain the unabridged `studio-aca408ec-*` identities and all receipt/fact fields. Event24 is a genuine post-cutover stock-null fact, not absence of a pre-cutover fact. The final subject root has version1/cutover20/eight facts and the complete receipt root has28 rows.

Original P1 promise-0 naturally becomes SATISFIED61/progress1/evidence[event24], outcome event talent-market-event-6; promise-1 remains open/progress0. Both original rules4 receipt values and fixed authority remain unchanged through the route. These are old P1 retention observations, not a new material outcome or historical-policy requalification.

Final counts in both runs and exact corrected assertions: attempted/reserved/invoked/completed13 each, outside0; actionAttempts/actionsAccepted5 each; explicitQuotes0; historicalPrefixAdvances0. Seven caches completed: input52, greenlit52, recipe55, scheduled60, take61, commitment64, released65. The accepted sequence is greenlight52, recipe55, assign60, schedule60, commit64. Tick development stays its reviewed default false. No late source change, timeout increase, extra week, alternate person/recipe, funding or rescue was used.

## Preserved evidence identities

|Filename|Bytes|SHA256|
|---|---:|---|
|1264-stock-subject-types.txt|340|`b929834813b51e8ffd440b9a97e4a579dbb0ae56aad9d947356a6e7c35e37f75`|
|1264-stock-subject-types.json|634|`22ca150380ea03f0972dfc5dbdaae74ce8e719fa2fe773b8e848f715b676869c`|
|1264-stock-subject-types-preflight.json|38,460|`5e2659c4d3eac9b7ae995a2c3b4a55223a7725851ddc29488a0b7d43dc518fff`|
|1264-stock-subject-types-postflight.json|39,135|`8dc414f201a072298901a24a5b405d5a83d6b8751b276c3dff09193fd69fadba`|
|1265-stock-subject-runtime.txt|120,421|`0f3bb6492419946b52318952f5dd0f564011a02a8fd51997a0748a1c4e8f027f`|
|1265-stock-subject-runtime.json|695|`51b598a1d6394e72c125a1d6fdcfb6e1cfbe07a0cd6bedd1133cee38582d65a7`|
|1265-stock-subject-runtime-preflight.json|38,461|`539f235a21ebeda1710d5d5f08fefd61aabd6676125de5eefe2d6b79f1f14f39`|
|1265-stock-subject-runtime-postflight.json|39,144|`a23fd026ef997d856e4b47ecf21f2358879e0852c2d8527861456c418b768bdd`|
|1264b-stock-subject-types.txt|340|`12abb14f11a5cd1d75aa8492816d4841252a3f4a95c08e50d753d7803820d80b`|
|1264b-stock-subject-types.json|634|`42d6be4141a1d467400695af9f225e58c8a0dc6b5b8f033b65aa076e848fdf08`|
|1264b-stock-subject-types-preflight.json|40,155|`3f8671e24187e4a059002a7ded0c18acdb41576881a26eddb20f4627668dc962`|
|1264b-stock-subject-types-postflight.json|40,833|`12c88f6ef57f4526cab3a18d01cd7d40afe2c32ce38cfa129b2d9a11bb520af4`|
|1265b-stock-subject-runtime.txt|119,122|`fa6e5f4a291ee0f310b20db6014b37aa42b7f7008f02f1c8ce2f9961a0f271a1`|
|1265b-stock-subject-runtime.json|695|`488dc56714f3f2d01cd89ae102dcdd18f1f26c9eaf76fae1708fac07792977c4`|
|1265b-stock-subject-runtime-preflight.json|40,156|`df6423a4a37fc961e76f6abe28be28156b609446b00a6d7bd81acb37f94bc8bd`|
|1265b-stock-subject-runtime-postflight.json|40,842|`948e5b926fd2f9b4ffb2a7ec509f704e17f73ae4a49c095112abf6a39d063ec5`|

All four consumed patch files are0B / `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`. Original1263-G is11,322B / `920f02d64a9fcfb00797ee3ad60f3dcb6932e85b4b33e96e69995f9480559fd4`; independent correction review1263-H is3,914B / `29ee9912f9dc09c064ee381885218686c9431f37d35d75a1c7a77e22be65c009`. Plans, original source reviews/stage and failed evidence remain frozen.

Bounded qualification is the corrected Q15 genuine stock-null subject through attained65/release-stamp64, with complete old/new receipt retention. Separate1266 source remains unreleased in this attribution; no other work is inferred from this PASS.
