## Completion addendum — 1361-X7, 2026-10-03

Final input: `patch-r2.diff`. x3 completed clean at `ee289de67e453ce269c98d840a48799265c62993`. All type/generator checks pass; core has exactly the baseline plus the declared 45 and seven supervisor environment failures, UI has no failures, and d16 matches its base 12 exactly. The three case-specific S8 pins pass in x3; Save-v38 retains only C20. Its 102 guard observations are preserved and attributed. Retained baseline failures still do not imply execution of assertions after those failures; R8 is retained, not GONE.

The author-time pending statements below are historical and are superseded by 1361-X7 and the preserved x2 guard observations. No unresolved Save45 sweep failure remains; existing premise/masking limits remain disclosed. Independent final approval and recorded landing gates are separate requirements.

---

# Unit H deferred lines (1361-N)

Line numbers are HEAD's. `rows.json` gives each edited line's new number. P4, P5, P6 and P7 are the probes in the plan's S10 section; x1 is H's acceptance run.

## A. Plan lines I did not edit (1)

| Line | Plan item | Reason |
|---|---|---|
| `tests/p14c3-save-v38.test.ts:121` (now :131) | S8? 1, the bare `.toThrow()` in `rejectMutations` | Parent ruling 9: a bare probe takes a pin only where the dry run shows a guard other than the tampered field's. M2 shows no message for this line, because every caller stops earlier at `envelope38` (`p14c3-fixtures.ts:136`). The line stays bare. Its `validate` now comes from `saveApi('validateSaveV45')` (:116, edited). P5 must print the thrown message for each case. The 11 `rejectMutations` call sites hold about 103 cases. A case that shows a guard other than its own field's gets a pinned pattern in a follow-up edit. |

## B. Lines I edited whose outcome only a run settles

Each edit has a fixed form (a type error, a ruling or a production law). No M2 message exists at the line, so the plan's "measure" flag stays open until the run.

| Line | Edit made | What the run must show | Probe |
|---|---|---|---|
| `contracts/_v14Contract.ts:378` (plan :377) | guard with `p15Rows` and `next === 1`, then `stripP15` | The 25 `v14-migration.contract` leaves reach their own assertions. No cell holds a P15 row (the cells are founded studios without an industry). | x1 |
| `helpers/p14c2b-fixtures.ts:69` | `convertV45ToV44` innermost | `liveEnvelopeV36` returns for the never-ticked `live` at `p14c2b-save-v36:64` (M2 stopped there with "validateSaveV44: expected version 44", `m2-core.txt:401541`). | P4 |
| `helpers/p14c3-canonical-rival-fixtures.ts:198` | `convertV45ToV44` innermost | At tick 0 the chain succeeds and the V38 export still equals `CANONICAL_INITIAL_SHA`. | P4 |
| `helpers/p14c4-fixtures.ts:71` | `convertV45ToV44` innermost | No caller exists. The type gate is the only check. | P7 |
| `helpers/p14p3-fixtures.ts:113` | `steps.convertV45ToV44` innermost | The chain is complete. The G4 leaves that call it (`p14p3-directing-promises` :387, :482, :740) meet the P15 refusal first. | P4 |
| `p14c3-save-v38.test.ts:92` | expected side wrapped in `withEmptyP15Roots(..., week)` | Equality holds and no other key differs. The compared state is migrated and never ticked, so the roots sit at `recordedFromWeek: week`. | P6 |
| `p14c3-save-v38.test.ts` :375, :410, :421, :434 | `saveApi` key renamed, pattern kept | The pattern still names the guard that fires. `validateSaveV45` hands the stripped state to the V44 chain (`save.ts:10970`), so each message should match Save44's. | P5 |
| `p14c3-transition-evidence.test.ts:61` | `saveApi` key renamed, `.toThrow(cause)` kept | Each `cause` regex still matches. Same reasoning as the row above. | P5 |

## C. Rows with no edit, by ruling or by plan

- C20 (`p14c3-save-v38.test.ts:105`): no edit (ruling 8). Its primary changes from `"saveVersion":44` to `"saveVersion":45`.
- The 7 retained identities that H unmasks (`rows.json` field `unmasksRetainedRowIds`): no edit at the leaf (ruling 8). The probe after H must show each primary from 1358-I.
- R8 (`bridge-p14c3-runtime`, masked at `p14c3-genuine-evidence-fixtures.ts:17`): no edit. If it passes after H, it reads GONE with its cause recorded (ruling 8).
