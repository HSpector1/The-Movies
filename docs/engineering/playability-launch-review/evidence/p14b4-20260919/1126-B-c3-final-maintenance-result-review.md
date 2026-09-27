# 1126-B — Independent final maintenance result review

Final disposition: **KEEP the exact application, type composite and cause-specific repair evidence, with the failed behavioral outcomes and limits below retained.** Both behavioral runs are closed. This is not an all-green core/UI or reliability qualification.

## Verified application and type prefix

The source assessment remains frozen1123-B; exact25-path application is independently recorded in1125-B. The subsequent1127 correction was separately reviewed in1127-B. This reviewer rehashed all1,661 live consumed files against1125's complete after inventory: precisely the two1127 postimages differ, both literally equal their frozen staged files, and1,659 files remain unchanged. The recorded before/after index identities agree. Published `c1461a62bd0c307094ae63ff28b66e7aa9716b78` has an empty consumed diff and no untracked consumed paths; its consumed diff from `ab9f4923c40c6b9d93da5831b03b128aa83b4efe` is exactly1,306 bytes / `281f18f84e305a80de26df20da9e11c32ec47d3c2b6550bab0a9bba3a4044580`.

Application audit identities:

- `1127-c3-type-maintenance-application.started.json`:2,062 bytes / `a6a660199731f8a55f473b1f65b0500615e0ebbdf55d43f949f356333ea3a7eb`.
- `1127-c3-type-maintenance-application.json`:1,163 bytes / `1809da98196dad6503bd73808f37e5622f57d9bf46c5e0d1dda4af37b548103e`.

| Closed record | Actual source | Outcome | Elapsed |
| --- | --- | --- | ---: |
|1104 root types|ab9f4923,empty diff|child2: TS6133 unused M2 local and TS2552 stale `GameState` annotation|33.780s|
|1105 UI types|ab9f4923,empty diff|child0,no diagnostics|41.367s|
|1106 Bridge types|ab9f4923,empty diff|child0,no diagnostics|31.660s|
|1109 corrected root types|c1461a62,empty diff|child0,no diagnostics|31.320s|

All four records report fixedSource:true, equal start/end source and diff identities, empty untracked lists, and null signal/error. Actual commands match the existing three configurations, with no option relaxation. The two correction leaves are root-only: they are outside UI/Bridge include patterns and have no importing module in those graphs. Reusing the closed UI/Bridge checks for the unchanged graph is therefore bounded to this exact correction;1104 remains a failed original record.

The separately recorded Bridge docs guard is745 bytes / `e5efb2ec0a2083fea3956d3a05315d15462a02e6cecb859e3b5c922f3aa463e1`. Its459-byte before record hashes `5b8dcc568f304905a913728db54841a54c54f75c23196f0401755211d2b0d1ef`; both sides and the actual file independently match original1052's66,372 bytes / `f7d19d39218b9570b3be65a14a0e3cd0a346dd06be1beb283a9bdcc830dfff4d`. It links the actual1106 recorder, not a different type invocation.

| Record | JSON SHA256 | Raw SHA256 |
| --- | --- | --- |
|1104|`b99ee4c43a41de67067570e97924f80ada3302c99201518e5631957c2ef8e589`|`ef5432187f8a460ff2df19d651cd9af0debcdd66c55ef957df0c08a390310ccf`|
|1105|`224dcf7f5175194df0e4e6572d5b7d1ed031580057c99fcd532dc009ad7c2de4`|`10c0761331e0ca8714ff2a3a98d7a6a3092b9f939097c09950656b34dc6a58fd`|
|1106|`9ea23a7e8dabc739e0496251eabaafab1a1b0e64649f793aad8506bef9855bc2`|`2f9b164ec7660ec639cc6105341836a973a2af67b25e81652de3507cc7749a0a`|
|1109|`7192be790fa04b3f81e1ce4bb6e2d295d98e065180517e4263e6aac501690c5b`|`073f4499a661504625bcb571b928fa4263d7ef22442581b5dd82b024a75ac9ff`|

## Behavioral comparison boundary

Frozen1123 argv still selects all17 changed core leaves' files and all seven changed UI files, without a name filter. Closed full1100/1101 contain187 core cases/37 failures and70 UI cases/17 failures in this exact scope. The scoped baseline is175,659 bytes / `4c14223e7878c4df8ea62c9250227c0531cf21cb0d14bb28406bb72fcf868c19`; its selected identities, whole-file counts and shared-header groups were independently checked against the raw full runs. Global group ordinals refer to the full raw run, while the listed groups are the selected subset. Full primary diagnostic content, first frames and complete tails remain distinct comparison units.

The targets comprise26 core causes (25 newly observed plus the changed legacy campaign carrier) and15 new UI fixture/version causes. The same whole files also contain ten other campaign timeouts, one retained mixed-archetype B4 cause, and two inherited Casting timeouts. These are not preclassified future results. Actual post-maintenance causes, including any newly exposed downstream failures, must be compared after closure.

Original complete-suite failures, unresolved new NextEvent navigation, FU-1/FU-2, canonical098 L1/L2 premises and R8 timeout remain separately recorded. No application or type result alone resolves those limits. Reviewer activity is read-only source/Git and standard-library data analysis; all execution remains parent-owned.

## Actual whole-file closures

Both commands exactly equal the frozen1123 argv arrays. Both consumed published `c1461a62bd0c307094ae63ff28b66e7aa9716b78` with an empty diff, no untracked source, fixedSource:true, equal start/end identities, null signal/error and child1. No skip/TODO or unhandled-error marker occurs in either selected run.

| Record | UTC start → end | Wrapper elapsed | Files | Cases |
| --- | --- | ---: | --- | --- |
|1107 core|10:30:35.012 →10:34:23.166|228.154s|15 PASS /2 FAIL /17|175 PASS /12 FAIL /187|
|1108 UI|10:40:03.264 →10:41:00.178|56.914s|5 PASS /2 FAIL /7|67 PASS /3 FAIL /70|

The reporter's226.91s/55.88s elapsed values are distinct from recorder wrapper time. Every individual file's case count is unchanged from its full-run baseline. The source/declaration audit and unfiltered whole-file execution therefore support actual passes for the vanished identities, rather than inferring success from absence alone.

| Strict comparison to the selected full-run baseline | NEW | VANISHED | Identical primary | Changed primary |
| --- | ---: | ---: | ---: | ---: |
|Core1107 versus1100 scope|0|25|11|1|
|UI1108 versus1101 scope|1|15|2|0|

Independent raw parsing reproduced all detailed identities, the core's three diagnostic groups of9/2/1 headers, the UI's two groups of1/2, every complete current primary and full tail, their hashes and all four set memberships. No shared FAIL header was dropped. All25 targeted NEW core cases and all15 targeted NEW UI cases passed. This includes both independent alumni branches, actual admitted historical M2/S8 play, the Scientist intended negative causes, D3 controls and all four blocked UI controls; their former positive setup boundaries and original downstream assertions are now exercised.

The core's ten other campaign timeout primaries and complete tails are literal-equal to the scoped baseline. The remaining identical primary is the B4 natural mixed-archetype witness failure; its test frame moves563:32→568:32 due to the earlier five-line helper insertion. That source-frame/tail change is reported separately from its identical assertion cause. The changed campaign recovery leaf moves from a current age/provenance refusal to the unchanged5,000ms timeout, without a printed frame. The timeout primary matches that identity's older927 cause; it does not prove the recovered-world requirement passed or identify an internal await or completion of both loop branches. Thus campaign remains2 PASS/11 FAIL and B4 remains6 PASS/1 FAIL.

The UI's two existing Casting timeouts have literal-equal complete primary bodies and tails; neither identifies a particular await. The new third failure is independently assessed below. The selected runs and original complete runs remain child1; no global pass count is fabricated by relabelling the full results.

## New UI initial-mount cause remains unresolved

Exact identity: `ui/src/lot/WorldFirstLotNativeCastingReviewApp.test.tsx > World-First Lot-Native Casting Review Intervention V1 — App/Lot integration > reviews all six event-owned observations in the Lot, keeps deep detail optional, then hands the clear successor to Package`.

The new primary reports missing `studio-lot-screen`. The observed DOM contains the continuing-session banner and App's `studio-lot-lazy-loading` / “Opening the Studio Lot…” Suspense fallback. First printed frame is Testing Library `waitForWrapper:163:27`; the application-test frames are `renderStudio:250:28` and caller311:11. Its primary is2,627 bytes / `0fab2490ffa9f9cc5989762402d0cf806311bcadac7b9f8cf635b0621495a515`; full tail is3,206 bytes / `75b1fa35934708ac6ba391630cd2b987b0ca718b2556e6b66200dd0e439e3231`.

This leaf uses the default, unblocked fixture branch. It completed the strict historical admission/import, actual advance-to-review, clear-review checks and accepted direct acknowledgement before rendering, and its strengthened `saveActiveSession(...) === true` assertion passed. The failure then occurs in the first awaited Lot query, before the six event observations and later handoff assertions. The newly repaired synthetic blocked branch is not used here. Source shows the real lazy import at `ui/src/App.tsx:239` and matching fallback at4869; no failed profession/history proof or false persistence result is observed. Extra setup validation is not assumed to be timing-neutral, but the raw log does not establish a causal delay mechanism or justify a specific code correction.

An independent exact-identity search finds a PASS in673,713-X baseline rerun and1101;713 failed this same identity with a bare5,000ms timeout and no frame. That earlier body is not the current missing-element/DOM diagnostic.713-X also contains similar lazy-fallback DOM for a different `livingTurn.parity` identity, which is not same-case inheritance. Therefore retain this as **NEW versus1101 and a distinct unresolved initial-mount cause**. It receives no automatic FU-1 exemption, retry, timeout increase or speculative production fix. It is also separate from the already retained NextEvent second-open failure and its observational-only1124 instrumented pass.

## Frozen attribution cross-check and scope

Author's final1126-A,17,695 bytes / `2f651a23868f0a2a57fdc25372f967266e781f1b093533bfd2c3f0f602c02bd8`, agrees with the independent checks above. Its chronological pending statements describe their earlier append boundaries; the final section records the actual closed outcomes. Companion identities independently checked:

| Artifact | Bytes | SHA256 |
| --- | ---: | --- |
|Core comparison|31,255|`f6e971e27a1d734d1eff66d4eb0af941bd7772468a1cbbd60487a9c349391fab`|
|UI comparison|19,560|`f2e0c3b44d31de590fbfe63cd61141721411566785d6321dcd75247510bab35f`|
|Exact mount history|2,467|`1710e385cb6a7d567bcdce33202fb31a6b64e0a578bace5565c6a8c1a30e35e8`|
|Type-record companion|5,290|`84c534f9735c8ee9e2dafb0e5107771eaa8c6281e40b2b345dd3b8e8f5ed168a`|
|1107 raw|25,102|`2603221fee7ac407ef4951ba443989db5c06dcfafe878f21428c5136be8c6005`|
|1107 recorder|1,361|`66af3dcc13715671c3f2a5c4a010e5a35969fddc0ef314ed4d97d6581dff478d`|
|1108 raw|17,423|`dae4e78313e3ef791e87ce2703f66ccd3719b8500dc36b5cc77cf40eef1d3669`|
|1108 recorder|979|`2a272b520516b14c032ab3b85269d80136faca45e2567110c91063d7064ba051`|

The40 repaired cases supply bounded component evidence with exact surviving failures. They do not erase campaign/R8 timeouts, canonical098 missing natural rival-Writer work, FU-1/FU-2, the complete UI unhandled error, either newly observed UI readiness/navigation limitation, native dependency limits or the distinction between valid trajectories and invalid forensic evidence. A C.3 component disposition may cite these actual repairs and previously qualified persistence/lifecycle/projection/endurance evidence while retaining those limits. Neither all-green P14 nor broad UI reliability is established. No additional source/test/fixture correction is supported solely by the new mount diagnostic; further work needs a concrete separate causal task.
