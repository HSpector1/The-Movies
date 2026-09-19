# P14B-F2 — qualified full-pass attribution and closeout

Status: **P14B-F2 CLOSED — LOGIC VERIFIED · UNITY NOT VERIFIED**, qualified by
the inherited failures and limits below. Independent source04/core14/final16
reviews KEEP. Not an all-green suite or Owner acceptance. Exact remote publication
of the records checkpoint containing this closeout is the next-task release gate.

## Fixed-source full boundary

Tested, published and exact-remote-verified source/tests:
`89b5ad2cfc6947ea07fb043ef5b23eba38d7dbde`. Independent RED checkpoint
`957d2de13cef957cf97ee8e3dd746b51d0e9d200`. All recovered and newer upstream
commits/evidence remain ancestors; no reset, recreation or discarded work.
Parent independently rehashed the committed protected patch over RED:
`9145160c243937f2eae0abd119a670b60f8a2690dc7f0b42e2c7aef6777c14cc`.

Committed runner `../p14bf2-20260919/run-fixed-source.mjs`; metadata `00-run.json`.
Whole run `2026-09-19T19:19:14.237Z`–`2026-09-19T21:00:23.363Z`,
**fixedSource:true**,101.1521minutes. Clean start; same HEAD, empty protected diff
at both endpoints, no untracked protected source at completion. Only documentation
and inert text preparations changed. Parent session20565 is CLOSED.
Darwin21.6.0 x64, Nodev20.20.2,8GiB/four logical CPUs. Historical worker flags
`--minWorkers=1 --maxWorkers=2 --reporter=dot`; sole serialized heavy runtime.
No timeout increases, disabled tests, weakened validators or installations.

| Check | Actual full-run result |
|---|---|
| Root/UI typecheck | Exit0,19:19:14.359Z–19:20:58.522Z |
| Bridge typecheck | Exit0,19:20:58.524Z–19:21:39.722Z |
| Contract check | Exit0,19:21:39.722Z–19:21:41.905Z |
| Contract fixtures | Exit0,19:21:41.908Z–19:21:43.622Z |
| Full core | Exit1;302passed/7failed files(309);3351passed/22failed/6unchanged todo tests(3379) |
| Full bridge | Exit1;70passed/2failed files(72);761passed/12failed/2unchanged todo tests(775) |

Core19:21:43.624Z–20:27:45.924Z,Vitest3960.79s.
Bridge20:27:45.932Z–21:00:23.361Z,Vitest1956.21s.
Core includes bridge files; totals are overlapping selections, NOT summed unique
tests. Core took424.08s/about12.0% longer than B3's3536.71s, with13 additional
tests. Bridge's1956.21s versus prior1979.63s and whole101.15 versus94.52minutes are
observations, not a performance benchmark, cause diagnosis or equivalence claim.

## Exact failure attribution

Parent comparisons13/15 preserve every complete test identifier and diagnostic/
trace against canonical P14A.3f32d56c logs. Only ANSI display escapes and the
scenery-export generated temporary-directory suffix are normalized. All22 core
and12 bridge failures are EXACT historical matches; zero new/changed/absent.
Independent full-log reviews14/16 confirm the comparisons and source evidence.
No Failed Suites or unhandled-error diagnostics. No corrective source/test patch
or rerun is indicated by this completed evidence.

Core failures: eleven campaign-library timeouts(nine5000ms/two20000ms), one
campaign-isolation60000ms timeout, three exact scientist-foundation golden-digest
mismatches, six missing private r3n1 fixture ENOENT failures, one missing-PIL
exporter failure. Bridge failures are those same eleven campaign-library and
one isolation timeouts. Exact timeout signatures prove attribution only: not
identical causes, performance equivalence or the unfinished assertions passing.
Missing fixture/PIL behavior remains unverified; golden expectations were not
repinned. These are qualified non-green full suites, not blanket acceptance.

Core passes all13 new B-F2 cases,34 B1T4 regressions,34 B3 cases and61 runtime-
checkpoint cases. Bridge separately passes all19 B3 atomic-command and61 runtime-
checkpoint cases, including the strict historical schema registry/set assertions.
The unchanged todos remain explicitly outstanding, not converted into passes.

## Candidate and implementation evidence

Candidate `../p14bf2-20260919/11-candidate-disposition.md`: independent behavioral
RED11fail/19pass/2todo; no missing-module/fixture substitution. Three disjoint
target groups03/05/06 total36files404PASS/5unchanged TODO, both typechecks and
both contract checks PASS, allfixedSource:true on the exact committed patch.
Tests stayed unchanged after RED; no fixture correction. Independent source04KEEP.
Default timeouts remained intact in the accepted chooser reconciliation; the
earlier inert timeout-raising draft was rejected before installation.

Production change ONLY `src/core/promises.ts`, three hunks(6insertions/7deletions):
acting-profile presence replaces primary-role eligibility; digest reads that
actual eligibility fact; fresh roots/evaluations use rules3. Unknown-person and
other feasibility gates remain. D9/companion has-discipline law already governs
casting; this corrects a factual contradiction, not a new Owner product decision.
No assignment, profession label, cast read-model pool, seating, chooser,
reservation, buffer/slack, material-term digest, save-validator or schema change.
Existing rival P1/count1/full-term iff-achievable policy remains; changed
eligibility may let more people receive an attachment under that SAME policy.

Historical root versions and receipts remain unchanged on load. A genuine new
freeze may replace its live receipt without rewriting the historical root version.
Save29/protocol4/projection46 remain unchanged. Schema:
`sha256:584bdd8565030f049d548b1af4fcbf8c517ca7c9150016736f632f1ef8fcb98c`.
Generated C# SHA256:
`1b5c7e889ffe3454858afa8960b4a4c099d88cfe25a9553212ba67f11a4c3268`.
promises.ts SHA256:
`de64e957381b1b33bf1d2789d976326fc3f54277035fc2059a2c3d5ea0899a0a`.

## Immutable evidence identities

- Whole-run seal00: a007a6ce7c07bc749f8508cbc2729b7d4946252c57a91808fd142cf69df1fa5c.
- Raw core11:215c7729d4ea3f304d5aa85a285232b413faed903e65cd221aa62fe61dc84cc1.
- Core comparison13:fa4c886eaa51d3b3989a7d8e12b7ac20c65acf442897728a76a9b6edfaaf434a.
- Independent core14:43d9357cca066422443108667acdac65538f0c191688327602ca100db9166639.
- Raw bridge12:e5d2e132239c753c252b4190109a0313cf910272592f93ff45b041d4fe185e39.
- Bridge comparison15:7a805806f4a4d953dd4de419ac229d85934bfc04c33fc13c7013286fb0aa20da.
- Independent final16: a39816f32c84f596bd058921110b03e98cb578b598826b1578584fddfc4ee45b.

Raw output remains unchanged. Formatting of raw historical diagnostics/patches is
not repaired to manufacture a style pass.

## Next implementation gate and deferred scope

Publish this qualified checkpoint and independently verify its exact remote SHA.
Then mint the final nine genuine outgoingV29 snapshots with the independently
reviewed CURRENT-rival focus correction, plus the separate genuine outgoing46
runtime checkpoint. Run serially on the same accepted published producer where
possible, archive actual operational code and raw evidence, independently verify
real artifacts, remove only temporary operational entries/helpers, checkpoint and
publish preservation. Do not remint the already preserved evaluator1 corpus9c605dc.
Draft files and invalid provenance sentinels are NOT T0 completion.

Next bounded implementation plan: `../../plans/P14B4-HEADLESS-PLAN.md`, reviewed
guidance SHA382252e23b6353acf602d87f38032ff961e9f7f9740bbfdf2b2ae368c30df4e4.
Owner-adapter preparation13/review14 in the candidate directory add actual owner
seams and caller-specific busy predicates; no implemented solver certification.
Independent save/outcome test drafts remain inert/unexecuted and need actual T0
pins and fixture proof before their behavioral RED. Then release the sole P2
production writer and continue remaining P14/P15/P16/sufficient P17/P18 without
routine permission pauses.

No whole-P14, Unity compilation/rendering/native UI/UX or Owner acceptance claim.
Maintain the integration backlog, especially discipline-capable native composing/
casting, historical refused receipts, future P2 class/preference surfaces and the
inherited runtime schema32–44 registry gap. These remain deferred/unresolved as
recorded; this narrow correction does not silently close them.
