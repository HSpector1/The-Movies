# 784 — P14C.2a T1: POST-IMPLEMENTATION coverage additions closing 783's four gaps

Task: P14C.2a T1 follow-up, controlling order OPUS-C2-TO-CODEX-LAUNCH. Worktree
`/Users/zacheryspector/The-Movies-headless-program`, branch `wip/headless-program-20260916-ts`,
implementation at `ad154f5b` (HEAD may be later docs commits). Closes the four test-coverage gaps
783 (contract-auditor's independent source review) found on the KEPT implementation: labeled
coverage additions written AFTER the implementation exists, each shown to DISCRIMINATE against the
pre-implementation scaffold, not RED. Allowed write paths: the three P14C.2a test files, the shared
fixtures helper, and this record. No production file touched.

**Status: DONE**, including a second round: the parent's own mutation-testing of the tick-wiring case
against the full implementation (§1) found the case's synthetic market-case injection was an unlawful
construction that crashed rather than failed cleanly under an order-swap mutation. That case was
rebuilt using only real actions/ticks (no injected market rows) — see §1 for the full account. All four
gaps closed; 40 cases now pass (37 original + 3 new — item 2 extends the existing G4 case rather than
adding a new one, so its count is unchanged at the file level).

## 1. Gap 1 — tick wiring (777 §4)

**Before:** `tests/helpers/p14c2a-fixtures.ts`'s `stepWeekWithLifecycle` called
`advanceCareerLifecycleWeek` a SECOND time after every real `tick()`. That second call was idempotent
(A6b proves idempotence directly, never through this helper), so A1, A2a, A2b, A5, E1, E2 and F1 —
every natural-route case built on it — would still have passed even if `tick()`'s OWN wiring of the
lifecycle step were removed or misordered. Nothing verified that `tick()` itself runs the step, or
that it runs it BEFORE the market step.

**Change:** `stepWeekWithLifecycle` now does nothing but `return tick(state)` — the redundant second
call and its `birthdaysDueAt` computation are gone (both imports removed from the fixtures file).
Every natural-route case that used the helper (A1, A2a, A2b, A5, E1, E2, F1) is now driven by `tick()`
alone with no assistance, and was re-run to confirm nothing regressed (§4 below). A6b's own explicit,
separate idempotence check (`advanceCareerLifecycleWeek` called twice directly, never through the
helper) needed no change and still stands as the one place idempotence is asserted.

**New case, first revision (superseded below):** a bare `tick()` call on
`genuine-v33-c2-hard-boundary-and-idle-window`'s `authored-0000` (hard boundary at week 832), with a
hand-built `TalentMarketCase` injected into `state.talentMarket.cases`, `contractId:
'synthetic-tick-wiring-case'` — a name that names no real employment row.

**Parent verification found a real defect in that first revision.** Mutation-tested against the FULL
implementation (`ad154f5b`, only `tick.ts` mutated): (1) wiring removed — A1/A2a/A2b/A5 and the
tick-wiring case correctly fail on "record undefined"; genuine discrimination. (2) lifecycle step moved
AFTER the market step — the case DID fail, but not on the "invalidated in the same tick" assertion it
exists to make: `advanceTalentMarketWeek`'s step 3 (`openCasesAt` → `caseStatusAt` → `decisionWeekOf`,
`talentMarket.ts:122-128`) dereferences `kase.contractId` against real `hollywood.employment` and threw
`talentMarket: case for "authored-0000" names employment row "synthetic-tick-wiring-case", which does
not exist`, because under the CORRECT order the case is invalidated at step 1 before anything ever
reads `contractId` — so the dangling reference was silently never exercised there, and only surfaced as
a crash once the order was wrong. An unlawful injected case cannot prove an ordering claim: whichever
order is correct, one of the two paths never reaches the row, so the mutation cannot cleanly show which
one is which.

**Rebuild (this revision):** every synthetic market row is gone. The case now uses ONLY real mechanics,
the same techniques D2/B4a/F1 already use elsewhere in this suite:
- `p13aGeneratedStudio()`'s own genesis director (`person-studio-aca408ec-r01-1`, r01's roster, hard
  boundary 75 per 773 D1) — a REAL person with a REAL 208-week employment row, `contractId`
  `studio-aca408ec-r01:contract:person-studio-aca408ec-r01-1:0`.
- That REAL row's `endWeekExclusive` is shortened to 52 (unchanged `startWeek: 0`), so its renewal
  window (`HIRING_RENEWAL_WINDOW_WEEKS = 12`, `src/core/tuning.ts:392`) opens naturally at week 40
  within a short, controlled horizon, instead of requiring 200+ real ticks.
- That SAME person's own provenance anchor is overwritten (`provenanceRowFor(directorId, 74.15, 0,
  'authored_exact_week')`) so their REAL next birthday — computed by the REAL exported
  `nextBirthdayWeek`, never hand-derived — lands at week 45, confirmed by assertion
  (`expect(dueWeek).toBe(45)`), strictly inside `[40, 52)`: after the window opens, before the
  (shortened) contract's own natural expiry.
- `state.talentProvenance.due` is rebuilt via the REAL exported `recomputeDue(rows, storedAgeOf)` (the
  same canonical rebuild the V33 validator and every migration step use), never hand-inserted.

Real ticks (bare `tick()`, no helper) run from week 0 to week 44; the test asserts a REAL case is
already open on the REAL `contractId` (natural discovery, not injected) before asserting anything about
the birthday. THEN, and only then, one more bare `tick()` (week 44 → 45, the case under test) must show
BOTH: the announcement record exists at week 45, cause `hardBoundary`, AND that SAME real case's
`outcome` is `'invalidated'`, `closedWeek: 45`, reason matching `/announced retirement/` — proving 777
§4's order (`advanceTalentMarketWeek(advanceCareerLifecycleWeek(...))`, `src/core/tick.ts:1154`, read,
not modified) inside a single bare tick, with no dangling reference anywhere in the construction: under
the WRONG order this construction fails cleanly on the `outcome`/`closedWeek`/`reason` assertions
(`decisionWeekOf` finds a real row and returns a real, finite week — no crash either way), which is
exactly what an ordering claim needs to be falsifiable.

**Discrimination.** The control worktree used for the original (first-revision) scaffold run,
`/Users/zacheryspector/The-Movies-c2a-wiring-control` (detached at `0ee95a08`), no longer exists at
close of this revision (removed outside this task's own actions — this task only ever copied files
into it, never deleted it; most likely cleaned up as part of the parent's own verification pass). This
task therefore could not personally re-run the scaffold-side discrimination for the REBUILT case. What
IS verified directly: the full main-tree run (§4 below, includes this case, 13/13 pass) and the
construction itself, which — per the parent's own diagnostic above — no longer has a dangling
`contractId` for `decisionWeekOf` to crash on, so an order-swap mutation now has nothing to do but fail
the ordering assertions on their own terms. The parent's message states it will re-run the ordering
mutation itself against this rebuild; this task did not attempt to reproduce that mutation locally,
since doing so would require editing `src/core/tick.ts`, forbidden by this task's own contract even
temporarily-and-reverted.

## 2. Gap 2 — G4's four untested validator-refusal causes

`tests/p14c2a-save-and-settlement.test.ts`'s existing `G4` case is extended (not duplicated) with
four more mutations, each asserted against the exact wording read from
`src/core/save.ts:validateCareerLifecycleRoot` (a message-catalogue lookup, not derived behavior), and
each preceded by one shared control assertion that the unmutated `lawfulSave` validates
(`expect(() => validateSaveV34(lawfulSave)).not.toThrow()`), so every throw below is attributable to
its own mutation and not to something already broken in the shared fixture:

| cause | construction | assertion (message fragment) |
| --- | --- | --- |
| duplicate person record | the lawful record listed twice (`[root.records[0], root.records[0]]`) | `/more than one record/` |
| a contract active after the announcement, ending past E | a synthetic player contract added for the same subject (`authored-0000`, confirmed to carry none in this fixture), `startWeek: week-10, endWeekExclusive: week+600`, past the lawful record's `effectiveWeek: week+500` | `/past the effective week/` |
| status/week disagreement | still `announced` at or after its own `effectiveWeek` — built with `announcedWeek = week-100` (not `week`, so `E >= A+52` and `E <= tick` can BOTH hold without collapsing into the existing "E < A+52" mutation) | `/at or after its effective week/` |
| a Scientist record | a REAL Scientist from the same fixture (`person-studio-9ed55199-r01-supply-265-6`, confirmed `role === 'scientist'`), so every check ahead of the window test (person exists, profession matches role, age agrees) passes and only the Scientist-window check fires | `/Scientist record/` |

**Discrimination (not required for this gap by the task, run anyway as corroborating evidence):**

```
$ node_modules/.bin/vitest run tests/p14c2a-save-and-settlement.test.ts -t "G4:" --minWorkers=1 --maxWorkers=1
  (control worktree)
 × G4: the validator refuses each of nine distinct mutations... — 17ms
   → RED premise: validateSaveV34 must exist as a named export of src/core/save.ts: expected 'undefined' to be 'function'
 Tests  1 failed | 9 skipped (10)
```

## 3. Gap 3 — Amendment A1's exact-boundary case

`tests/p14c2a-consumers.test.ts`, new case in the `Amendment A1` describe block: an announced person
with `effectiveWeek` set to EXACTLY `week + TUNING.CONTRACT_MIN_WEEKS` stays in `hiringMarketIds` (a
catalogue term ending AT `E` is lawful); the SAME record read one week later
(`hiringMarketIds` called against a copy with `market.tick` advanced by one week only — nothing else
changed) is omitted, since `E - week` is now 51, under `CONTRACT_MIN_WEEKS`. `HIRING_MARKET_ROTATION_WEEKS`
is 13 (`src/core/tuning.ts:427`), so the base world's week 0 → week 1 step stays inside the same
sampling epoch (`marketEpoch(week) = floor(week/13)`), which is why the pre-filter candidate set is
otherwise unchanged between the two reads and the boundary isolates the amendment's own filter alone.

**Discrimination (not required, run anyway):**

```
$ node_modules/.bin/vitest run tests/p14c2a-consumers.test.ts -t "boundary: a catalogue term ending EXACTLY" --minWorkers=1 --maxWorkers=1
  (control worktree)
 × boundary: ... — 68ms
   → one week later: omitted: expected [ 't-dir-04', 't-dir-03', …(6) ] to not include 't-dir-04'
 Tests  1 failed | 16 skipped (17)
```

The scaffold's `hiringMarketIds` (pre-amendment) has no `CONTRACT_MIN_WEEKS` post-filter at all, so
the person never leaves the listing — a genuine behavioral-mismatch failure, the same class 778 §4
attributes 10 of its original 37 cases to.

## 4. Gap 4 — P1's rival-authored complement

778 §5 scoped this out: `authorRivalPromise` is not exported and only fires from inside
`advanceTalentMarketWeek`'s own rival-decision cadence, so building one from scratch (a fresh case,
a rival bid, a feasibility-dependent attachment) risked spending the whole allowance on plumbing
unrelated to the invariant itself. Investigated instead: does the existing T0 corpus already contain
one, produced naturally, that can be read rather than built?

**Attempted routes, in order:**
1. Scanned all six `C2_CORPUS` fixtures' `state.promises` for any entry with `issuerStudioId` not the
   player's. Found plenty (`promise-0..47` in most fixtures), but every one has `windowStartWeek: 0`-ish
   round genesis horizons (uniformly `dueWeekExclusive: 416` regardless of the fixture's own week, and
   a paired `null`/`BROKEN` pattern per beneficiary) — a WORLDGEN structural pattern, not one produced by
   `authorRivalPromise` reacting to a real market case.
2. Filtered instead for `windowStartWeek !== 0` (a promise whose window did not originate at world
   genesis). `genuine-v33-c2-hard-boundary-and-idle-window` (week 780) yields six:
   `promise-70..75`, issuer `studio-9ed55199-r05`, window `[728, 936)`, beneficiaries `t-wri-00`,
   `t-dir-00`, `t-act-00`, `t-act-01`, `t-act-02`, `t-cra-00` — matching rival studio r05's SCHEDULED
   ENTRY at week 728 (773 trap 1's fixed-208-week rival law; the same `r05` entry mechanic B5 already
   exercises in the OTHER seed). Each beneficiary's real, single active employment row was confirmed
   (`{studio: 'studio-9ed55199-r05', start: 728, end: 936}`, no player contract, no other row) —
   the SAME contract the promise's own window rides.
3. Used `promise-71` (beneficiary `t-dir-00`) as the natural-route rival-authored promise the task's
   own alternative clause allows ("the natural route"): a REAL promise, issued by a REAL rival studio,
   to a REAL, currently rival-employed beneficiary, never hand-authored.

**New case**, `tests/p14c2a-consumers.test.ts`, added to the existing `P1` describe block: derives
`effectiveWeek = max(week + 52, intervalEnd)` from facts fixed at the save week only (week 780, the
real materialized age, the real interval's own `endWeekExclusive` 936) — the exact technique 778 §3
already used for the player-issued P1 case — and asserts `promise.dueWeekExclusive (936) <=
record.effectiveWeek`. Here the interval's own end dominates (936 > 780+52=832), so the assertion
holds at EXACT equality (936 <= 936), a tighter check than the original P1 case's own margin.

**Discrimination:** run in the control worktree, this case PASSES — identically to the original P1
case's own disclosed status (778 §4, "the one pass — justified, not a gap"). It calls no unimplemented
export (`withSyntheticCareerLifecycle` and `syntheticRecord` are pure fixture helpers; the assertion
reads `state.careerLifecycle.records[0]` as a plain object, never through `retirementRecordFor` or any
other scaffold-throwing function). It proves the arithmetic invariant holds given 773 D5's own formula
and REAL data; it becomes a live regression check the moment a natural route exercises this same
promise end-to-end. Not a discrimination gap — the identical, already-accepted precedent.

```
$ node_modules/.bin/vitest run tests/p14c2a-consumers.test.ts -t "promise-71" --minWorkers=1 --maxWorkers=1
  (control worktree)
 ✓ 1 passed | 16 skipped (17)
```

## 5. Full runs, main tree — each changed file alone (re-run after the gap-1 rebuild)

| file | result | duration (wall) | test count |
| --- | --- | --- | --- |
| `tests/p14c2a-core-lifecycle.test.ts` | **13 passed / 13** | 14.99s | 12 original + 1 new (tick-wiring, rebuilt) |
| `tests/p14c2a-consumers.test.ts` | **17 passed / 17** | 20.87s | 15 original + 2 new (A1 boundary, P1 rival) |
| `tests/p14c2a-save-and-settlement.test.ts` | **10 passed / 10** | 14.02s | 10 (G4 extended in place, no new case) |

All three together (`vitest run` with all three paths, `--minWorkers=1 --maxWorkers=1`): **40 passed /
40**, 47.01s wall.

## 6. Final file identities

| file | sha256 | lines |
| --- | --- | --- |
| `tests/p14c2a-core-lifecycle.test.ts` | `5994ec18f06693c291d3a5d64cc168294ddb8ff40ef1d529afe79496e6950544` | 320 |
| `tests/p14c2a-consumers.test.ts` | `e5670d2eef293a6b0417e2655b58cd143de42aacd897e88e3d4025293b5785e2` | 406 |
| `tests/p14c2a-save-and-settlement.test.ts` | `8107320bf83b02224ad3b3b07ec32ff8d61379a9344b032441bb98ab0fee3877` | 293 |
| `tests/helpers/p14c2a-fixtures.ts` | `1beeaf9f1337d9aef8615d529eed6307be523ba98372c33d7ca5dd1286f0b80e` | 150 |

Only `tests/p14c2a-core-lifecycle.test.ts`'s identity changed from the first revision (the gap-1
rebuild); the other three files are unchanged since §6's first version and were re-run above only for
a fresh combined timing, not because their content moved.

## 7. Scope discipline

No file outside the five allowed paths (the four above plus this record) was written. `git status
--short` in the main tree at close shows exactly these four test-side paths as modified by this task
(confirmed by direct diff against this record's own edits), alongside a large and growing set of OTHER
modified test files belonging to the concurrent, separately-authorized V34-literal sweep task (that
list grew over the course of this task and is deliberately not enumerated here, since enumerating it
would go stale the moment the sweep task saves again) — none of those files was read beyond its
filename in `git status`, and none was touched. No `src/` file was read for anything beyond locating
the exact validator wording
(`save.ts:validateCareerLifecycleRoot`) and confirming `tick.ts`'s wiring line number, both cited
above; no production file was edited, and no `src/` mutation was attempted for local verification of
the parent's order-swap diagnostic — reproducing it would have required editing `src/core/tick.ts`,
outside this task's write authority even temporarily-and-reverted. The control worktree
`/Users/zacheryspector/The-Movies-c2a-wiring-control` was, while it existed, touched only by copying
the four files in and running the `vitest` invocations quoted above; nothing else there was read, run,
or committed. It no longer exists at close of this revision (§1 above).
