# 729-W — P14B.7 writer report: the promise waiver implemented against the landed RED

Source: `wip/headless-program-20260916-ts` at `480aa7fe`. Brief: `728-W-b7-writer-brief.md`.
Authority read in full before writing: `720-b7-waiver-expansion.md` current bytes, sha256
`43f314e41128afd9eaf5a25ca71080545f9fc9846d0406c990c4360cd0987b1b`, 455 lines.

**Result: the requirement suite is GREEN, 29 passed (29), with the suite unedited.** Three findings
below outrank that, one of them a live double-credit defect measured on the suite's own fixture.

## 1. Suite result

Baseline before any source change, `npx vitest run --project core tests/p14b7-promise-waiver.test.ts`:

```
 Test Files  1 failed (1)
      Tests  27 failed | 2 passed (29)
```

Final, same command:

```
 ✓ |core| tests/p14b7-promise-waiver.test.ts (29 tests) 3483ms
 Test Files  1 passed (1)
      Tests  29 passed (29)
```

`git status --porcelain tests/` is EMPTY. No test file, helper or fixture was touched.

## 2. Files and hunks

Seven source files, 366 insertions, 5 deletions. No test, no fixture, no helper contract.

| file | hunk | reason |
| --- | --- | --- |
| `src/core/promises.ts` | `contractInterval`, `substituteDraft`, `seatClassOf`, `identicalSubstitute` (new, after `breakPromisesOnCancel`) | the substitute's feasibility draft, where both silent traps live |
| `src/core/promises.ts` | `waiverAccepted` (new export) | 720 §2 item 2, interpretation I1: `string \| null`, a reason or nothing |
| `src/core/promises.ts` | `waivePromise` (new export) | 720 §2 items 1, 3, 5, 6, 7, 8, 9, 10, 16, 17 |
| `src/core/promises.ts` | `projectPromisesPreV32` (new export, file end) | 720 §2 item 11's refusing downgrade helper, beside `projectPromisesPreV29` |
| `src/core/save.ts` | `SaveFileV32` type; `GameStateV32` import; `projectPromisesPreV32` import | the V32 envelope, deliberately absent from the `SaveFile` union |
| `src/core/save.ts` | `stripV32Field`, `convertV31ToV32`, `convertV32ToV31` (new, after `migrateToV31`) | 720 §2 item 11, interpretation I3 |
| `src/core/types.ts` | `waivePromise` member added to the `Action` union | 720 §2 item 1, "reachable from the action dispatch" |
| `src/core/types.ts` | `ProfessionalPromiseV32`, `GameStateV32` (new, after `GameState`) | the V32 promise row carrying `supersededByPromiseId` |
| `src/core/actions.ts` | `waivePromise` import; `case 'waivePromise'` in `applyActions` | the dispatch adds no rule, so action and direct call agree exactly |
| `src/core/index.ts` | `waiverAccepted`, `waivePromise`, `projectPromisesPreV32` added to the promises export block | the module's public surface |
| `bridge/trust.ts` | `PROMISE_OUTCOME_WORD` table; `:68`/`:69` gate and word replaced by one table lookup | 720 §2 item 18 and §6's mislabel hazard |
| `bridge/industry.ts` | comment above the public fold, 12 lines. CODE UNCHANGED | 720 §6: the WAIVED exclusion recorded as a decision, with its 49 -> 50 cost |

`PROJECTION_VERSION` stays 49 and `LIVE_SAVE_VERSION` stays 31. `npm run check:bridge-contract`
and `check:bridge-contract:fixtures` both verified: the JSON schema, the Unity DTOs, the contract
manifest and the union fixtures are byte-unchanged. B.7 has no wire change.

## 3. The two traps, measured rather than asserted

Both are load-bearing in the shipped code. Probe transcripts in §7.

**Trap 1, the contract interval.** `genuine-v31-bound-open-p1` promise-0: real contract
`{startWeek: 52, termWeeks: 52}`, promise window `[52, 92)`. A substitute window `[60, 110)`:

- judged against the REAL contract interval: `IMPOSSIBLE`
- judged the `reclassifyPromise` way (its own window as the interval): `REASONABLY_ACHIEVABLE`
- the shipped `waiverAccepted` refuses: *"the substitute is not reasonably achievable over what
  remains of the contract, the due week falls outside the proposed contract"*

The consequence the trap protects against, reproduced end to end: a post-waiver state whose
substitute overruns its contract is refused by the save validator with
`validateSaveV31: frozen V30 state is invalid, validateSaveV30: state.promises[1].contractId ends
before the promised window`. That is the opaque crash 720 §3 names. A legal waiver's successor
state passes `makeSave` and re-validates as V31, a check the RED suite never makes.

**Trap 2, the self-reservation.** Same fixture, the happy-path substitute `[60, 100)`, count 1:

- draft WITHOUT `promiseId`: `FRAGILE`, bottleneck `needs a picture not yet commissioned`
- draft WITH `promiseId` set to the ORIGINAL's id: `REASONABLY_ACHIEVABLE`, bottleneck `null`

720 §3's measured claim reproduces exactly. Every acceptance case in the suite is green only
because the exclusion is applied, so the suite does test this.

## 4. FINDING 1 (HIGH): 720 §2 item 17 is wrong, and the failure is live

**720 is wrong a third time, in the same shape as the first two: invisible until someone runs it.**

Item 17 and §5(c) state that the original's qualifying takes "do NOT become retroactively eligible"
for the substitute, on the Owner's verbatim requirement "without erasing completed work or counting
it again toward the substitute". 720 states the outcome and specifies no mechanism. The RED pins
neither half. Implemented exactly as 720 instructs, the takes ARE retroactively eligible.

Measured on `genuine-v31-part-served-p1` using the RED suite's OWN group6 draft
(`windowStartWeek: today`, `dueWeekExclusive: today + 60`, lines 455-456), with no new picture
greenlit and no new first take:

```
today = 113 | original: window [104,194], count 2, progress 1, evidenceRefs []
original qualifying takes: [["first-take-event-42",113]]
substitute AT MINT      : window [113,173], count 1, progress 0, evidenceRefs []
substitute qualifyingTakes ALREADY: [["first-take-event-42",113]]
AFTER ONE WEEKLY PASS, no new work done:
  substitute: progress 1, outcome SATISFIED, evidenceRefs ["first-take-event-42"]
  waived original: outcome WAIVED, outcomeWeek 113, progress 1
```

The substitute mints clean at `progress: 0`, `evidenceRefs: []` exactly as item 17 requires, and
then `advancePromisesWeek` credits it with `first-take-event-42`, the same picture that gave the
ORIGINAL its progress of 1. A player who promised two pictures, delivered one, and waived for a
one-picture substitute owes NOTHING further and collects a `promiseKept` trust driver for work
already counted. That is the double-credit the Owner forbade, arriving through the front door.

The cause is not a choice I made. `qualifyingTakes` (`promises.ts:665-679`) filters takes by
`take.week >= promise.windowStartWeek`, and the suite's own draft opens the substitute's window AT
the take's week. Nothing on a promise record distinguishes "minted after this take" from "minted
before it".

**I did not fix it, deliberately, because every available fix contradicts the suite.** Both
candidates were checked against the RED case by case:

- *Refuse a substitute whose window already contains a qualifying take at mint.* Narrow and exact,
  but it REFUSES the suite's group6 acceptance case, whose window opens at the take's own week.
  The suite would go red.
- *Refuse a substitute window opening before the waiver week.* Cruder, and it does not even fix
  group6 (`windowStartWeek === today` is not the past). It also falsifies group5's stated isolation
  premise, which uses `windowStartWeek: 60` at `today: 70` and requires trust to be the ONLY
  refuser. The test would still pass, for the wrong reason.
- *An evidence-based exclusion* is dead on arrival: the original carries `progress: 1` with
  `evidenceRefs: []`, so there is nothing to exclude by reference.
- *A durable "counts only from week W" floor on the promise record* is a save-shape change, needs
  the live writer bump, and is outside this slice.

Writing any of these would have been the "silently filled gap" the project rule forbids. The
parent owns the choice. My recommendation is the first option, which needs no schema and matches
the Owner's own illustration ("three-picture promise served once, two-picture substitute, requires
TWO FURTHER qualifying appearances"); its cost is one line of the RED's group6 draft moving to
`today + 1`, which is the test-author's patch and not mine.

## 5. FINDING 2 (MEDIUM): 720 item 11's "set on the WAIVED original" cannot be satisfied

Item 11 requires `supersededByPromiseId` to be "set on the WAIVED original and naming its
substitute". The RED pins `expect(LIVE_SAVE_VERSION).toBe(31)` (group9, one of the two
originally-passing cases), so the live writer must not move. With `LIVE_SAVE_VERSION` at 31 a live
promise row CANNOT carry the field: the exact-key validator
(`promises.ts` `validatePromiseRootsForVersion`) refuses any 17th key with
`state.promises[i].supersededByPromiseId is not a field of this record`, so every save would break.

So the two halves of item 11 are mutually exclusive in this slice. I implemented the half the suite
pins: `convertV31ToV32` / `convertV32ToV31` / `projectPromisesPreV32` exist and are governed, the
field opens `null` on every record, the downgrade refuses a non-null value before envelope
validation, and `waivePromise` writes no field. `SaveFileV32` is deliberately NOT in the `SaveFile`
union and there is no `migrateToV32`, because nothing can produce a V32 file; adding either would be
the values-only sweep the brief assigns elsewhere. `validateSaveV32` is also absent: with the writer
frozen, the only V32 shape reachable has `null` on every row, which `projectPromisesPreV32` already
constrains fully, and the live bump slice needs that validator written beside `makeSave` anyway.

So the waiver link would be UNRECORDED. Rather than lose it, `waivePromise` names the substitute in
the waived original's `outcomeCause`, a field the validator already requires to be non-empty text:

```
"outcomeCause":"this person accepted the substitute promise \"promise-2\" in place of it"
```

That is prose, not a typed edge, and it does not discharge item 11. It keeps the fact on the record
until the live bump lands. Flagging it so the later slice does not assume the typed link exists.

## 6. FINDING 3 (MEDIUM): the committed RED file breaks `npm run typecheck`

`npx tsc --noEmit` (the first half of `npm run typecheck`) reports **131 errors, every one of them
originating in `tests/p14b7-promise-waiver.test.ts`**, and NONE in any file I touched:

- **122 x TS5097** `An import path can only end with a '.ts' extension`. The RED imports four
  `bridge/*.ts` modules by `.ts` path, which drags the whole bridge into the root tsconfig project.
  That project excludes `tests/bridge*.test.ts` for precisely this reason; `p14b7-*` does not match
  the pattern.
- **7 x TS6133** unused locals inside the file (`qualifyingTakes`, `trustDrivers`, `makeSave`,
  `player`, and three `today` bindings).
- **2 x TS2459/TS2724**: the file imports `PromiseFamily` and `PromiseFeasibilityReceipt` as types
  from `../src/core/promises.js`. `promises.ts` imports both from `types.js` and re-exports
  neither.

Proof the 131 are not mine: the same compiler over `src/**` plus `tests/**` with that ONE file
excluded exits **0** with all my changes in place (probe config in §7). I did not add the two type
re-exports to `promises.ts`, because it would not make the file clean and it guesses at the
test-author's intent; the file needs a structural decision (exclusion pattern, or rename to the
`bridge*` convention) that belongs to whoever owns it.

`npx tsc -p tsconfig.bridge.json` exits **0**. `npx tsc -p ui/tsconfig.json --noEmit` exits **0**.

## 7. Smaller observations on the RED, recorded without action

None of these blocked the implementation. All are reported because the suite is the requirement and
a gap in it is a gap in the check on my work.

- The suite header (lines 22-30) announces "**New group12**" for the closed trust question. There is
  **no group12** in the body. The last describe is group11 (line 600).
- The header says item 18 is "Pinned in group10 as a hard negative (not 'kept', not 'broken') plus a
  softer, separately-labelled interpretation (mentions 'waived')". **group10 pins neither.** Its body
  asserts only that exactly one row exists with a non-empty string reason, and its own comment says
  "only the row's EXISTENCE and identity are pinned, not its wording". I implemented item 18 per 720
  regardless: the word comes from a table, not a widened ternary, so `VOIDED` (P14C) will mint no row
  rather than be mislabelled "broken" by an else branch.
- Item 17's substitute half (`progress: 0`, `evidenceRefs: []`) is pinned nowhere. Implemented per 720.
- The two originally-passing cases are group1's `reclassifyPromise`-buggy-way premise and group9's
  `LIVE_SAVE_VERSION`/`PROJECTION_VERSION` pin. Neither calls an assert guard. That reconciles the
  27/2 split exactly.

## 8. Checks actually run

| check | command | result |
| --- | --- | --- |
| requirement suite | `npx vitest run --project core tests/p14b7-promise-waiver.test.ts` | **29 passed (29)**, from 27 failed / 2 passed |
| core typecheck | `npx tsc --noEmit` | 131 errors, ALL in the RED file, none in any file I touched |
| core typecheck, RED excluded | same compiler, probe config | **exit 0** |
| bridge typecheck | `npx tsc -p tsconfig.bridge.json` | **exit 0** |
| ui typecheck | `npx tsc -p ui/tsconfig.json --noEmit` | **exit 0** |
| wire | `npm run check:bridge-contract` | **exit 0**, schema + Unity DTOs + manifest verified |
| wire | `npm run check:bridge-contract:fixtures` | **exit 0**, union fixtures verified |
| promise/save regressions | `npx vitest run --project core tests/p14b1-promises.test.ts tests/p14b1-save-v29.test.ts tests/p14b4-save-v30-compatibility.test.ts tests/p14b5-save-v31.test.ts tests/p14b3-reservations.test.ts tests/p14b4-cancel-causal-proof.test.ts` | **145 passed (145)** |
| bridge regressions | `npx vitest run tests/bridge-p14b2-trust.test.ts tests/bridge-p14b1-promises.test.ts tests/bridge-p14b3-promise-command.test.ts` | **52 passed (52)** |
| engine regressions | `npx vitest run --project core tests/save.test.ts tests/migration.test.ts tests/actions.test.ts` | **82 passed (82)** |

NOT run, per the brief: the full core suite, the evidence runner (`record-check.mjs`), native/Unity.
Nothing is committed and nothing is pushed. LOGIC VERIFIED, UNITY NOT VERIFIED.

### Archived probes (record 726: a probe is archived, never silently deleted)

Three disposable artifacts, kept at
`/private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/6ed44184-f9ac-40ba-bf1b-321fc7506549/scratchpad/`.
All read-only against the T0 corpus; none writes to the repo; none lives under `tests/`.

1. `tsconfig.probe.json` extends the repo root config and adds ONE exclusion,
   `tests/p14b7-promise-waiver.test.ts`, to separate the RED file's own errors from the source's.
2. `probe-b7.ts` measures both traps, the save-validator consequence, and the first look at item 17.
   Its section [3] prints `promise-1` as "the substitute" on `bound-open-p1`; that fixture already
   holds a `promise-1` for a different person (`t-act-08`), so the line is mislabelled and the real
   substitute there is `promise-2`. The counterfactual it runs is still a valid demonstration of the
   overrun crash, on that pre-existing row. Noted so nobody reads the transcript as a defect.
3. `probe-b7b.ts` is the item-17 measurement in §4: the suite's exact group6 draft, then one
   `advancePromisesWeek`.

## 9. Next concrete action

The parent decides FINDING 1 before this lands. Until it is decided, an accepted waiver can settle
its substitute SATISFIED on already-delivered work, which is a gameplay-visible exploit and not a
cosmetic gap. FINDING 2 hands the later live-bump slice an explicit debt. FINDING 3 is the
test-author's or the parent's call on the RED file's project membership.

---

**RED file identity, re-read from disk at the END of this work:**

```
$ shasum -a 256 tests/p14b7-promise-waiver.test.ts
68c76efea8bc96724587cde0b81791b0ab43171ac0318bfa535b0bcc6b3217b0  tests/p14b7-promise-waiver.test.ts
$ wc -l tests/p14b7-promise-waiver.test.ts
     619 tests/p14b7-promise-waiver.test.ts
$ git status --porcelain tests/
(empty)
```

Identical to the identity `728-W` published (`68c76efe...`, 619 lines). The suite was not edited.
