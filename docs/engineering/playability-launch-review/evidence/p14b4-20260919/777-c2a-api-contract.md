# 777 — P14C.2a API contract (both specialists work from this; amended only by a later record)

Pins the surface the independent RED is written against and the sole writer implements. Derived from
773 (decisions D1–D16) as amended by its bounded review. Behaviour is 773's; this record fixes names,
shapes, reasons and placement so the RED can fail on missing BEHAVIOUR, not on a missing export. The
parent ships `src/core/careerLifecycle.ts` as a SCAFFOLD whose every exported function throws
`not implemented (P14C.2a)`, plus the types, at a commit AFTER the T0 corpus is minted (C.1's 762 move).

## 1. Types (`src/core/types.ts`)

```ts
export type RetirementCause = 'hardBoundary' | 'idleInWindow'
export type RetirementStatus = 'announced' | 'finishing_commitments' | 'retired'
export type RetirementRecord = {
  personId: string
  profession: CreativeRole
  intentRulesVersion: 1
  cause: RetirementCause
  announcedWeek: number
  ageAtAnnouncement: number
  effectiveWeek: number
  status: RetirementStatus
  finishingFromWeek: number | null
  retiredWeek: number | null
}
export type CareerLifecycleRoot = { boundaryWeek: number; records: readonly RetirementRecord[] }
export type GameStateV34 = GameStateV33 & { careerLifecycle: CareerLifecycleRoot }
export type GameState = GameStateV34
```

## 2. Module surface (`src/core/careerLifecycle.ts`, pure, no RNG, no module state)

| export | contract |
| --- | --- |
| `LIFECYCLE_INTENT_RULES_VERSION = 1` | stamped on every record |
| `RETIREMENT_RECENT_WORK_WEEKS = 104` | D3 recency horizon (PROVISIONAL TUNING; lives in `TUNING` as `RETIREMENT_RECENT_WORK_WEEKS`) |
| `retirementWindow(role)` | `{start, hard}` from `TUNING.RETIREMENT_WINDOWS`; `null` for `scientist` |
| `initialCareerLifecycle(week)` | `{boundaryWeek: week, records: []}` |
| `retirementRecordFor(state, personId)` | the record or `undefined` |
| `lifecycleStatus(state, personId)` | `'active' \| 'announced' \| 'finishing_commitments' \| 'retired'` |
| `contractEndRefusal(state, personId, endWeekExclusive)` | `null` when lawful; else a reason string (§3) |
| `assignmentRefusal(state, personId, week)` | `null` when lawful; else a reason (§3). Announced: refuses iff `week + TUNING.PRODUCTION_TICKS + 1 > effectiveWeek`. Finishing or retired: always |
| `advanceCareerLifecycleWeek(state, birthdays)` | the weekly step (§4). `birthdays` = ids whose age materialized this advance, in due-bucket order |

`src/core/aging.ts` gains `birthdaysDueAt(root, week): string[]` — every id in a `due` bucket with
`bucket.week <= week`, bucket order then in-bucket order. Pure; it reads, never rebuilds.

## 3. Refusal reasons (tests match these tokens, not whole sentences)

| token | when |
| --- | --- |
| `retirementAnnounced` | an announced person meets a contract ending after `effectiveWeek`, or an assignment releasing after it |
| `finishingCommitments` | any new contract, proposal, case or assignment for a finishing person |
| `retiredFromProfession` | any of those for a retired person |

Command refusals keep the existing `applyActions: <verb> rejected — …` form and include the token and the
effective week. Refusal never mutates: the returned/thrown path leaves the input state byte-equal.

A case closed by an announcement: `outcome 'invalidated'`, case `reason` containing `announced retirement`,
one `invalidated` market receipt; the case's proposals are dropped by `closeCase` as today.

## 4. The weekly step, placement and order

In `tick()`: `const birthdays = birthdaysDueAt(provenanced.talentProvenance, currentTick + 1)` BEFORE
`materializeAges`. Then the tail becomes
`advanceTalentMarketWeek(advanceCareerLifecycleWeek(advancePromisesWeek(withBonds), birthdays))`.

`advanceCareerLifecycleWeek` on week `w = state.market.tick`:
1. If `state.hollywood === null`: return `state` unchanged (D6).
2. Settlement first, in record order: `announced` with `effectiveWeek <= w` → busy (`busyTalentIds`) ?
   `finishing_commitments` (`finishingFromWeek = effectiveWeek`) : `retired` (`retiredWeek = w`).
   `finishing_commitments` and not busy → `retired` (`retiredWeek = w`). Before writing `retired`, assert
   no player contract and no P12 interval of the person is active at `w`; throw if one is (fail loud).
3. Intent, in `birthdays` order: skip people with a record, and people whose window is `null`. Age =
   the materialized `Talent.age`. `age >= hard` → announce `hardBoundary`; `start <= age < hard` and idle
   (773 D3) → announce `idleInWindow`. IDLE is pinned exactly as the T0 predictions (775) computed it: no P12 interval and no player contract of the person is ACTIVE at any week `v` with `w − 104 <= v <= w` (an interval is active at `v` iff `terms.startWeek <= v < (endedWeek ?? terms.endWeekExclusive)`), `busyTalentIds` does not hold the person at `w`, and `anchorOf(row).week <= w − 104`. `effectiveWeek = max(w + 52, end of the player contract or P12
   interval in force at w)`. Append in `birthdays` order.

## 5. Consumers (each consults the predicate; none reimplements it)

| site | change |
| --- | --- |
| `applySignContract`, `applyRenewContract` | `contractEndRefusal` on the offer's `endWeekExclusive`, before any charge |
| `submitProposal` / `marketEligibility` | announced → `retirement_announced`, finishing → `finishing_commitments`, retired → `retired_or_ineligible`; all `proposers: []` |
| `advanceTalentMarketWeek` | step 1 also invalidates open cases whose subject holds a record with `announcedWeek >= openedWeek`; step 2 discovery skips anyone with a record |
| market commits (`commitPlayerWinner`, `commitRivalWinner`) | `contractEndRefusal` re-checked at settlement; a refused winner is dropped, never committed |
| `staff()` renewal loop and fresh hire; `enterRival` pick | skip a person when `contractEndRefusal(… week + term)` is non-null |
| player greenlight paths and rival `decide()` | `assignmentRefusal` for every seated id (director, cast, craft) |
| `signableUniverse`, `hiringMarketIds` free-agent loop, `freelancerMarketIds`, `assignableForFilm` | exclude `finishing_commitments` and `retired` |

## 6. Save V34

`validateSaveV34` validates `careerLifecycle` (exact keys; `boundaryWeek <= tick`; each record's exact
keys; person exists; `profession === Talent.role`; at most one record per person; records non-decreasing
by `announcedWeek`; `boundaryWeek <= announcedWeek <= tick`; `ageAtAnnouncement === ageAt(row,
announcedWeek)`; cause agrees with the window; no Scientist record; `effectiveWeek >= announcedWeek + 52`;
status/weeks agree: `announced ⇒ tick < effectiveWeek`, `finishing ⇒ finishingFromWeek === effectiveWeek
<= tick`, `retired ⇒ effectiveWeek <= retiredWeek <= tick`; no contract or interval of the person active
at a week `>= announcedWeek` ends after `effectiveWeek`), then hands V33 the stripped state.
`convertV33ToV34` opens `initialCareerLifecycle(market.tick)`. `convertV34ToV33` is lossless iff
`records` is empty; otherwise refused as a downgrade BEFORE envelope validation. `migrateToLive` (776).

## 7. Amendment A1 (parent, 2026-09-25 18:25, sent to both specialists mid-flight)

`hiringMarketIds` is the player's signability gate (`applySignContract` refuses anyone not in it). An
announced person more than zero weeks past the announcement week usually has fewer than
`CONTRACT_MIN_WEEKS` (52) left before `E`, so no catalogue term is lawful. Two rules:

1. `hiringMarketIds` POST-FILTERS its output: a person with
   `contractEndRefusal(state, id, week + TUNING.CONTRACT_MIN_WEEKS) !== null` is omitted. The sampling
   pool is NOT changed by this filter (the rotation sample for everyone else stays byte-identical); the
   listing may therefore hold fewer than `HIRING_MARKET_SIZE` rows. Finishing and retired people leave
   the pool itself (D11), which is the feature.
2. In `applySignContract` and `applyRenewContract` the cap check (`contractEndRefusal` on the offer's
   `endWeekExclusive`) runs BEFORE the hiring-market membership check and before any charge, so an
   announced person's refusal carries the `retirementAnnounced` token rather than the generic
   "not currently available to sign (D-11.14)".

Consequence recorded for C.2-RM: `bridge/market.ts:121` lists free agents by `marketEligibility(...).status
=== 'free_agent'`, so an announced free agent (status `retirement_announced`) leaves that list at
announcement, consistent with rule 1.

## 8. Amendment A2 (parent, 2026-09-25 before 19:16, after the writer's record 779)

§4's phrase "IDLE is pinned exactly as the T0 predictions (775) computed it" was the PARENT'S OVERCLAIM,
written without reading the minter. The minter's paper predictor
(`775-mint-v33-c2-corpus-minter.test.ts:141-145`) tested P12 employment only AT the birthday, never tested
the seat, and knew only the contracts fixed at the save week. **773 D3 and the rest of §4's own text
govern**: no interval or player contract active at any week of `[w − 104, w]`, no seat at `w`, anchor
`<= w − 104`. The writer implemented that text. The committed predictions are NOT edited; where they
differ they are recorded as prediction errors with their traced cause (779: the contract-and-case
director's case settled into a contract; a rival re-hire at 1196 moved E by D5; the seated director is
not idle by the seat clause). The four authored hard-boundary predictions (announce 832, age 86, E 884)
and the twelve idle predictions of `genuine-v33-c2-hard-boundary-and-idle-window` held exactly (16/16).
