# 1308-X: parent dry run of the staged RED against the scratch production draft

Development check, not a gate. The parent drafted the R2/R3 production increment in a scratch copy of the tree
(HEAD 7af5412c plus [1308-X-production-draft.patch](1308-X-production-draft.patch), 13 files, +285/-64) and ran the
seven 1308-C staged files there once (`vitest run`, node environment). The live tree and HEAD did not change. Raw
output: [1308-X-draft-dry-run.txt](1308-X-draft-dry-run.txt). Scratch-only artifacts: the neighbor file's
genuine projection 45/47/48 fixtures and generated contract manifest were absent from the copy (ENOENT rows).

| File | Result on the draft | Reading |
| --- | --- | --- |
| p14a1-release-busy-set | 11/11 | engine R2 behaves as required |
| bridge-p14r2r3-prior55 | 1/1 | the genuine outgoing55 checkpoint migrates both slots to Save41 |
| p14r3-save-v41 | 15/16 | one test defect (below) |
| p14r3-rival-release | 4 pass, 1 fail, 2 skipped | one premise defect (below) |
| bridge-p14a1-release-busy-set | 5 pass, 5 fail | fixture route defect (below) |
| p13b-rival-scientist-staffing | 0/2 | premise defect; see the measured non-witness |
| bridge-p14b6 neighbor | 1/24 | pre-existing stale pins (validateSaveV38 selection, projection literal 53, prior-roster count) plus scratch ENOENT |

## Test defects found

1. `bridge-p14a1-release-busy-set` seated leaves: `seatedFixture` founds the studio with `activateScriptDevelopment`,
   so greenlight refuses ("managed studios must greenlight an authoritative Ready script project",
   `src/core/productionAdmission.ts:108`). The core file's route (`p13aGeneratedStudio` plus six signed hires, then
   greenlight) works on both engines.
2. `p14r3-rival-release` "Scientists are never R3-surplus" and the scientist witness assume four Scientists at
   `advanceTo(…, 265)`. Measured on the unchanged engine and on the draft (identical): r01 employs 0 Scientists at
   state week 265 and 4 from state week 266. The S8 "seated week 265" facts are receipt weeks written during the tick
   that processes week 265.
3. `p14r3-save-v41` receipt-half downgrade leaf: its tampered save (a rival termination receipt, movement 0, row
   still active) is not a valid V41, and `convertV41ToV40` validates first, as every house converter does, so the
   refusal names the validator's interval failure, not "termination". A lawful V41 carrying a real rival release is
   reachable: the one labeled role rewrite, one tick (production releases the person), then the original role
   restored; the parent's scratch smoke validated that state under V41 and saw the downgrade refused by name.

## The scientist under-hiring hypothesis (1305-F amendment 2)

[1308-Q-scientist-deficit-probe.txt](1308-Q-scientist-deficit-probe.txt), unchanged engine, seed
`p13b-s8-bridge-probe-01` with the player Laboratory: every rival reports a deficit of 4 at state week 265 (before
that week's hiring); from week 266 through 420, r01 employs 4 Scientists with deficit 0 every week and the other
rivals have no demand. The hypothesis is not witnessed on the measured route. No search is opened; the hypothesis
stays recorded as unwitnessed, and no production correction follows from it.
