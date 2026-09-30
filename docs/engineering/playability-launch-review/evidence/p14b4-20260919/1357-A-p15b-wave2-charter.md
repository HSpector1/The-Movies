<!-- 1357-A: drafted read-only by a charter specialist at HEAD c614b7e9 from the parent's brief; the parent edits and adopts it before review 1357-B. -->

# 1357-A: P15B Wave 2 charter: the condition root, the weekly step, loans and "closure due"

Parent proposal at HEAD c614b7e9, source-only. No test or campaign ran. Every `file:line` is at c614b7e9 unless it
names the Wave 1 candidate [1352-stage/1352-p15b1-production.patch](1352-stage/1352-p15b1-production.patch) (cited
"W1 patch", not yet in `src/`). Authority: Owner rulings 3 and 4 of 1342-O (approved `.txt` :42-61); D-1329-1
(1340-O :30-44); [1352-A](1352-A-p15b-corporate-condition-charter.md) §3 (Wave 2 row :52), §4, §6, §7 as amended by
1352-F and 1352-F2; 1352-F3 decision 4 (four carried items); 1354-P items 1-6; 1356-A §3-§4 (the shared fixed cost and
the tail order); the P15 annex at 2a7ff0d9 (C.3 :113-129, D.5 :256-315, G :524-595, K.4 :766-790, R :1115-1133).

## 1. Scope

| In Wave 2 | Not in Wave 2 (owner) |
|---|---|
| The fact adapter; the `corporateCondition` root; the weekly step for every studio; events; "closure due" | Remedy parity and the unified termination predicate (Wave 3) |
| Loans: `takeLoan`, the rival policy, two money kinds on each side, installment charges | Settlement, the registry operating state, dispositions, the P16 register, the end-of-run record (Wave 4) |
| Validation, migration, one save step allocated at execution; the §8 probe before integration | Bridge command, notices, stage publication, installments in `weeklyBurn` and runway (Wave 5); Unity |

## 2. Source facts at c614b7e9

| Fact | Source |
|---|---|
| `tick()` advances `currentTick = state.market.tick`; the final state carries `currentTick + 1` | `tick.ts:194-197`, `:1077` |
| The sim stream is deserialized once, drawn only by the player's critic draw, serialized at finalize | `tick.ts:231`, `:625`, `:1076` |
| The rival week runs at step 6; each rival pays payroll, overhead and capacity opex last | `tick.ts:935`; `hollywoodTick.ts:360`, `:430-432` |
| Player payroll (founded), overhead and facility opex (engaged and founded) | `tick.ts:958`, `:971`, `:987-998` |
| After finalize: scheduled entry, first takes, relationships, lifecycle, promises, talent market, settlement | `tick.ts:1118-1121`, `:1138-1160` |
| The talent market moves money on the produced week W: the player's bonus row, a rival's `signing` movement | `talentMarket.ts:1327`, `:1034-1041`, `:1073` |
| Negative cash is legal and inert; unavoidable weekly debits may push it below zero | `employment.ts:76-79`; `hollywood.ts:41-52`; `hollywoodValidation.ts:295` |
| Rival fixed cost; reserve = fixed cost × `reserveWeeks` (12-20) | `hollywood.ts:106-111`; `hollywoodTick.ts:60-62`; `hollywoodStartingData.ts:12-30` |
| One rival money roster; every period carries each kind; non-revenue movements must be ≤ 0 | `hollywood.ts:24-26`, `:35-38`; `hollywoodValidation.ts:74-75`, `:277`, `:295` |
| Live save 43; the V43 step threads an era flag down the frozen chain | `save.ts:6560-6567`, `:10668-10709` |
| The Bridge reads no rival money kind | `bridge/industry.ts:125` |

## 3. The fact adapter

`conditionFacts(state, studioId)` reads the state the tick returns, at `W = state.market.tick`: the week the advance
produced, the same clock as 1356-A's ranking step. Every fact is the position at the start of week W.

### 3.1 Evaluated studios

| Studio | Evaluated at boundary W when | First evaluation |
|---|---|---|
| Player | `hollywood !== null`, `economyEngaged(state)`, `founding === null` (`employment.ts:69-71`; 1352-F Amendment 4) | the first boundary after `recordedFromWeek` that meets the gate |
| Founding rival (entered at week 0, `calendar.ts:3`, or at the origin week) | its record is not closed | `recordedFromWeek + 1` |
| Scheduled rival | `enteredWeek ≤ W` and its record is not closed | its entry boundary; entry runs before the step (`tick.ts:1118-1121`) |
| A studio with a closed record | never again (1352-F3 item 1) | n/a |

A founding draft is never evaluated, so `loanEligible`'s `founding` argument matters only for `takeLoan`. A state with
`hollywood === null` (the headless corpus) evaluates nothing, and the step returns it unchanged.

### 3.2 `ConditionFacts`

| Field | Player | Rival |
|---|---|---|
| `week` | W | W |
| `cash` | `studio.cash` | `business.account.cash` |
| `weeklyFixedCost` | `studioWeeklyFixedCost(state, playerStudioId)` | `studioWeeklyFixedCost(state, studioId)`, i.e. `rivalWeeklyOperatingCost(b, h, W)` |
| `loanInstallment` | `loanInstallmentDue(loan, W)` for the outstanding loan, else 0 (W1 patch `studioLoan.ts:81-85`) | same |

Cost and installment are what the advance of week W charges from this state, so cover means weeks of next week's
obligations in hand. The adapter throws, echoing no money value, when an evaluated studio has `weeklyFixedCost ≤ 0`
(Amendment 4: the player carries at least `OVERHEAD_BASE` 15,000, `economyView.ts:46-49`, `tuning.ts:485`; a rival
at least 38,500).

### 3.3 One fixed cost (coordination with 1356-A)

The adapter imports `studioWeeklyFixedCost` from `src/core/powerRankingArchive.ts` exactly as 1356-A §3 defines it,
and defines no second quantity. Named findings:
- **F1, a disclosed difference, not a divergence.** The condition adds the installment beside the fixed cost
  (`O = weeklyFixedCost + loanInstallment`, 1352-A §4.1), while the band stays cash over fixed cost (1354-P item 6).
  A maximum loan's installment is 26 × 1.12 / 52 ≈ 0.56 of the fixed cost, so that studio's cover reads about 36%
  below the band's weeks.
- **F2, no import cycle.** The archive module reaches `economyView.ts` and `studioRunRecap.ts`; in `src/core` only
  `index.ts` and `queueAdmission.ts` import `actions.ts` or `tick.ts`, so both may import the Wave 2 module.
- **F3, order.** Wave 2 production follows P15A.2 slice 2a. If the order flips, the Wave 2 writer creates
  `powerRankingArchive.ts` with only `studioWeeklyFixedCost`, as 1356-A §3 words it, and 2a adds the rest.

### 3.4 Remedy capability: specified here, built with Wave 3's predicate

| Field | Player | Rival |
|---|---|---|
| `hasPendingRelease` | an active production or active run (`types.ts:306`, `:544`) | `productions` or `runs` non-empty (`hollywoodTypes.ts:110`, `:114`) |
| `terminableContracts` | contracts passing `applyReleaseTalent`'s refusals (`actions.ts:2678-2695`) | the per-employee R3 terms (`hollywoodTick.ts:185-189`), which fail below reserve |
| `hasOutstandingLoan`, `founding` | §6.4; `state.founding !== null` | §6.4; false |

No Wave 2 decision reads `remedies()`: the rival policy is LOAN-only through `loanEligible`, and notices are Wave 5.
The two termination rules differ today, and a rival below reserve counts 0 (1352-B Q4). Wave 3 writes the one legal
predicate and wires `remedies()`; a count built now from two rules would be replaced one wave later.

## 4. The root

```text
CorporateConditionRoot = { version: 1, recordedFromWeek, nextEvent, nextLoan, studios: StudioConditionRecord[],
                           events: ConditionEvent[], loans: StudioLoanRecord[] }         // top-level GameState key
StudioConditionRecord = { studioId, firstEvaluatedWeek, definitionVersion: 'corporate-condition/v1',
                          condition: Condition }                          // W1 patch shape; ascending studioId, ≤ 10
ConditionEvent        = { eventId: 'corporate-event-<n>', studioId, week, from, to, causes, definitionVersion }
StudioLoanRecord      = { loanId: 'corporate-loan-<n>', studioId, lawVersion: 'studio-loan/v1', contractedWeek,
                          weeklyFixedCostAtContract, principal, total, installments /* 52 */ }
```

- **Identity (annex D.7 :340-347; the 1356-F Amendment 1 pattern).** `events` and `loans` are append-only. Each id
  comes from a persisted monotonic allocator, `nextEvent` or `nextLoan`, incremented at append as `h.nextReceipt++`
  is (`hollywoodTick.ts:44-46`). A fresh or migrated root starts both at 1. No id is an array position, a week or a
  per-studio count, and the `corporate-` prefixes share no keyspace with `industry-event-`. P15C and P16 cite these ids
  (1353-A :73, :166; 1354-P item 2).
- **Closure due** is `condition.stage === 'closed'` plus its `distress → closed` event. Wave 2 adds no registry field,
  which departs from 1354-P item 1. A closure-due studio still operates in Wave 2, so a registry value would only copy
  P15's stage onto P12's registry, the mirror annex D.5 (:312-315) and K.4 `corporate-no-parallel-registry` (:771-772)
  forbid. The P12 field and `isOperating` arrive in Wave 4 with the first transition a P12 reader must see.
- **Installments paid** are derived as `clamp(T − contractedWeek − 1, 0, 52)` at tick T, because v1 charges every due
  installment unconditionally (§6.4). The stored schedule meets 1354-P item 2's purpose, pricing the remainder
  exactly. Wave 4 adds the stop week when a closure halts payments.
- **Bounds:** at most 10 records (`hollywoodValidation.ts:96`); at most one event per studio per evaluated week; loans
  per studio ≤ ⌊(T − firstEvaluatedWeek) / 53⌋ + 1; at most 2 causes in v1 (annex E.4 caps 5). The probe reports bytes.

### 4.1 Validation, run by the new save validator after the frozen chain

1. Exact keys at every level; `version` 1; `recordedFromWeek` an integer in `[0, T]`; empty when `hollywood` is null.
   **Identity:** every event id matches `corporate-event-<n>` and every loan id `corporate-loan-<n>`; each `n` is below
   its allocator; ids are distinct, and a duplicate refuses by name on load (D.7 "collision and duplicate-load
   refusal"); ids ascend in append order, which is `(week, studioId)` for events and `contractedWeek` for loans; each
   allocator equals one more than its largest `n`, or 1 when empty.
2. **Evaluated set.** Once `T > recordedFromWeek`, every rival with `enteredWeek ≤ T` has a record, with
   `firstEvaluatedWeek = max(recordedFromWeek + 1, enteredWeek)`. A player record requires engagement and a closed
   draft. An `overhead` row at week w ≥ `recordedFromWeek` requires a player record with `firstEvaluatedWeek ≤ w + 1`,
   because overhead and evaluation share one gate (`tick.ts:971`). No other record exists.
3. **Record law.** Counters are integers in `[0, week − firstEvaluatedWeek + 1]`. Lemma A (1352-F): `lowRun ≥
   negativeRun`, and exactly one of `lowRun`, `clearRun` is positive. `distressWeeks = week − since + 1` in distress,
   0 elsewhere (1352-F2 ruling 2). `since` is the last event's week, else `firstEvaluatedWeek` with stage stable. An
   open record has `condition.week = T`; a closed record ends with `distress → closed` at its week.
4. **Events, judged by the law of their recorded version.** Per studio, weeks strictly increase within
   `[firstEvaluatedWeek, T]`, and the chain starts at stable with each `from` equal to the previous `to`. The pair is a
   row of that version's table; `causes` is exactly that row's list (1352-F2 ruling 3), each an integer ≥ 1 that meets
   the row's threshold. `DISTRESS_DURATION` equals closure week − distress entry week + 1.
5. **Loans.** The v1 schedule is recomputed: total, 52 installments, exact sum. The principal is a positive multiple of
   the step and at most the v1 maximum for `weeklyFixedCostAtContract`. The stage at `contractedWeek` (the last event at
   or before it) is warning or distress. `contractedWeek ∈ [firstEvaluatedWeek, T]`, and one studio's loans lie at
   least 53 weeks apart.
6. **Money.** The player has one `loanPrincipal` row (+principal) at `contractedWeek`, one `loanInstallment` row
   (−installment) per due week ≤ T − 1, and no other loan row. Each rival period's two loan movements equal the same
   sums over the weeks it holds (the `periodOf` rule, `hollywoodValidation.ts:244-248`).
7. **Versioned law.** The validator reads frozen tables, `CONDITION_LAWS['corporate-condition/v1']` and
   `LOAN_LAWS['studio-loan/v1']`, never live TUNING, and refuses an unknown version. A formula that a validator
   reconciles stored values against must be versioned by era; otherwise a retune silently re-judges old saves. One
   leaf pins the tables equal to TUNING while both versions are v1 (W1 patch `tuning.ts:1018-1034`).

The checks cover rows, causes and chains, not a replay: a rival's weekly cash cannot be recovered from annual periods
(`hollywoodTypes.ts:61-67`).

### 4.2 Migration and the save step

- `convertV(N−1)ToVN` adds `{version: 1, recordedFromWeek: T, nextEvent: 1, nextLoan: 1, studios: [], events: [],
  loans: []}` and zero loan movements to every rival period, and backfills nothing (annex G.2). The next tick evaluates
  and counts its own week (1352-F2 ruling 1). A second migration is a no-op; `worldgen` seeds `recordedFromWeek: 0`.
- `convertVNToV(N−1)` strips an empty root, allocators included, and zero movements. It refuses by name any record,
  event, loan, loan row or non-zero loan movement. One tick creates records, so a ticked save cannot downgrade: the
  Save43 precedent (`save.ts:10689-10704`). Frozen builders refuse a non-empty root.
- `validateSaveVN` runs the frozen chain with the root stripped and a `studioLoans` era flag threaded to the ledger
  enum (`save.ts:2191-2205`) and to `validateHollywood` (`:74-75`; `:295` becomes `loanPrincipal ≥ 0`,
  `loanInstallment ≤ 0`), as Save41 and Save43 did. Then it runs §4.1. N is allocated at execution (§11).

## 5. The weekly step

**Position.** `advanceCorporateConditionWeek` wraps the last expression of `tick()` (`tick.ts:1160`), after 1356-A's
ranking record and before the P15C freeze. This agrees with 1356-A §4. The condition needs the week's final cash, and
the talent market moves money after finalize (`talentMarket.ts:1034-1041`, `:1073`). **F4:** the step must follow the
ranking record, because the rival policy adds a principal at W; the quarter's band and the condition then read the
same settled cash. The freeze reads no cash (1353-A :120), so the principal does not reach it.

**At boundary W:** (1) for each evaluated studio in ascending `studioId` (the player id sorts first), skip a closed
record, else take the facts and call `stepCondition(record?.condition ?? null, facts)` (W1 patch
`corporateCondition.ts:110-172`), write the record, and append an event if a transition fires; (2) for each rival in
ascending id whose new stage is distress, apply §6.2. Nothing else is written.

**No RNG.** The step and both Wave 1 modules import nothing from `rng.ts` (1352-J item 7) and read no `rngState`. The
step also runs after `rng.serialize()` (`tick.ts:1076`). The only sequential stream is the player's critic draw
(`tick.ts:625`), which the step never reaches, and derived streams are keyed by `(seed, purpose, key)`
(`rng.ts:34-67`), so no draw is reordered. A loan does change later rival choices, and so which keyed draws occur.
That is the intended behavior, and §8 measures it.

**Installments.** The player's charge is a new step 7.7 after facility opex (`tick.ts:998`). The rival's follows
`facilityOpex` (`hollywoodTick.ts:432`). Both are insertions: no row appears when nothing is due, and existing rows
keep their order.

## 6. Loans (`studio-loan/v1`, W1 patch `studioLoan.ts`)

### 6.1 `takeLoan`: `{ kind: 'takeLoan'; principal: number }`, one case in `actions.ts:2904-3077`

Checks run in this order at `T = market.tick`, before any write. No message carries a money value.

| # | Refusal | Message |
|---|---|---|
| 1 | `founding !== null` | "A studio cannot borrow during its founding draft." |
| 2 | no player record, or `condition.week ≠ T` | "This studio has no corporate condition this week." |
| 3 | stage closed | "A studio due for closure cannot borrow." |
| 4 | stage stable or recovery | "Loans are available only in warning or distress." |
| 5 | outstanding loan | "This studio is still repaying its loan; one loan at a time." |
| 6 | `loanMaxPrincipal(wfc) < LOAN_AMOUNT_STEP` | "This studio's fixed costs support no loan." |

`wfc` is `studioWeeklyFixedCost(state, playerStudioId)` at the action. `loanEligible(stage, wfc, {hasOutstandingLoan,
founding})` must then return true; if the table and the law disagree, the action throws an internal error. Only then
does `contractLoan(principal, wfc, T)` run, refusing a bad principal in its own words (1352-F3 item 2). Acceptance
appends the record under the next `nextLoan` id, adds the principal to cash and writes one `loanPrincipal` row at T.

### 6.2 Rival policy

At boundary W, a rival in distress for which `loanEligible(...)` holds contracts `loanMaxPrincipal(wfc at W)` at W and
books `loanPrincipal` at W: 1352-A §4.4's "maximum in its first distress week". The rule is read every distress week,
so a rival still repaying an earlier loan borrows at the first later distress week in which it is eligible. A rival
never borrows in warning; selection differs from the player's, the law does not (annex M.5 :941-948). The player never
receives an automatic loan.

### 6.3 Money and ledger kinds

| Movement | Player `LedgerKind` | Rival `RivalMoneyKind` | Sign | Week |
|---|---|---|---|---|
| Principal | `loanPrincipal`, note `studio loan principal` | `loanPrincipal` | + | `contractedWeek` |
| Installment i | `loanInstallment`, note `studio loan installment` | `loanInstallment` | − | `contractedWeek + 1 + i`, charged in that week's advance |

One loan at a time makes (kind, week) unique, so the ledger row gains no field (`types.ts:364-415`). The
compile-forced `Record<LedgerKind, …>` homes get the labels
"Studio loan received" and "Studio loan installments" (`financeReport.ts:6-18`), a new `financing` field with explicit
cases (`economyView.ts:457-496`, `:548-612`), and `false` in `LEDGER_KIND_PROVES_ENGAGEMENT` (`save.ts:6966`). The
Bridge carries a category `kind` as free text (`bridge-schema.ts:3193-3195`), so no projection moves.

### 6.4 Negative cash, closure due and the remainder

- **Negative cash.** An installment is charged whatever the cash. 1352-A §4.4 makes it "an unavoidable weekly
  obligation, charged in the fixed-cost phase with payroll"; unavoidable debits already run cash negative
  (`employment.ts:76-79`), and rival money allows it (`hollywood.ts:41-52`). v1 has no arrears or deferral state. The
  law is defined, so nothing goes to the Owner.
- **Outstanding** at T means `T ≤ contractedWeek + 52`.
- **Closure due.** Installments continue and the studio cannot borrow again. Wave 4 moves the unpaid remainder into the
  closure record (1352-A §4.4). 1354-P items 3-5 hold: P16 owns the bid guard, the only cap is the contracting cap, and
  the kinds land in this save step.

## 7. "Closure due" and what the player sees

Closure due is recorded, as the event and the closed record, and settles nothing. The studio keeps trading, paying and
releasing, and the rival tick loop, the chart and the technology validators do not change.

**The player sees nothing new in Wave 2.** With nothing settled there is no consequence to warn about. A minimal notice
would need its own projection step, while notices, the countdown and the rival stage share Wave 5's one step (1352-A
:55; 1356-A §7 keeps `distressStage: 'notRecorded'`). A `takeLoan` intent needs a quoted Bridge family
(`bridge/session.ts:1655-1667`), which is presentation.

Two sequencing constraints follow. No playable build carries Wave 2 without Wave 5, since rivals can borrow and a
player without the command cannot. Player settlement (Wave 4) goes live only with Wave 5's notices (ruling 3's "clear
notices").

## 8. The measurement gate (1352-A §6): probe `1357-P-condition-probe.ts`

**Routes.** `p13aGeneratedStudio(seed)` and natural `tick()` to week 6240, the 1344-P2 harness. Seeds:
`p13a-core-causal-01` and `seed-b` (1355-A §5's routes) plus `p13a-wait-control-01`, to reach three.

**Tree.** The tree Wave 2 integrates into, with Wave 1 and shelving landed. If P15A.1 Wave 2's market pressure lands
first, the probe runs on that tree, because pressure lowers grosses (1355-A :202). One heavy process runs at a time
(1342-O :69-72), after the running measurement.

**Arms.** Arm A applies the law without loans. Arm B adds the rival policy in shadow: cash moves by principal less
installments while behavior stays the natural route's. The player takes no action on a natural route, so it appears in
arm A only, as an idle studio paying 15,000 a week from 20,000,000 (`tuning.ts:89`).

**Read-outs** at 1960, 1980, 2000 and 2040 (weeks 2080, 3120, 4160, 6240): per studio, each stage's first week,
transitions, loans and closure due; rivals entered, warned, distressed and closure due; the two 1352-F calibration
facts (Strained-band weeks above the warning line, and each rival's first week below reserve against its first
warning); distress entries with fewer than two of {LOAN, RELEASE}; events, root bytes and elapsed time.

| Read-out (arm B, worst seed) | Proceed | Proceed, flagged for the playtest brief | Re-tune before integration |
|---|---|---|---|
| Closure due by 1960 / rivals entered by 1960 | ≤ 25% | 25-50% | > 50% (1352-A §6's "most rivals by 1960") |
| Closure due by 2000 / rivals entered by 2000 | ≤ 33% | 33-60% | > 60% |
| Closure due by 2040 / 9 rivals | ≤ 50% | 50-75% | > 75%, fewer than 3 of 9 left |
| Closure due, arm B minus arm A, at any checkpoint | ≤ 0 | +1 | ≥ +2: the loan hastens failure |
| A rival closure due within 104 weeks of entry | none | any; flags the entry economics, not this law | n/a |

Report only: no rival warning on any seed (flagged, as the law would never fire naturally); the idle player's path,
whose floor is 33 negative weeks; the calibration facts. A retune is a tuning amendment under 1352-A §4.5, reviewed and
re-probed. After GREEN the probe gains an arm that reads the live root; that run binds under the same thresholds.

## 9. The participant-manifest law, right-sized (1352-F notes; annex D.5, R)

The annex assumes separate owners exchanging request-bound, digest-verified chunks of at most 100 rows, and stops P15B
without them. This codebase is one pure reducer over one state, with a full-state validator at every tick boundary and
save (`tick.ts:202-229`); a transition returns one valid state or throws. The manifest's purposes map directly:
exact-once is the §4.1 reconciliation of every event, loan and money row; atomicity is one return value; idempotency is
deterministic replay plus the refusal to evaluate a studio twice at W; "no partial state" is save-boundary validation;
bounded queries are Wave 5's 100-row pages. Wave 2 makes no operating transition, and its only cross-owner writes, the
P11 ledger rows and P12 account movements, reconcile against the loan. The stop condition therefore does not bind
Wave 2, and the right-sizing binds Wave 4. Review 1357-B rules on the argument; if it fails, the question goes to the
Owner before any Wave 4 persistence.

## 10. RED list

`tests/p15b2-corporate-condition-live.test.ts` (L) and `tests/p15b2-corporate-condition-save.test.ts` (S):

| # | Leaf | Pins |
|---|---|---|
| L1 | `condition-facts-mapping` | §3.2 for the player and a rival on genuine states; research moves nothing |
| L2 | `condition-facts-shared-fixed-cost` | `weeklyFixedCost` is the imported `studioWeeklyFixedCost` value, the band's input |
| L3 | `condition-evaluated-set` | §3.1: founding draft, unengaged player, a rival entering at W evaluated at W, `hollywood` null |
| L4 | `condition-fixed-cost-positive` | > 0 on genuine states; a forged 0 throws with no money value |
| L5 | `condition-step-final-cash` | a signing settled at W is in W's facts; the step follows the ranking record |
| L6 | `condition-step-order-and-ids` | ascending `studioId`; ids from `nextEvent`/`nextLoan`, never reused after save and load; at most one event per studio per week |
| L7 | `condition-step-rng-neutral` | same `rngState`; no `rng.js` import; step bypassed, every root but this one and borrowing rival accounts is byte-identical |
| L8 | `condition-closed-not-evaluated` (1352-F3 item 1) | a closed record stays byte-identical for 52 ticks, no event; `remedies` has no `src` caller until Wave 3 |
| L9 | `condition-integer-cash-threshold` (1352-F3 item 3) | through the adapter, cash 4·O is not low and 4·O − 1 is; warning in the predicted week |
| L10 | `condition-lemma-b-live` (1352-F3 item 4) | distress starts at the 8th negative week for `CORPORATE_WARN_COVER_WEEKS` ∈ {2, 4, 8}, restored in `finally` |
| L11 | `take-loan-eligibility-first` (1352-F3 item 2) | a principal `contractLoan` accepts is refused in stable, recovery, closed, while repaying and in founding; nothing written |
| L12 | `take-loan-principal` | 0, negative, non-multiple and above-maximum refused; the maximum accepted |
| L13 | `take-loan-writes` | one record, one `loanPrincipal` row at T, cash up by the principal, nothing else |
| L14 | `loan-installments-charged` | 52 charges from `c + 1` summing to `total`, player step 7.7 and rival after opex, also at negative cash |
| L15 | `rival-loan-policy` | the maximum at the distress boundary; none in warning or while repaying; none for the player |
| L16 | `loan-owner-swap` | equal facts give equal eligibility, maximum, schedule and charge weeks |
| L17 | `loan-in-cover` | the next boundary's `loanInstallment` and cover include the loan |
| L18 | `closure-due-settles-nothing` | contracts, productions, runs, chart rows and installments continue; no other root moves |
| S1 | `condition-root-fresh`, `condition-root-migration-empty` | worldgen root; a genuine Save(N−1) fixture migrates empty at its week; first tick counts its week; re-migration no-op |
| S2 | `condition-root-downgrade` | an empty root strips; each refusal by name; frozen builders refuse |
| S3 | `condition-validate-records` | one tamper per §4.1 items 1-3, including a duplicate, out-of-order or above-allocator id and a stale allocator |
| S4 | `condition-validate-events` | one tamper per §4.1 item 4; an unknown version refused |
| S5 | `loan-validate-reconcile` | one tamper per §4.1 items 5-6; loan kinds refused below era N; sign rules |
| S6 | `condition-law-tables-frozen` | §4.1 item 7 |
| S7 | `condition-round-trip` | save and load mid-distress and mid-loan, then 60 ticks byte-identical to the unsaved run |

## 11. Order and dependencies

1. **Gates.** Shelving closes (1344-L :21-29); Wave 1 lands and its broad gates are attributed (1352-F3); the §8 probe
   returns Proceed or Flag.
2. **P15A.2 slice 2a** lands `studioWeeklyFixedCost` first, or F3 applies.
3. **Save number.** Save44 is relationship slice B (1347-F :58-60), and Save45 is expected for P15A.1 Wave 2 and
   P15A.2 2a (1355-A :131-132). Wave 2 takes the next free N. The parent may batch it with 2a, as both add top-level
   roots and read the shared fixed cost. Mint the genuine Save(N−1) fixture at that version's last writer first.
4. **RED and production.** A recorded RED on unchanged production, then one writer in three commits: (a) kinds, root,
   validation, save step and migration; (b) the step and events; (c) loans.
5. **Closure.** GREEN, implementation review, the live-version sweep, the recorded broad gates, and §8's live arm.
6. The two §7 constraints bind the scheduling of Waves 4 and 5.

## 12. Questions

**Owner questions: none.** Ruling 3 authorizes failure after warnings and explicitly contracted, interest-bearing
loans, and 1352-A/F set the law, the terms and the waves; Wave 2's choices are delegated integration detail (1342-O
execution order). Wave 2 publishes and settles nothing, so it touches no presentation ruling (1122-A) and no 1354-Q
item, which concern Waves 4-5 and P16. The rival policy is the studio's own contracted, interest-bearing choice under
the player's law, not a bailout (1352-A :144-146).

**For review 1357-B:** R1, no registry field in Wave 2 (§4, against 1354-P item 1); R2, installments paid derived
(§4, against 1354-P item 2); R3, the rival policy read every distress week (§6.2); R4, no Bridge command until Wave 5
and the build constraint (§7); R5, the §8 thresholds; R6, event checks by table, causes and chain rather than replay
(§4.1); R7, remedy capability specified now and built in Wave 3 (§3.4); R8, the §9 right-sizing; R9, a global loan
allocator rather than a per-studio keyspace (§4, D.7).
