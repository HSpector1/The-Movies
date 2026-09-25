# 778 — P14C.2a T1: independent RED (test-author)

Task: P14C.2a T1, controlling order OPUS-C2-TO-CODEX-LAUNCH. Base commit
`9f523db8e6bc43f78aea2c2f913aad80433466b0` on `wip/headless-program-20260916-ts`. Scaffold read directly
at that commit before any write: `src/core/careerLifecycle.ts` throws `not implemented` on every export;
`aging.ts:birthdaysDueAt` throws the same; `src/core/save.ts` had zero occurrences of `validateSaveV34`,
`convertV33ToV34`, `convertV34ToV33`, `migrateToV34`, `migrateToLive`, and `LIVE_SAVE_VERSION` read `33`.
C.2b (one-year extension) and C.2c (retirement × promise VOIDED/WAIVED) are OUT OF SCOPE: no case in this
suite asserts `VOIDED`, `WAIVED`, or an extension offer.

**Status: DONE**, with one process incident (below) resolved per the parent's own instruction, and a
handful of disclosed scope limits (G4 partial mutation coverage, P1 restricted to one issuer).

## 0. The concurrency incident — read this before the run tables

The sole production writer was implementing in the SAME worktree while this task ran. `git status
--short` (filenames only — no diff was ever read) showed `src/core/{careerLifecycle,aging,save,types,
tick,employment,talentMarket,hollywood,hollywoodTick,actions,index,worldgen}.ts` and several `bridge/`
files modified and uncommitted, mid-session. Before that was visible, three standalone runs of the three
test files were executed in the main tree (`/Users/zacheryspector/The-Movies-headless-program`) — the
first surfaced two real bugs in MY OWN test logic (A2c's boundary used a person whose real age at the
probed weeks was never in-window at all; A5 conflated "no second announcement record" with "no field
ever changes," when settlement legitimately advances `status` at `E`), both fixed by re-reading 773/777,
never by reading the writer's diff. Later runs in the main tree, after the implementation was known to be
present, were used ONLY to catch mechanical bugs in this suite (wrong candidate lookup, an unlawful
synthetic record, a missing action-payload field, an ordinal that pointed at a stale employment row) —
never to retune an assertion's expected VALUE toward whatever the implementation produced. Three cases
were found this way to be non-discriminating counterfeits and were redesigned (§3).

Per the parent's follow-up instruction, the authoritative RED evidence below was produced in the
separate detached scaffold worktree the parent created at `/Users/zacheryspector/The-Movies-c2a-red-scaffold`,
HEAD `947d8b5c9bc85d3dfa6345a832828325d2a9e43a` (`node_modules` symlinked to the main tree). Confirmed
scaffold state there before running: `careerLifecycle.ts` and `aging.ts:birthdaysDueAt` still throw;
`save.ts` still has zero of the five V34 exports; `LIVE_SAVE_VERSION` still `33`. The four files below are
byte-identical between the two trees (verified by `diff -q` immediately before the runs in §4 and again
just now); the main tree remains the authoritative copy per the task's file ownership.

## 1. Files, sha256, line counts (main tree = authoritative; scaffold copies are byte-identical)

| file | sha256 | lines |
| --- | --- | --- |
| `tests/p14c2a-core-lifecycle.test.ts` | `4abd467d15b02ee77b4a0c3d1fb05473831c8d93c10d1b875a24c30f931f291c` | 244 |
| `tests/p14c2a-consumers.test.ts` | `372ae7411682256441abe9462084541b8da4edef2efbc083a010a73792a428fc` | 359 |
| `tests/p14c2a-save-and-settlement.test.ts` | `e98dfa3959781aeacf4231ce819fbd5d4e74a0066c70f5f51d337d5d2b0154bf` | 239 |
| `tests/helpers/p14c2a-fixtures.ts` | `4e569ce2ca72d84a8a7a1cfadfacef600e2a6640d728c67feb91c43906513b34` | 153 |

No existing test, helper, fixture or production file was edited by this task. `git status --short` at
close shows other modified/untracked paths (`src/`, `bridge/`, `777-c2a-api-contract.md`,
`tests/_historicalCurrent.ts`, `tests/contracts/_v14Contract.ts`, `tests/facility-move-demolish.test.ts`,
`tests/p13b-r07-save-v25.test.ts`, `tests/p14b5-relationships.test.ts`, `tests/property-state-v13.test.ts`,
`779-c2a-writer-handback.md`) — these belong to the production writer's implementation and the SEPARATE
test-side V34 sweep task the parent named as out of scope here (776's ENUMERATED ROOT-STRIP LISTS); none
of them was read beyond its filename, and none was touched by this task. This task's own writes are
exactly the four new paths in the table above plus this evidence file.

## 2. 773 §6 requirement map → case

| id | file | case name(s) |
| --- | --- | --- |
| A1 | core-lifecycle | `A1` |
| A2 | core-lifecycle | `A2a`, `A2b`, `A2c SYNTHETIC` (w−104 recency-horizon boundary) |
| A3 | core-lifecycle | `A3a SYNTHETIC` (rival interval dominates), `A3b SYNTHETIC` (player contract does not shorten) |
| A4 | core-lifecycle | `A4` |
| A5 | core-lifecycle | `A5` |
| A6 | core-lifecycle | `A6a`, `A6b` |
| A7 | core-lifecycle | `A7`, `A7b` |
| B1 | consumers | `B1` |
| B2 | consumers | `B2` |
| B3 | consumers | `B3` |
| B4 | consumers | `B4a` (fresh-hire re-hire after natural expiry), `B4b` (fresh-hire into a vacated seat) |
| B5 | consumers | `B5` |
| C1 | consumers | `C1` |
| C2 | consumers | `C2` |
| C3 | consumers | `C3` |
| D1 | consumers | `D1` |
| D2 | consumers | `D2` |
| E1 | save-and-settlement | `E1` |
| E2 | save-and-settlement | `E2` |
| E3 | save-and-settlement | `E3` |
| F1 | save-and-settlement | `F1` |
| G1 | save-and-settlement | `G1` |
| G2 | save-and-settlement | `G2` |
| G3 | save-and-settlement | `G3` |
| G4 | save-and-settlement | `G4` (5 of ~8 listed mutation causes — see §5) |
| G5 | save-and-settlement | `G5` |
| W1 | consumers | 2 cases (refused uncontracted; allowed announced-but-contracted) |
| P1 | consumers | `P1` (player-authored issuer only — see §5) |
| Amendment A1 (777 §7) | consumers | `hiringMarketIds` omission case; the token-priority half is B1/B2 (`.toThrow(/retirementAnnounced/)`, not the generic D-11.14 message) |

37 cases total (12 + 15 + 10 across the three files).

## 3. Three cases redesigned mid-task (non-discriminating counterfeits found by probing the scaffold, not the writer's diff)

- **B4 (staff() renewal loop) → B4a redesigned.** Original design attached the retirement record to r01's
  incumbent director and ticked through the 196–207 renewal window. MEASURED against the scaffold (no
  retirement record at all): the pre-existing, unrelated P14A.1 case-aware admission
  (`caseOpenForTalent` inside `staff()`'s own renewal loop, `hollywoodTick.ts`) already blocks that
  specific renewal from week 197 on, and at week 196 itself no renewal fired either — the case opens
  the same week the window does. The original case would have "passed" against the scaffold for a reason
  having nothing to do with retirement — a counterfeit. Redesigned as B4a: the contract is shortened so
  it expires NATURALLY in a few ticks, and the assertion checks the FRESH-HIRE re-entry into that now-open
  seat (trap 1's actual named site: `person ??= next.find(...)`) — MEASURED reachable (the scaffold
  re-hires the same person via the `expired` lookback, reason `'replacement'`, a fresh 208-week term).
- **B4b, same trap-1 site, different construction.** Original vacated a seat by setting `endedWeek` on
  the incumbent's row without removing them from `talent`. MEASURED against the scaffold: `staff()`'s
  `expired` lookback re-hires that SAME former occupant (matched by id) before the `next.find(role,
  !unavailable)` fallback this case exists to isolate is ever reached — so the synthetic candidate was
  never a candidate. Fixed by also removing the former occupant from `talent`, forcing the fallback path.
- **A3a, F1 (777 amendment A2, parent ruling).** Both originally drove `genuine-v33-c2-rival-in-window`'s
  own T0 paper prediction forward via real multi-week ticking (t-dir-00, predicted announce 1139 / E
  1196). The parent's ruling: that predictor checked P12 employment only at the birthday and only knew
  contracts fixed at the save week, and named this exact fixture's projection (a rival re-hire could
  change the contract in force before the predicted week) as a KNOWN prediction error. Both cases were
  rebuilt: A3a is now fully SYNTHETIC (a fresh candidate, a hand-built rival employment interval, zero
  natural ticking — isolates D5's "rival interval dominates" branch on facts nobody predicted); F1 keeps
  `t-dir-00` and the real rival/hollywood shape but shortens the interval end directly (the same technique
  as B4a/B4b/D2) so only a 10-week horizon is needed, eliminating the class of risk entirely rather than
  re-verifying it empirically.
- **P1 (777 amendment A2).** Original used `genuine-v33-c2-contract-and-case` personB's predicted week
  156 / age 68 / cause `idleInWindow` — the parent's OTHER named known error (the open case at week 48
  could settle into a new contract, so personB is not necessarily idle at 156). Rebuilt to derive E from
  facts fixed at the save week only: announce AT week 48 (not a projected future week), age read directly
  off `state.talent` at week 48 (not projected), `effectiveWeek = max(48+52, the REAL original contract's
  own endWeekExclusive)` — 773 D5 applied to data already committed, nothing assumed about the future.

**Recorded prediction errors, per the parent's ruling — not asserted anywhere in this suite:**
`genuine-v33-c2-contract-and-case` personB (predicted week 156, `idleInWindow`, E 208);
`genuine-v33-c2-rival-in-window` every entry (t-dir-00 1139/E1196, t-act-00 1225, t-act-02 1211, t-wri-00
1237 — a rival re-hire could change any of these); `genuine-v33-c2-seated` (predicted week 312,
`idleInWindow` — the seat clause was never checked). A1/A2/A5/A6/A7 rely only on the four PLAYER-authored
hard-boundary predictions the parent named safe (announce 832, age 86, `hardBoundary`, E 884) or on
natural genesis free agents with no case/contract/seat entanglement (A2a's `t-act-07`, an 18-week horizon,
judged low-risk and not on the parent's flagged list). E2 already used the fixture's REAL contract end
(208) rather than the flawed week-312 projection, so it needed no change.

## 4. RED runs — authoritative, scaffold worktree (`/Users/zacheryspector/The-Movies-c2a-red-scaffold`, HEAD `947d8b5c`)

Each file run alone: `node_modules/.bin/vitest run tests/<file> --minWorkers=1 --maxWorkers=1`.

| file | result | duration | exit |
| --- | --- | --- | --- |
| `tests/p14c2a-core-lifecycle.test.ts` | **12 failed / 12** | 3.84s (transform+collect+test) | 1 |
| `tests/p14c2a-consumers.test.ts` | **14 failed / 15** (1 pass, justified — see below) | 20.58s | 1 |
| `tests/p14c2a-save-and-settlement.test.ts` | **10 failed / 10** | 3.39s | 1 |

**Failure attribution — zero caused by syntax errors, wrong import paths, or test bugs:**

| cause | count | files |
| --- | --- | --- |
| `aging.birthdaysDueAt: not implemented` (scaffold throw) | 12 | core-lifecycle (8), consumers (0), save-and-settlement (3) |
| `careerLifecycle.<fn>: not implemented` (scaffold throw: `advanceCareerLifecycleWeek`×3, `retirementWindow`×1, `lifecycleStatus`×3) | 7 | core-lifecycle (4), consumers (2), save-and-settlement (1) |
| behavioral mismatch (consumer does not yet consult the predicate; real, clean assertion failures) | 10 | consumers: B1, B2, B3, C1, C2, C3, D1, B4a, B4b, B5, D2, Amendment-A1 (12 total behavioral — see below) |
| RED-premise guard (`typeof X === 'function'`, missing V34 save export) | 5 | save-and-settlement: G1, G2, G3, G4, G5's guard |
| direct constant mismatch (`LIVE_SAVE_VERSION` 33 ≠ 34) | 1 | save-and-settlement (final case) |

(Behavioral-mismatch count: B1, B2, B3, C1, C2, C3, D1, B4a, B4b, B5, D2, Amendment-A1 = 12, matching the
consumers file's 14 failures minus the 2 `lifecycleStatus`-throw W1 cases.)

**The one pass — justified, not a gap.** `P1` passes against the scaffold because it is a pure arithmetic
premise: it hand-builds a `RetirementRecord` from 773 D5's own formula applied to data already fixed in
the fixture (the real promise's `dueWeekExclusive`, the real original contract's `endWeekExclusive`) and
checks `dueWeekExclusive <= effectiveWeek` — it calls no unimplemented export. It proves the INVARIANT is
arithmetically sound given the requirement's own formula; it will become a live regression check the
moment `advanceCareerLifecycleWeek` computes `effectiveWeek` for real and this same fixture is re-checked
end to end (which G-series and the natural A-series cases already do for other subjects).

## 5. Disclosed scope limits

- **G4** pins 5 of the ~8 refusal causes 773 lists (`before boundary`, `age disagreeing`, `E < A+52`,
  `unknown person`, `wrong cause`) — NOT pinned: `duplicate person`, `a contract past E`,
  `status/week disagreement`, `a Scientist record`. Each is a straightforward extra `mutate()` variant on
  the established pattern; left for the next pass under this task's time allowance.
- **P1** covers one player-authored promise (`genuine-v33-c2-contract-and-case` promise-0). A
  rival-authored complement was scoped out: `attachPromise` requires an existing proposal, and building
  one cleanly (without either riding the same flawed T0 projection or spending a large share of the
  remaining allowance constructing a fresh case/proposal by hand) was judged not worth the cost against
  773 amendment 4's own reasoning, which already establishes rival promises ride the identical
  `attachPromise`/window-inside-contract invariant.
- **`stepWeekWithLifecycle`** (the shared helper driving the A-series and E1/E2/F1) runs the lifecycle step
  immediately AFTER each real `tick()`, since `tick()` itself does not call it yet. This places it one step
  after `advanceTalentMarketWeek` rather than before, as 777 §4 specifies for the real wiring. Disclosed in
  the helper's own doc comment. It does not affect intent/settlement law (what A1–A7, E1–E3, F1 check);
  same-week market interaction (C1/C2) is instead tested by calling `advanceTalentMarketWeek` directly on
  a state that already carries the record at the right week, sidestepping the ordering gap rather than
  tripping over it.

## 6. Ambiguities — none rose to "two readings, two assertions"

Two integration-order questions came up (the market-order gap above; whether "renewal loop" in D7/B4's
row text is reachable at all given the pre-existing P14A.1 case-aware admission) but both resolved by
MEASURING the scaffold directly rather than by picking between two textual readings — recorded above as
scope limits and a redesign, not as an open question for the parent.

## 7. Next action for the parent

- Treat §4's scaffold-worktree run as the authoritative RED evidence; the main-tree runs described in §0
  were diagnostic only (catching this suite's own bugs), never a substitute.
- The parent's own note says it removes the scaffold worktree; this task did not and will not.
- G4's remaining four mutation causes and P1's rival-authored complement are the two known, bounded gaps
  if a follow-up pass is wanted before the writer's implementation is reviewed against this suite.
- Once the writer's (currently uncommitted) implementation is committed, re-run all three files — this
  time expecting GREEN — as the acceptance check 773 §2 names ("the requirement map in §6 is GREEN on an
  independently written RED").
