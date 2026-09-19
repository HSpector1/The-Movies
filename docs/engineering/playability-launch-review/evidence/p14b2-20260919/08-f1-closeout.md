# P14B.2-F1 — completed setup after wrap, bounded verification

Status: **LOGIC VERIFIED (bounded F1) · UNITY NOT VERIFIED**. Not a full B2
closeout or Owner acceptance. Base `e37cd2330be8c9129b0193a2bf8e84258e851307`;
final production/fixture commit `af455ef838b8c2227d784ebdc8bafb89e7a6835b`.

The real fixture went from first take at61 to wrap/Post at62. Occupancy correctly
released stage07; completed setup remained historical. The old validator rejected
that lawful retained record. A dedicated independent RED (`02i`) reproduced three
positive failures, with ten negative cases already passing; source snapshots and
before/after hashes are retained. Earlier discovery runs and unsuccessful fixture
attempts remain evidence, not overwritten or described as green.

Sole production change: `src/core/productionSetup.ts`, exact live binding OR a
released stage with completed setup, same retained Set, and matching permanent
wrap production/stage/Set with completion ≤ wrap ≤ current week. Other completion,
units, dates, revisions, recipe/route, adoption/equipment and prior-work checks
stay intact. No setup deletion, occupancy restoration, transient-event dependency,
save shape/version change or projection change. Save29 / projection45 remain.
R07's contradictory old post-Shooting-record wording is explicitly reconciled in
the existing plan: no new setup work after Shooting, but completed history stays.

`04-f1-targeted`: **17 files / 179 passed / three unchanged todos**, exit0,
2026-09-19 13:45:41.533Z–13:48:49.479Z. All 13 new F1 regressions, five fixture
preconditions, five R07 files, bridge R07, C2a stage release, Studio Events contract,
and all seven B1 files ran. Fixed source true; full tracked AND untracked tested
patch SHA `3d73974a593851e0519aaf2615fbb1652dfaee8aa02180189ef1021943e5f6d3`.
Bounded independent final source review KEEP (`07-f1-review.md`).

`05-f1-typecheck`: root/UI PASS, exit0, 13:49:32.862Z–13:51:06.107Z.
`06-f1-typecheck-bridge`: PASS, exit0, 13:51:06.837Z–13:51:43.764Z.
Both fixedSource true with the same complete tested patch hash above.
`09-checkpoint-red`: two expected failures, fixedSource true, exit1,
13:54:39.719Z–13:54:49.151Z. Genuine45 is still the current schema, so it equals
the outgoing ID and loads without migration (`null`, not expected4). No fixture
restamping or unrelated failure; these forward tests precede projection46.

Limits: Post-contention fixture explicitly configures one Post slot and verifies
the pure setup validator, not a full save for that configured state. Other real
Post and 27-week-compacted states pass full V29 round trips. No wholly green full
suite is claimed for F1; B2's later full pass includes this producer correction.
The two new genuine45→46 checkpoint tests are forward tests, not in the F1 target
and deliberately RED while45 is still current. Main B2 bridge test/module RED and D3 are
still owed. Unity/native/Owner acceptance remains deferred.

Next: publish this recoverable checkpoint, install the independently authored B2
bridge test draft for its absent-module RED, then release projection46 implementation.
