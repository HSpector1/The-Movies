# 1352-A: P15B corporate condition, loans and closure — charter, with the Wave 1 (pure law) detail

Parent proposal at HEAD 684bcf94, source-only. Authority: Owner rulings 3 and 4 of
[1342-O](1342-O-owner-rulings-p14-p18.md) (approved text [.txt](1342-O-owner-rulings-p14-p18-approved.txt) :42-61);
the P15 package and builder annex at 2a7ff0d9 (§11 laws 5, 6, 9 and 16; §12.3; §16; §17; §21; annex C.3, D.5, E.4,
K.4, M.5 and R); `docs/engineering/P11-TO-P12-AND-P12-FUTURE-CONSUMER-CONTRACT.md` :185-195 and :346; 1122-A
(rivals show a public distress stage and the financial-strength band). The source facts are
[1352-W0](1352-W0-p15b-wave0-facts.md), cited below as W0 §n.

## 1. What the Owner decided and what this charter authors

Decided (ruling 3):
- Player and rival studios can fail. Failure comes only after warnings and meaningful recovery opportunities, and
  those opportunities include explicitly contracted, interest-bearing loans under the shared rules.
- The player gets clear notices and a recoverable end-of-run record. No studio is silently removed.
- The rules allow no automatic bailout, no undocumented debt product and no loss of historical identity. They also
  forbid deleting the Owner's saves.
- P15 owns distress, closure and the disposal handoff. P16 owns acquisition.

Decided (ruling 4): no minimum studio count and no automatic replacement.

Delegated: the predicates, durations, loan terms and remedy families. 1342-O's execution order says delegated rule
authoring is written down and reviewed before implementation. This charter is that document for Wave 1. Waves 2-5
each get their own charter and review.

Superseded package text, kept as history:
- the player-never-terminal asymmetry (P15:471-474, :624; annex C.3), by ruling 3;
- the "minimum three active AI rivals" floor (P15:800), by ruling 4;
- "Loans ... are not implied" (P15:619), by ruling 3, which names loans. Bailouts, investors, forced sales and
  acquisition stay excluded.

## 2. Facts that shape the law (W0)

- Negative cash is already legal for both studios (`construction.ts:459-464`; `hollywoodValidation.ts:233`). Nothing
  happens when it occurs. A rival with no staff still burns at least 38,500 a week and cannot shed facilities
  (W0 §2).
- There are two finance models: player `studio.cash` plus ledger, and rival `RivalAccount` periods. Symmetric law needs
  one fact adapter over both (W0 §6). The adapter's fixed cost is the one 1350-A §3 already defines for the band:
  - player: `weeklyPayroll + weeklyOverhead + weeklyFacilityOperatingCost`, under the founding gate;
  - rival: `rivalWeeklyOperatingCost` (`hollywood.ts:106-111`);
  - research spending is discretionary on both sides and excluded.
- No loan, operating state, exit receipt or closure disposition exists (W0 §2, §4, §9).
- Rival remedies are thin. Termination shares one charge law with the player but differs in eligibility, and rivals
  have no cancellation, disposal or pause verbs (W0 §4).
- A deterministic condition needs no RNG (W0 §8).

## 3. Waves

| Wave | Content | Save / projection | Gate before it starts |
|---|---|---|---|
| 1 | Pure law: `src/core/corporateCondition.ts` (condition step and remedy list) and `src/core/studioLoan.ts` (eligibility, principal, schedule), TUNING keys | none | this charter reviewed and adopted |
| 2 | Integration: the fact adapter, the condition root and events, loan contracts (`takeLoan` player action, rival policy), money and ledger kinds, the weekly step for every studio in one phase. No closure yet: `closed` is computed and recorded as "closure due" but settles nothing | one save step, allocated at execution | shelving closed (1344-K); the natural-route measurement of §6 |
| 3 | Remedy parity: one legal predicate for termination for both studios, rival policy selection among the families | none, or with Wave 2 | Wave 2 closed |
| 4 | Closure and settlement: typed dispositions for every open subject, the P16 disposal register, the player's end-of-run record and run-end mode | one save step | own charter and review (settlement law, §7) |
| 5 | Bridge and Lot presentation: rival stage plus band, player notices with the closure countdown | one projection | Wave 4 closed; Unity deferred |

## 4. Wave 1 law: `corporate-condition/v1`

### 4.1 Input and definitions

`ConditionFacts = { week, cash, weeklyFixedCost, loanInstallment }`. The fixed cost follows §2's definition, and the
installment is the week's scheduled loan payment (0 without a loan). There is no studio flag.

- Obligation `O = weeklyFixedCost + loanInstallment`.
- Cover `c = O > 0 ? cash / O : (cash >= 0 ? +∞ : −∞)`.
- `low = c < CORPORATE_WARN_COVER_WEEKS`, and `negative = cash < 0`. A negative week is always low.

### 4.2 State and step

`Condition = { stage: 'stable'|'warning'|'distress'|'recovery'|'closed', since, lowRun, negativeRun, clearRun, distressWeeks }`.
The step `stepCondition(prev, facts) → { next, transition: null | { from, to, week, causes } }` is called once per
evaluated week, with end-of-week facts.

The counters update first:
- `lowRun` = low ? prev + 1 : 0;
- `negativeRun` = negative ? prev + 1 : 0;
- `clearRun` = low ? 0 : prev + 1;
- `distressWeeks` counts evaluated weeks since entering distress, including the entry week.

Then at most one transition fires:

| From | Condition, checked in this order | To |
|---|---|---|
| stable | `lowRun ≥ CORPORATE_WARN_SUSTAIN_WEEKS` | warning |
| warning | `negativeRun ≥ CORPORATE_DISTRESS_SUSTAIN_WEEKS` | distress |
| warning | `clearRun ≥ CORPORATE_CLEAR_WEEKS` | stable (resolution event) |
| distress | not low | recovery |
| distress | `distressWeeks ≥ CORPORATE_CLOSURE_DISTRESS_WEEKS` and negative | closed |
| recovery | negative | distress (`distressWeeks` restarts) |
| recovery | `clearRun ≥ CORPORATE_RECOVERY_STABLE_WEEKS` | stable |
| closed | absorbing: the step refuses a closed studio | — |

Properties, each pinned by a RED leaf:
- One week of negative cash does nothing. Negative cash alone cannot warn before four weeks of low cover, so the annex
  C.3 shortcut is closed.
- Distress needs eight consecutive negative weeks. That comes at least four weeks after the warning, because every
  negative week is also low, so warning fires first.
- One large week that cash absorbs (one bad film) produces no distress.
- Recovery to stable takes 13 clear weeks, not an instant reset.
- Closure's earliest route is 4 low weeks, then warning, then negative through week 8, then 26 distress weeks, all
  with negative cash at the closure week: 33 consecutive negative weeks with notices from week 4.
- The step reads no RNG, no studio flag and no id. Swapping the owner of the same facts gives the same output
  (annex K.4 `corporate-remedy-owner-swap` for Wave 1's part).

Causes are typed and bounded by the annex E.4 maximum of 5:
- `LOW_COVER {weeks: floor(c)}`;
- `NEGATIVE_CASH {weeks: negativeRun}`;
- `DISTRESS_DURATION {weeks: distressWeeks}`;
- `COVER_RESTORED {weeks: floor(c)}`.

These are the facts the player sees. Rivals disclose only the stage (1122-A), with no number.

### 4.3 Remedy families

`remedies(facts, capability)` lists the families a studio may use this week. `capability` carries the counts Wave 2
reads from state: `hasPendingRelease`, `terminableContracts`, and the loan state.
- **LOAN.** Eligible per §4.4.
- **REDUCE_OBLIGATIONS.** Termination under the shared charge law (`employment.ts:207-210`), eligible when
  `terminableContracts > 0`. Wave 3 unifies the legal predicate for both studios.
- **RELEASE.** Completing a conserved release (package §16), eligible when a production or run in release exists.

The package requires two legitimate routes before distress may demand attention (P15:615). A RED leaf pins that a
studio entering distress with a pending release, or with staff, and no outstanding loan has at least two families.
A studio with none left (no staff, no release, a loan outstanding) still transitions. The notice then states that no
route remains.

### 4.4 Loan law `studio-loan/v1`

- **Eligible:** stage `warning` or `distress`, no outstanding loan, not closed, not founding. The rule is the same for
  both studios. Stable studios cannot borrow, because growth financing stays with P16+ (P15:847).
- **Principal:** a multiple of `LOAN_AMOUNT_STEP` in `[LOAN_AMOUNT_STEP, max]`, where
  `max = floor(LOAN_MAX_FIXED_COST_WEEKS × weeklyFixedCost / LOAN_AMOUNT_STEP) × LOAN_AMOUNT_STEP`. The player chooses
  the amount. Wave 2's rival policy takes the maximum in its first distress week.
- **Interest:** flat. `total = principal + principal × LOAN_INTEREST_PERCENT / 100`, an integer because the principal is
  a multiple of 1,000.
- **Schedule:** `LOAN_TERM_WEEKS` installments starting the week after contracting. Installment i (from 0) is
  `floor(total / term) + (i < total mod term ? 1 : 0)`, so the installments sum exactly to `total`. Each installment is
  an unavoidable weekly obligation, charged in the fixed-cost phase with payroll and counted in `O`.
- **No early repayment, refinancing or second loan** in v1. After the last installment the studio may borrow again if
  eligible.
- **Closure with a balance** (Wave 4): the unpaid remainder goes into the closure record. Nobody else pays it, and no
  lender entity exists.

This is the documented debt product ruling 3 requires. It is contracted explicitly, carries interest, and follows one
law for both studios. It is not a bailout: the studio asks for it, pays for it, and the loan cannot stop a closure that
later cash does not prevent.

### 4.5 TUNING (provisional; the Owner's Wave-4-style playtest judges them)

| Key | Value | Reason |
|---|---|---|
| `CORPORATE_WARN_COVER_WEEKS` | 4 | Below the band's Strained threshold of 13 (1350-A). A warning means under a month of fixed obligations in hand |
| `CORPORATE_WARN_SUSTAIN_WEEKS` | 4 | One month. A single payroll dip does not warn |
| `CORPORATE_CLEAR_WEEKS` | 4 | A warning clears on the same scale it arose |
| `CORPORATE_DISTRESS_SUSTAIN_WEEKS` | 8 | Two months of negative cash. Longer than a 6-week run, so one film's timing cannot cause distress |
| `CORPORATE_RECOVERY_STABLE_WEEKS` | 13 | One quarter. A recovery must hold through a chart quarter |
| `CORPORATE_CLOSURE_DISTRESS_WEEKS` | 26 | Half a year in distress, 33 negative weeks at the earliest, with a loan available throughout the warning and distress stages |
| `LOAN_MAX_FIXED_COST_WEEKS` | 26 | Half a year of fixed obligations, the closure horizon |
| `LOAN_TERM_WEEKS` | 52 | One year |
| `LOAN_INTEREST_PERCENT` | 12 | Flat over the term. The value is a cost the studio feels, and it is not a period rate |
| `LOAN_AMOUNT_STEP` | 1,000 | Whole-thousand principals keep interest an integer |

Each key gets a bounded-term test: its value, and a positive integer where applicable.

## 5. Wave 1 tests (RED list for the test author)

1. `condition-transition-table`: every row of §4.2, including order within a week and "at most one transition".
2. `condition-no-single-week-skip`: one negative week gives no transition, and a 4-week negative streak gives warning
   only.
3. `condition-one-bad-film`: a one-week drop to −X followed by cover ≥ 4 gives no distress.
4. `condition-distress-after-warning`: distress never before four weeks of warning, and only after eight negative
   weeks.
5. `condition-recovery-and-relapse`: 13 clear weeks to stable; a negative week in recovery returns to distress with
   `distressWeeks` restarted; low but non-negative weeks hold recovery.
6. `condition-closure`: closure at exactly 26 distress weeks with negative cash, never with non-negative cash; closed
   is absorbing and the step refuses it; the earliest route is 33 negative weeks.
7. `condition-owner-swap-and-determinism`: identical facts give identical outputs regardless of studio; the module
   imports no RNG.
8. `condition-causes-bounded`: at most 5 typed causes, with no finance number in the rival-safe projection helper.
9. `remedies-two-routes`: §4.3's pinned case, plus the zero-route case.
10. `loan-eligibility`: the stage table, one loan at a time, never while founding or closed.
11. `loan-principal`: the max formula, step multiples, refusal of zero, negatives, non-multiples and amounts above
    max.
12. `loan-schedule-exact`: installments sum to `total`, there are exactly `term` of them, all integers, the first is
    due the week after contracting; a boundary case where `total mod term = 0`.
13. `loan-obligation-in-cover`: an installment raises `O` and lowers cover exactly.
14. `tuning-bounded-terms`: the §4.5 values.

## 6. The measurement gate before Wave 2 changes the live economy

Rival closure changes the industry for good, so the live economy's order (shelving first, D-1329-1) applies here too.
Before Wave 2 enables transitions:
- a read-only probe runs §4's law over the natural routes of the recorded seeds to 2040, with shelving landed;
- it counts studios that reach warning, distress and "closure due", and when.

If the counts show a collapse (for example, most rivals due for closure by 1960), the provisional values are re-tuned
and reviewed before integration. Wave 2's charter carries the probe's numbers.

## 7. Carried to later charters

- **The annex's participant-manifest law** (D.5; R's stop conditions). The annex assumes separate package owners
  exchanging chunked, digest-bound manifests. This codebase is one pure reducer over one state, with a full-state
  validator: a transition either returns one valid state or throws. The proposal for Wave 4 keeps the annex's
  purpose, which is exact-once disposition, atomicity, idempotency and no partial state:
  - one closure receipt lists every affected subject exactly once with its typed disposition, count and digest;
  - the validator reconciles the receipt against the state;
  - pages of at most 100 rows apply to queries.
  The Wave 4 review rules on it. If the review holds that the annex binds as written, it becomes an Owner question.
- **Operating state ownership** (annex D.5: P12 owns it, and P15 does not mirror it). The field lives on the studio
  registry. Wave 2 decides its exact root.
- **Dormancy** (the package graph's `dormant`). v1 has none. Ruling 3 asks for failure after recovery chances, and
  ruling 4 allows consolidation. A dormant, re-entering studio would need entry law the Owner declined to authorize
  (the late-entry pack). Wave 4 records dormancy as deferred.
- **Player closure** (ruling 3). Proposed for Wave 4:
  - Notices come at warning, at distress with the closure week shown as a countdown, and in the closure week.
  - Closure ends the player's run. A persisted end-of-run record (week, causes, the loan state and pointers into the
    permanent history) opens on load, and the world stays browsable read-only.
  - Earlier saves are never touched, so "recoverable" means the player can load one.

## 8. Order

Independent review of this charter (1352-B), then parent adoption (1352-F). Wave 1 RED goes to a test author while
the single writer works through the queue: P15A.2 revision, shelving production, slice A production. Wave 1
production queues behind them. Wave 2 waits for §6 and for shelving's closure.
