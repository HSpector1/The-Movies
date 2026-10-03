## Completion addendum — 1361-X7, 2026-10-03

Final input: `patch.diff`. x3 completed clean at `ee289de67e453ce269c98d840a48799265c62993`. All type/generator checks pass; core has exactly the baseline plus the declared 45 and seven supervisor environment failures, UI has no failures, and d16 matches its base 12 exactly. The retained S8 patterns pass; UI has no failures. Both production-stop files pass (causal-core 8/8 and byte-parity 6/6). No lawful ticked archive was repinned as a refusal.

The author-time pending statements below are historical and are superseded by 1361-X7 and the preserved x2 guard observations. No unresolved Save45 sweep failure remains; existing premise/masking limits remain disclosed. Independent final approval and recorded landing gates are separate requirements.

---

# Unit G3 deferred lines (1361-N)

Line numbers are HEAD's in the G3 tree (HEAD holds unit H's patch). Every edit replaces one line with one line, so no line number moves. `rows.json` gives each edit with its classification row ids and its M2 frame. P5 is the S8 message probe in the plan's S10 section.

## A. Plan lines I did not edit (0)

None. The plan's G3 table lists 108 edit lines (96 certain, 12 measure) and the patch edits all 108. No G3 line stays unchanged or skipped. G3 holds no bare `.toThrow()` probe on a save (its `not.toThrow()` lines are S1 calls), no S4, S5, S7, S9 or S10 line and no retained row.

## B. Lines I edited whose outcome only a run settles (12, all S8)

Each rename keeps its pattern byte for byte. After the rename, `validateSaveV45` checks the envelope and the four roots, then hands the stripped state to the frozen V44 chain (`src/core/save.ts:10970`). Each pinned guard should fire as it did at Save44. M2 never showed a guard in G3. Every M2 row that reached a renamed call stopped at "validateSaveV44: expected version 44", and every other call sits behind an earlier failure in its test.

| Line | Pattern kept | Reached in M2 | What P5 must show |
|---|---|---|---|
| `construction-save-v11.test.ts:514` | `/canonical Annex id .*collides with persisted production history/` | rows 241 and 242 stop at the version check | all six loop cases (three reserved ids, building and completed) throw the Annex message (`construction.ts:251` or `placement.ts:2015`) |
| `p09a-w0-founding-regime.test.ts:145` | `/not a known founding regime/` | no, the test stops at :137 | the regime guard, not a root or envelope refusal |
| `p09a-w0-founding-regime.test.ts:147` | `/foundingRegime is missing/` | no | the missing-key guard |
| `p09a-w0-founding-regime.test.ts:149` | `/cannot carry founding structures/` | no | the laundering guard |
| `p09a-w0-founding-regime.test.ts:151` | `/must carry its founding structures/` | no | the laundering guard (bare-lot side) |
| `placement-save-v12.test.ts:418` | `/overlaps placed facility 1/` | no, the test stops at :412 | the placement overlap guard |
| `placement-save-v12.test.ts:430` | `/violates its clearance ring/` | no | the clearance guard |
| `placement-save-v12.test.ts:443` | `/facility operating cost at week .* disagrees/` | no, the test stops at :436 | the opex guard |
| `placement-save-v12.test.ts:450` | `/facility operating cost at week 1 disagrees/` | no | the opex guard |
| `property-state-v13.test.ts:799` | table of `expected` patterns, first case `/state is missing required field "property"/` | row 828 stops at the version check | each of the structural cases reaches its own property guard (`save.ts:3931` for the required-key case) |
| `property-state-v13.test.ts:868` | table of `expected` patterns, first case `/property road 0 is not a well-formed rectangle inside the property bounds/` | row 829 stops at the version check | each semantic case reaches its own guard (`placement.ts:1651` for the first) |
| `property-state-v13.test.ts:880` | `/placed facility 1 overlaps property structure "theater"/` | row 827 stops at the version check | the structure-overlap guard (`placement.ts:2040`) |

If a probe shows another guard first for any case, that case becomes an S8 masking record. No edit in this patch aims a pattern at a run.

## C. Open points that need no edit

- **Archive on ticked saves.** `p13a-causal-core` :49 and :91 (weeks 315 and 428) and `v14-byte-parity:206` give `validateSaveV45` a save whose Power Ranking archive holds recorded quarters. M2 stopped at the version check before it. A refusal there is a production defect, not a test edit.
- **UI trailing comments.** The eight UI lines keep "SaveFileV38" in their trailing comments. The plan says the comment "may name the live writer", so I changed only the number.
