# 779: P14C.2a writer handback (sim-core, sole production writer)

Role: the sim-core contract (`.claude/agents/sim-core.md`) run through a general-purpose agent, because
project roles are not registered in this session (disclosed by the parent). No delegation, no installs,
no Git writes. I did not open `tests/p14c2a-*` or `tests/helpers/p14c2a-fixtures.ts`.

## 1. Result

**DONE**, subject to the test-side sweep (776 S9/S10 and the test root-strip lists), which the
test author owns. Every source typecheck is clean; every remaining type error and every focused-suite
failure sits in `tests/` and is an unswept version literal or a hand-built live state without the new
root (section 5).

Source identity: HEAD `947d8b5c9bc85d3dfa6345a832828325d2a9e43a` (the scaffold `9f523db8` plus two
parent commits that touch only `docs/`). Tested working diff: `git diff HEAD | shasum -a 256` =
`68af54de7d130f1631fabc684b05c41a3df7039bad406be278023366e7a499bd`, 20 files, +627/−90. Node v20.20.2.
`git status --porcelain generated/` is empty. Projection stays 50.

## 2. Changed paths

| path | change |
| --- | --- |
| `src/core/careerLifecycle.ts` | scaffold replaced: windows, root, predicates, refusals, the weekly step |
| `src/core/aging.ts` | `birthdaysDueAt` implemented |
| `src/core/types.ts` | `GameState = GameStateV34` |
| `src/core/tick.ts` | birthdays captured before `materializeAges`; lifecycle step between promises and market |
| `src/core/actions.ts` | cap on `signContract`/`renewContract`; seat-release cap in `applyGreenlight` |
| `src/core/employment.ts` | `signableUniverse`, free-agent loop, A1 post-filter, `assignableForFilm` |
| `src/core/talentMarket.ts` | eligibility rows, proposal refusal, invalidation, discovery skip, settlement re-check |
| `src/core/hollywoodTick.ts` | `staff()` renewal and hire skip capped people; `decide()` seats only seatable people |
| `src/core/hollywood.ts` | `enterRival` pick skips capped people |
| `src/core/worldgen.ts` | `generateWorld` opens `careerLifecycle: initialCareerLifecycle(0)` |
| `src/core/save.ts` | Save V34 machinery, 18 downgrade guards, 6 conversion arms, dispatch, `migrateToLive` |
| `src/core/index.ts` | V34 save surface, `migrateToLive`, `LiveSaveFile`, `RETIREMENT_RECENT_WORK_WEEKS` |
| `src/harness/roster-wall/historical-control.ts` | lift builds the empty root; hash strips it (records must be empty) |
| `src/harness/d16/run-d17b-continuation.ts`, `run-d17b-week86.ts` | `migrateToV33` to `migrateToLive` |
| `src/harness/p14/legacy-v28-fixtures.ts` | emitter union gains `LiveSaveFile` (it emits `makeSave` output) |
| `bridge/session.ts`, `bridge/runtime/campaign-library.ts` | `migrateToV33` to `migrateToLive` |
| `bridge/runtime-checkpoint.ts` | envelope is `LiveSaveFile`; the `!== 33` gate and its two messages read `LIVE_SAVE_VERSION` |
| `ui/src/engine/adapter.ts` | three `migrateToV33` live routes to `migrateToLive` (sweep lines only) |

## 3. Checklist, item by item

1. **Core (777 §2 to §4).** Pure, no RNG, no module state. `hollywood === null` returns the same
   object. Settlement runs before intent, in record order; intent reads only `birthdays`. Idle is 777 §4's
   text: no player contract and no P12 row active at any week of `[w − 104, w]` (active means
   `startWeek <= v < (endedWeek ?? endWeekExclusive)`), not in `busyTalentIds` at `w`, anchor week
   `<= w − 104`. `E = max(w + 52, every end in force at w)`, where "in force" covers the active player
   contract and every active P12 row (player mirror or rival). Writing `retired` first asserts that no
   player contract and no P12 row is active at `w` and throws otherwise. `birthdaysDueAt` returns the ids
   of every bucket with `week <= w`, bucket order then in-bucket order.
2. **Tick.** `birthdays = birthdaysDueAt(provenanced.talentProvenance, currentTick + 1)` sits on the
   line before `materializeAges`; the tail is
   `advanceTalentMarketWeek(advanceCareerLifecycleWeek(advancePromisesWeek(withBonds), birthdays))`.
3. **Consumers (777 §5).**
   - `applySignContract`: the cap runs after the offer is priced and before the founding branch, the
     hiring-market membership check and any charge (A1 rule 2). `applyRenewContract`: after the existing
     window and case checks, before the solvency gate. Messages keep `applyActions: <verb> rejected — …`
     and carry the token and the effective week.
   - `marketEligibility`: record status first; each lifecycle row returns `proposers: []`.
   - `submitProposal`: a person with a record is refused with the token BEFORE `requireOpenCase`. The
     announcement closes their case, so the old first check would have named the wrong cause.
   - `advanceTalentMarketWeek`: step 1 closes an open case whose subject holds a record with
     `announcedWeek >= openedWeek` (`outcome 'invalidated'`, case reason "the subject announced
     retirement", one `invalidated` receipt, proposals dropped by `closeCase`). Step 2 opens no case for
     anyone with a record.
   - Market commits: re-checked at the freeze in `survivesFreeze` with `contractEndRefusal(week +
     termWeeks)`; a refused proposal becomes the new freeze drop `retirementCap` and is never committed.
     Unreachable on the natural route, because the announcement invalidates the case earlier in the same
     pass.
   - `staff()`: the renewal loop skips `contractEndRefusal(week + 208) !== null`; the re-hire and the
     fresh-hire candidates skip the same predicate (trap 1). `enterRival`: same predicate on its pick.
   - Player greenlight: one loop in `applyGreenlight` over `staffing.engagedIds` (director, cast,
     craft), placed after the idle-exclusivity check and before slot acquisition, pricing and any write.
     `greenlight`, `greenlightScriptProject` and the queue's dequeue all commit through this function,
     so a queued greenlight meets the law at its own week. Rival `decide()`: `seatable(t)` =
     not busy and `assignmentRefusal(state, id, week) === null`, applied to the director, craft, promised
     cast and ordinary cast picks.
   - `signableUniverse` and the free-agent loop of `hiringMarketIds` (trap 2) drop finishing and retired
     people; `freelancerMarketIds` inherits the drop; `assignableForFilm` returns false for both.
     `state.talent` is never filtered or reordered anywhere (trap 5).
   - Writing verbs: no new refusal (773 §9 item 1).
4. **New worlds.** `generateWorld` opens the root at week 0. Typecheck found no other literal live-state
   constructor in `src/`, `bridge/` or `ui/`; `liftV18Control` builds it (item 5).
5. **Save V34.** `SaveFileV34`, `LiveSaveFile = SaveFileV34`, the union, the dispatch arm ("1 through 34"),
   `LIVE_SAVE_VERSION = 34`, `makeSave` through `validateSaveV34`. `validateCareerLifecycleRoot` makes
   every 777 §6 check with its own message. `validateSaveV34` validates its root, then hands V33 the
   stripped state. `convertV33ToV34` opens `initialCareerLifecycle(market.tick)`. `convertV34ToV33`
   refuses a non-empty root as a downgrade before envelope validation. `migrateToV34` and
   `migrateToLive` follow. Value sweep: 27 `saveVersion === 33` arms, 27 `=== 34` siblings
   (18 downgrade guards, 6 `migrateToVn(convertV34ToV33(…))` arms, `migrateToV32`, `migrateToV33`, the
   dispatch). 776 S7/S8/S11/S12 moved as listed in section 2. The one writer-owned root-strip list
   (`historical-control.ts`) grew by the root.
6. **Checks.** Section 4 and section 5.
7. **Probe.** Section 6.

### Amendment A1 (777 §7), both rules

1. `hiringMarketIds` computes its listing unchanged, then returns
   `out.filter((id) => contractEndRefusal(state, id, week + TUNING.CONTRACT_MIN_WEEKS) === null)`. The
   sampling pool is untouched. Measured: an announced free agent at `A` with `E = A + 52` stays listed at
   `A` (a 52-week term is lawful) and drops out afterwards.
2. The cap check precedes the hiring-market membership check and every charge in `applySignContract`, and
   every charge in `applyRenewContract`. Measured: a 104-week sign at `A` is refused with
   `retirementAnnounced (effective week 884)` and the state is byte-equal after the refusal.

### Delegated details I settled (none changes 773 or 777 behaviour)

- A state with no lifecycle root reads as "no record" in the predicates. The frozen V18 → V19
  conversion reaches `enterRival` through `initializeHollywood` with a state that predates the root (the
  C.1 rule: a root travels with the state). The weekly step instead THROWS for a state with an industry
  and no root, the market's own rule for its V28 root.
- Refusal sentences: `talent "<id>" is retirementAnnounced (effective week E) — <clause> (P14C.2a)`,
  `… is finishingCommitments — … (effective week E)`, `… is retiredFromProfession — retired at week R
  (effective week E)`.
- The `retirementCap` drop sentence has no digits, because the market validator refuses a dropped
  sentence with a three-digit number.
- `convertV34ToV33` on an empty root keeps every record (there are none) but does not carry
  `boundaryWeek`; a later re-upgrade opens the boundary at that save's tick. Measured: genuine V33 →
  live → V33 reproduces the original bytes.

## 4. Commands (all on the tested diff above)

| command | exit | runtime | result |
| --- | --- | --- | --- |
| `npm run typecheck` | 2 | 32 s | 158 error lines in 57 files, all under `tests/`; 0 in `src/`, `bridge/`, `ui/`, `scripts/`. The script stops at its first `tsc`, so I ran its second half alone: |
| `./node_modules/.bin/tsc -p ui/tsconfig.json --noEmit` | 0 | 55 s | clean |
| `npm run typecheck:bridge` | 2 | 29 s | 26 error lines, all in 10 `tests/bridge-*` files; 0 in source |
| `npm run check:bridge-contract` | 0 | 2 s | schema, C# DTOs and manifest verified unchanged |
| `npm run check:bridge-contract:fixtures` | 0 | 1 s | union fixtures verified unchanged |
| `git status --porcelain generated/` | 0 | <1 s | empty |

Type error kinds: TS2379 ×137 and TS2375 ×13 (a `GameStateV33` or hand-built state lacking
`careerLifecycle`), TS2322 ×6 (a `SaveFileV33` annotation receiving `makeSave`'s V34, or a hand-built
live state), and TS6133 ×2 (unused declarations in `tests/p14c2a-core-lifecycle.test.ts` and
`tests/p14c2a-scratch-probe.test.ts`, which I saw only as tsc output lines).

## 5. Focused suites, one file each, `--minWorkers=1 --maxWorkers=1`

| file | exit | runtime | result | classification |
| --- | --- | --- | --- | --- |
| `tests/p14c1-materialized-aging.test.ts` | 1 | 12 s | 18 failed, 28 passed | all (a) |
| `tests/save.test.ts` | 1 | 5 s | 7 failed, 3 passed | all (a) |
| `tests/p14a1-eligibility.test.ts` | 0 | 6 s | 5 passed | n/a |
| `tests/p14a1-case.test.ts` | 0 | 10 s | 6 passed | n/a |
| `tests/p14a1-settlement.test.ts` | 0 | 7 s | 3 passed | n/a |
| `tests/bridge-runtime-checkpoint.test.ts` | 1 | 100 s | 44 failed, 21 passed | all (a) |

(a) = an unswept test-side version literal or root; (b) = a behaviour change or defect. No failure is (b).

- Aging, 18: 16 throw `careerLifecycle: the Save V34 lifecycle root is missing` and one wraps the same
  throw in `not.toThrow`. The suite ticks the output of `convertV32ToV33` (a V33 state) through
  `tickN` at `:129` and siblings; that state needs `convertV33ToV34` or `migrateToLive` first. The last one
  is `expect(LIVE_SAVE_VERSION).toBe(33)`.
- Save, 7: six hand-built live states (`makeState`, `:138` onward) lack `careerLifecycle`, so
  `validateSaveV34` refuses them. The seventh, at `:434`, expects version 34 to be unknown ("1 through 33
  only"); 34 is now the live version.
- Checkpoint, 44: 43 are `saveVersion` `toBe(33)` (for example `:232`, `:269`, `:331`); one expects
  `/canonical V33 save bytes exactly/`, and the message now names V34 from `LIVE_SAVE_VERSION`.

## 6. The genuine V33 corpus, migrated and ticked (throwaway probes in the session scratchpad, not committed)

### Required: `genuine-v33-c2-hard-boundary-and-idle-window` (week 780 to 900)

`migrateToLive` opens `{"boundaryWeek":780,"records":[]}`. At 900 the state holds 20 records and saves
as a valid V34 (validated every 60 weeks). **16 of 16 predictions agree** on announced week, cause,
effective week and age:

| subject | predicted = implemented |
| --- | --- |
| authored-0000/0001/0002/0003 (actor, director, writer, craft) | 832, hardBoundary, E 884, age 86 |
| t-dir-08 | 781, idleInWindow, E 833, age 67 |
| t-act-09, t-act-14 | 796, idleInWindow, E 848, ages 67 and 62 |
| t-act-07 | 798, idleInWindow, E 850, age 61 |
| t-wri-08 | 800, idleInWindow, E 852, age 72 |
| t-cra-09 | 807, idleInWindow, E 859, age 64 |
| person-studio-9ed55199-r01-4 | 809, idleInWindow, E 861, age 67 |
| t-act-22 | 820, idleInWindow, E 872, age 64 |
| person-studio-9ed55199-r01-1 | 825, idleInWindow, E 877, age 66 |
| t-act-20 | 826, idleInWindow, E 878, age 64 |
| person-studio-9ed55199-r01-0 | 830, idleInWindow, E 882, age 68 |
| person-studio-9ed55199-r02-0 | 831, idleInWindow, E 883, age 73 |

Every predicted subject retired at its effective week (none was seated), keeps its talent row, and
appears in neither market; none is assignable. Four records the fixture did not predict: t-act-21
(surveyed at 70, hardBoundary at 71 on week 808), and t-act-15, t-act-25 and t-act-06, who each reached
60 idle after the save week (weeks 828, 852 and 893).

### The other five fixtures (extra, run to find defects)

All five migrate, tick and save as V34 with no throw from the retirement assertion.

| fixture | subject | predicted | implemented | cause of the difference |
| --- | --- | --- | --- | --- |
| contract-and-case | authored-0000 | 260/hard/312 | 260/hard/312 | agrees |
| contract-and-case | authored-0001 | 156/idle/208 | 208/idle/260 | prediction error: the open case settled at 52 into a new player contract `[52,104)`, active inside `[52,156]`, so 156 is not idle; 208 is |
| rival-in-window | t-dir-00 | 1139/hard/1196 | 1139/hard/1196 | agrees; retired at 1196 when the rival interval expired with its receipt |
| rival-in-window | t-act-00 | 1225/hard/1277 | 1225/hard/1404 | prediction error: rival r06 re-hired the actor at 1196 for 208 weeks, so `E = max(1277, 1404)` (D5) |
| rival-in-window | t-act-02 | 1211/idle/1263 | no record by 1319 | prediction error: the same 1196 re-hire is active at 1211 |
| rival-in-window | t-wri-00 | 1237/idle/1289 | no record by 1319 | prediction error: the same 1196 re-hire is active at 1237 |
| seated | authored-0000 | 312/idle/364 | 364/hard/416 | prediction method: the director holds the seat on prod-0000 (stuck at 5 ticks remaining from week 8 onward); busy at 312 means not idle under D3. The minter never tested the seat. At 416 the record enters `finishing_commitments`, and a sign attempt is refused with `finishingCommitments` |

Every difference is a prediction error; none is an implementation defect. Each prediction carries the
assumption that it reads only rows fixed at the save week.

### Finding for the parent: 777 §4 and the T0 minter disagree about IDLE

777 §4 says IDLE is "pinned exactly as the T0 predictions (775) computed it", then states a rule. The
minter (`775-mint-v33-c2-corpus-minter.test.ts:141-145`) computes something narrower: rival employment
only AT the birthday (`rivalEmployment(state, id, week)`), player contracts over the window, and no seat
test. I implemented the stated rule (P12 rows over `[w − 104, w]`, plus the seat), which also matches
773 D3's seat clause. Measured divergence at real in-window birthdays: 0 of 65 (rival fixture to 1400),
0 of 28 (idle fixture to 1100), 5 of 83 (a fresh `p13aGeneratedStudio` world to 1600, each a P12 row
inside the window but not at the birthday), 3 of 14 (seated fixture, all seat-held). A re-evaluation of
the stated rule at every checked birthday matched the implementation in every case. Switching to the
minter's reading is a two-line change in `idle()`; it needs a ruling, not a writer's choice.

### Consumer behaviour, measured on genuine worlds (my probes, not the RED)

- C1/B1/B2/B3 (idle fixture; authored-0000 signed at 780 for 52 weeks): a case opens at 820; the player
  proposes at 821; at 832 the actor announces (E 884), and the same pass closes the case `invalidated`
  with reason "the subject announced retirement", drops the proposal, and saves as valid V34. Eligibility
  reads `retirement_announced` with no proposer. A 104-week sign is refused with the state byte-equal;
  a 52-week sign ending exactly at 884 succeeds. A proposal is refused with the token. A renewal at 874
  is refused. At 884 the contract expires through P10 with its P12 `expiry` receipt and the record
  retires at 884.
- D1 (same world; authored-0001 announced at 832, E 884): a player greenlight seating them succeeds at
  875 (875 + 9 = 884) and is refused at 876, with the token and the state byte-equal.
- G5: tick to 840, save, reload, continue both runs to 890: `exportSave` byte-equal. A6: the step applied
  twice is equal, and `rngState` is unmoved. A7: `hollywood: null` returns the same object.
- G4: one mutation per refusal on a week-870 save; each is refused with its own message (extra root key,
  boundary after tick, extra record key, announced before boundary, age disagreement, `E < A + 52`,
  unknown person, duplicate person, profession mismatch, wrong cause, three status/week mismatches, out
  of order, a contract past E). G3: `convertV34ToV33`, `migrateToV33`, `migrateToV32`, `migrateToV26`
  refuse a save holding records as a downgrade; `migrateToV20` refuses at its guard.

## 7. Requirement map (773 §6) as implemented

| id | status | where |
| --- | --- | --- |
| A1 A2 A3 A4 A5 A6 A7 | implemented; A1, A3, A4, A5, A6, A7 measured above | `careerLifecycle.ts`, `tick.ts`, `aging.ts` |
| B1 B2 B3 | implemented, measured | `actions.ts`, `talentMarket.ts` |
| B4 B5 | implemented (cap-based skip, 777 §5); B4 measured: r06 neither renewed nor re-hired t-dir-00, whose interval expired at 1196 with its `expiry` receipt | `hollywoodTick.ts`, `hollywood.ts` |
| C1 C2 C3 | implemented; C1 and C2 measured (C2: t-dir-00's r06 interval entered its renewal window at 1184, after the 1139 announcement, and no case opened) | `talentMarket.ts` |
| D1 | implemented, measured | `actions.ts` |
| D2 | implemented, not isolated by a probe | `hollywoodTick.ts` `decide()` |
| E1 E2 E3 | implemented, measured (E2 on the seated fixture) | `careerLifecycle.ts`, `employment.ts` |
| F1 | implemented, measured (t-dir-00) | same law, no rival branch |
| G1 G2 G3 G4 G5 | implemented, measured (G2 on all six fixtures) | `save.ts` |
| W1 | no new code (773 §9 item 1): the existing `requireCommissionableWriter` gate plus `busyTalentIds` | n/a |
| P1 | holds by construction (D7 plus D8); not measured | n/a |

The independent RED decides GREEN. I have not run it.

## 8. Open risks

1. **Promise reach (773 trap 7, D15).** `decide()` now skips a promised employee whose seat cannot release
   before E, and the player greenlight refuses one. A promise that needed those weeks breaks under
   ordinary law. I did not measure where this occurs; C.2c owns it.
2. **Feasibility replay does not know the seat cap.** `promiseCapacityOwnerReplay.ts` replays player
   admission (`resolveGreenlightStaffing`, `assertGreenlightStaffingIdle`) without `assignmentRefusal`, so
   a feasibility receipt can count a seat the real greenlight refuses. This is C.2c's retirement-boundary
   input (direction 6); I left `promises.ts` and the replay untouched as ordered.
3. **Pool depletion without replenishment.** A fresh `p13aGeneratedStudio` world of 84 people holds 66
   records by week 1600: 63 retired, 3 announced, every one `idleInWindow`. Replenishment is C.4. Long-run
   tests in the matched pass will move wherever they depend on who is available.
4. **B5 wording versus 777 §5.** 773 B5 says `enterRival` skips announced people; 777 §5 pins the skip to
   `contractEndRefusal(week + 208)`. An announced free agent whose E is 208 or more weeks away (possible
   only after an early release from a long contract) is lawfully pickable under 777. I implemented 777.
5. **Ticking a V33 state now throws** when it has an industry. That is deliberate (fail loud, the market's
   V28 precedent), and it produces most of the focused-suite failures until the test sweep.
6. **Bridge read models change content, not shape.** Listings built on `hiringMarketIds`,
   `freelancerMarketIds`, `assignableForFilm` and `marketEligibility` drop finishing and retired people,
   and announced people without a lawful 52-week term. The wire schema is unchanged; C.2-RM discloses it.
7. **Performance not benchmarked against the base.** Measured: 120 weeks on the week-780 world in 1.9 s;
   1600 weeks of a fresh world in 10.6 s including a save validation every 200 weeks. The V34 validator
   indexes bindings once per call, so it stays linear in the world.

## 9. Next action

The test author sweeps `tests/` (776 S9/S10, `tests/_historicalCurrent.ts`, the test root-strip lists),
then the parent runs the independent RED and the focused suites on this tested diff, rules on the IDLE
finding in section 6, and runs the matched full pass.
