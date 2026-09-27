# 1263-G — actual Q15 failure and release-stamp oracle correction

The closed Q15 run failed one final test expectation after completing the fixed stock route. The production owner stamps `FilmResult.releaseTick` with the input week's `currentTick`64; the same advance returns `market.tick`65. Correct exactly the expected film stamp65→64. Preserve the actual state65, take61, public release commitment64, all suffix/retention assertions and every action/call limit. This is an evidenced test-oracle correction, not a production defect, route rescue or qualified Q15 PASS.

Original1263-A/F/B/C/D, original staged file/patch/manifest and failed1265 raw remain untouched. A/F's “actual release65” refers to the returned attained state; it did not correctly distinguish the persisted release stamp. G makes that distinction explicit without rewriting those records. Source preparation HEAD is `c3a06a77decad192452eedffc1263c629ae71cf1`; the recorded execution source below is independently retained.

## Closed gate evidence

Both gates ran on published `9f33653d6d177752267d7244ff03de9cfff1fea3`, with exact remote preflight, fixedSource true, empty consumed diff, no untracked consumed files and null signal/error. All pre/post HEAD/source paths/count/inventory,153 manual identities, raw index and stage values are equal. All153 manual files and each gate's raw/record/patch identities were independently rehashed. Compiler preflight cap0 and runtime cap13 are distinct.

| Gate | UTC2026-09-27 | Recorder | Actual result |
|---|---|---:|---|
|1264 root `tsc --noEmit -p tsconfig.json`|22:23:12.205→22:23:47.930|35.725s|exit0, no diagnostics|
|1265 exact Q15-only command|22:24:21.979→22:24:35.557|13.578s|exit1;1FAIL,0filtered; one failed file|

The sole identity is `P4/P5 genuine stock material subject > Q15 retains a post-cutover stock null-project subject through actual managed release`. Leaf9.115s/file9.119s, Vitest12.50s; the60,000ms declaration is unchanged. No unhandled error occurred. There is one failed primary group and one printed stack frame, not separate failures for the repeated summary text.

## Complete printed failure

The following block is the complete original FAIL header, primary diff and printed frame/context. Raw byte interval[119156,120236) is1,080B / SHA256 `7d3519b2cbdbab2aaa9ddf07c0ac1027df8304817ea8536a6de644fb96c1a2cc`. The existing ellipses/property omission are Vitest's printed diagnostic; no extra frames or omitted source context are invented here.

```text
 FAIL |core|  tests/p14p4p5-stock-subject.test.ts > P4/P5 genuine stock material subject > Q15 retains a post-cutover stock null-project subject through actual managed release
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

 ❯ tests/p14p4p5-stock-subject.test.ts:322:53
    320|       expectedMixedSuffix: expectedSuffix, take61Suffix: taking.firstT…
    321|       oldPromises: originalRoots.map(old => released.promises.find(row…
    322|     expect(films).toHaveLength(1); expect(films[0]).toMatchObject({ co…
       |                                                     ^
    323|     expect(films[0]!.participants).toEqual(production(scheduled).parti…
    324|     expect(released.concepts.find(row => row.id === films[0]!.conceptI…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯
```

Independent source read: `src/core/tick.ts` binds `currentTick = state.market.tick` at194–197, sends `releaseTick: currentTick` to `buildFilmResult` at627–632, and subsequently constructs the returned market with `currentTick + 1` at1077. The actual final trace is64→65. The recorded film's64 stamp is therefore consistent with its owner. This does not alter the first-take clock: the real stock receipt is week61.

## Actual reached work and masked assertions

The strict old31 identity/export, current migration/full40/lossless admission, age/provenance, all six actual crew/contract/availability premises, initial facility/set/funds, and stock greenlight succeeded. The unchanged generated corpus retains its disclosed historical funding provenance; no Owner-save or natural self-funding claim is made. The migrated input observation is771,584B / `2a016d654cf471df4ae46e43d6e1a045ed0b5c2bb246a328ad4391047bf7a7be`.

All five public actions were accepted only after their complete state/action/queue/admission checks: stock greenlight52, actual planRevision0 ballroom recipe55, Director assignment60, schedule60, and commitment64 (`release-commitment-prod-0052`). The13 recorded advances are exactly52→53 through64→65. Actual production/workflow boundaries were:

- Returned53: remaining8/development;54:7/preProduction;55:6/rehearsal.
- Returned56–59: remaining6/rehearsal;60:5/shooting/unassigned; both public shooting actions then establish scheduled60.
- Returned61:4/shooting/completed, real player take;62:3/postProduction;63:2/postProduction;64:1/releaseReady.
- Returned65: target production/workflow absent and one real released film present. Its persisted releaseTick is64.

The seven input/greenlight/recipe/scheduled/take/commit/released caches all completed; afterAll reports attempted/reserved/invoked/completed13 each, outside0, actionAttempts/actionsAccepted5 each and explicitQuotes0. There was no historical prefix replay or imported simulation helper.

Every attained snapshot already passed the full original20 receipt prefix, complete mixed new receipt/subject suffix, immutable old-root authority, strict40 admission and lossless current export/import inside `advance`. The final suffix contains eight exact owner-local facts (events20–27), independently matched across all13 ADVANCE markers, trace and RELEASE marker:

|Event|Receipt week|Owner / production|Concept / genre|Project|
|---|---:|---|---|---|
|20|53|r01 / film5|r01:concept5 / comedy|script-0005|
|21|53|r03 / film5|r03:concept5 / crime|script-0005|
|22|54|r02 / film5|r02:concept5 / comedy|script-0005|
|23|57|r04 / film6|r04:concept6 / romance|script-0006|
|24|61|player / prod-0052|c-00 / comedy|**null**|
|25|62|r03 / film6|r03:concept6 / horror|script-0006|
|26|63|r02 / film6|r02:concept6 / romance|script-0006|
|27|65|r01 / film7|r01:concept7 / comedy|script-0007|

The table abbreviates owner/production/concept IDs only for readability; raw markers retain complete `studio-aca408ec-*` identities, Director/cast and complete facts. Event24 joins actual locked Director t-dir-01/cast t-act-09,t-act-12,t-act-13 and the real legacy stock production. The explicit take61 null-project assertion passed. The returned65 raw contains that same null fact and all eight ordered facts, not merely absence of a historical fact.

The original P1 promise-0 actually became SATISFIED61/progress1 with event24 and talent-market-event-6; promise-1 remains open/progress0. Both preserve original rules4 receipts and contractual/material authority. These are retained old P1 behavior observations, not new material obligations.

The leaf reached returned65/calendar and active-target removal checks, printed RELEASE, and passed the one-film count at322. Its film stamp comparison then failed. **Assertions323 onward did not execute:** final participant equality, explicit released concept check, final player-null-fact lookup, explicit take61-prefix retention comparisons, final legacy projects[]/suffix/admission repeats, exact trace/counter equality and action-list equality. Earlier per-advance admission/suffix checks and full printed observations are evidence of reached work; they do not convert those blocked final assertions into passes. Matched rerun must reach them unchanged.

All27 LF-preserved `1263-` marker lines are118,066B / `43a9aefbfc2cabca9cde6e612a36d2936584ee8f4117260d605fe7110288f422`. Select all original raw byte lines beginning `1263-`, preserve order and LFs, and concatenate without reserialization/truncation to reconstruct this identity.

## One-literal staged correction

Target remains `tests/p14p4p5-stock-subject.test.ts`. Live and original C-stage preimage are25,170B / `9222330c3734325fb934c2d98c684cb3b71eaa3611c4748c5accbeb963e6ebd3`. Replace only the literal in the existing line322 assertion:

```diff
-    expect(films).toHaveLength(1); expect(films[0]).toMatchObject({ conceptId: 'c-00', directorId: DIRECTOR, releaseTick: 65 })
+    expect(films).toHaveLength(1); expect(films[0]).toMatchObject({ conceptId: 'c-00', directorId: DIRECTOR, releaseTick: 64 })
```

| New artifact | Bytes | SHA256 |
|---|---:|---|
|`1263-release-stamp-stage/tests/p14p4p5-stock-subject.test.ts`|25,170|`060ac12b20b2cce1310d940589c2a9e886a8be0dbbbd904036fe6d5e848ebed8`|
|`1263-release-stamp.patch`|1,140|`91846140da9ba1f0ec75a2f881ebf08030a127740c1ee8c3d1adb8d39892dcbc`|
|`1263-release-stamp-source-manifest.json`|13,229|`aecf5919d946eed14862e9dab876a18084046235fe986e43f63b58bf904f7f12`|

Exactly one replacement and full inverse recreate the original; no declarations,60s timeout, guard, action, route, snapshot, input pin, subsequent assertion or production byte changes. The manifest pins45 protected authorities/source/input/original-artifact rows plus10 actual gate evidence files and both staged application sides. No live source/index edit, compiler, test or project evaluation was performed to prepare G.

After independent review/application/publication, parent alone runs `1264b-stock-subject-types` with `node_modules/.bin/tsc --noEmit -p tsconfig.json` (cap0), then `1265b-stock-subject-runtime` with `node_modules/.bin/vitest run --project core tests/p14p4p5-stock-subject.test.ts -t 'Q15 '` (cap13, one selected). This is the same failed selected route's requalification, not an extra producer/prefix replay or unrelated completed slice. Corrected runtime remains unexecuted; future combined1263-I must retain this original failed record and separately attribute the new result.

## Exact closed artifact identities

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

Both consumed patches are0B / `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`. This report preserves the original test failure and its scope; no generalized stock feasibility, new P4/P5 outcome or full-suite claim follows.
