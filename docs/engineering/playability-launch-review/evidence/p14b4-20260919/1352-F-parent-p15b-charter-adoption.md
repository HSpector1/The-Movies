# 1352-F: parent adoption of the P15B charter with amendments

[1352-B](1352-B-p15b-charter-review.md) returned REFINE with four blocking defects. The parent adopts
[1352-A](1352-A-p15b-corporate-condition-charter.md) with the amendments below. Where they differ, the amendments
govern over 1352-A.

## Amendment 1: exact counter rules (defect 1)

Each week, the counter step runs first from `prev` and this week's facts:
- `lowRun` = low ? prev.lowRun + 1 : 0;
- `negativeRun` = negative ? prev.negativeRun + 1 : 0;
- `clearRun` = low ? 0 : prev.clearRun + 1;
- `distressWeeks` = prev.stage = distress ? prev.distressWeeks + 1 : 0.

Then the transition step fires at most one row. The distress rows read the counter-step value. A transition into
distress sets `distressWeeks` to 1 for that week.

Worked example with cash negative from week 1:
- warning at week 4 (`lowRun` 4);
- distress at week 8 (`negativeRun` 8), with `distressWeeks` 1;
- week 9 has `distressWeeks` 2;
- week 33 has `distressWeeks` 26, and the studio closes.
The earliest closure stays the 33rd consecutive negative week.

## Amendment 2: recovery declines as stable does (defect 2)

The row `recovery | negative | distress` is removed. The recovery rows are now:

| From | Condition, in this order | To |
|---|---|---|
| recovery | `lowRun ≥ CORPORATE_WARN_SUSTAIN_WEEKS` | warning |
| recovery | `clearRun ≥ CORPORATE_RECOVERY_STABLE_WEEKS` | stable |

Recovery is stable on probation. It falls exactly as stable does, and it needs 13 clear weeks instead of 4 to become
stable. A studio re-enters distress only through warning, after eight consecutive negative weeks, and `distressWeeks`
restarts at 1 on that entry. So no single week moves a studio into distress from any stage, which closes the "one bad
film" shortcut at the recovery boundary too.

## Amendment 3: the cover measure and the runway clause (defect 4)

The P11→P12 contract says, at `:346`: "Negative cash alone is not bankruptcy, and current-pace runway is not a new
P15B distress threshold."

**Lemma A.** For every stage and every week:
- negative implies low;
- `lowRun ≥ negativeRun`;
- `lowRun > 0` exactly when `clearRun = 0`.

So each stage's rows are mutually exclusive, and the "in this order" note is safe.

**Lemma B.** Distress begins exactly in the week `negativeRun` reaches `CORPORATE_DISTRESS_SUSTAIN_WEEKS`, whatever
value `CORPORATE_WARN_COVER_WEEKS` has. The cover measure therefore never decides when distress begins.

Proof sketch:
- Only warning enters distress, and it needs `negativeRun ≥ 8`.
- A stable or recovering studio with `negativeRun ≥ 4` has `lowRun ≥ 4` (Lemma A), so it reached warning no later
  than its fourth negative week.
- Warning cannot clear while low (Lemma A).
- So at the eighth negative week the studio is in warning, and distress fires then.

Closure reads only `distressWeeks` and negative cash.

Cover affects two things only: when the warning notice starts, and loan eligibility. It is also not "current-pace
runway". The code's runway (`economyView.ts` D-12.16) nets revenue and forecasts time to zero: `cash / (burn −
revenue)`. Cover is a stock ratio: cash against unavoidable fixed obligations. It is the measure of the Owner-approved
financial-strength band (1350-A §3), with no revenue term and no forecast. P15B's distress threshold is sustained,
realized negative cash.

If the confirmatory review still reads the clause as forbidding any cover-based warning, that becomes an Owner
question before Wave 1 RED.

## Amendment 4: zero fixed cost and the loan (defect 3)

- Loan eligibility adds `max ≥ LOAN_AMOUNT_STEP`. A studio with `weeklyFixedCost = 0` has no loan route, and the
  remedy list omits LOAN.
- Wave 2 invariant: every evaluated studio has `weeklyFixedCost > 0`.
  - The player is evaluated only when `economyEngaged && founding === null`. There `weeklyOverhead` is at least
    `OVERHEAD_BASE`, 15,000 (`economyView.ts:46-49`).
  - Rivals burn at least 38,500 a week (1352-W0 §2).
  - Wave 2 pins the invariant on genuine states.

## Notes adopted

- RED item 9 adds a rival-shaped capability, with staff but `terminableContracts = 0`. The function reports fewer
  routes and does not over-count.
- Dormancy is superseded, not deferred. The recovery stage covers its pre-terminal role. A dormant studio's
  re-entry would need entry law, and ruling 4 declined the late-entry pack. No dormancy item stays open.
- The right-sizing argument for the participant-manifest law goes into the Wave 2 charter, the first wave with
  persistence, not Wave 4. Its review rules before any persistence code whether the argument stands or becomes an
  Owner question.
- The §6 probe also reports two calibration facts:
  - the warning threshold of 4 weeks sits below the band's Strained threshold of 13, so a chronically Strained
    studio never warns;
  - rival reserve gates of 12-20 weeks stall rival growth before a warning can fire.
- Installment exactness depends on `total ≥ term`. With the §4.5 values the smallest total is 1,120 over 52 weeks.
  A bounded-term test pins `LOAN_AMOUNT_STEP × (100 + LOAN_INTEREST_PERCENT) / 100 ≥ LOAN_TERM_WEEKS`.

## RED list after adoption (1352-A §5 plus these)

- 1a `condition-distress-weeks-exact`: the entry week has `distressWeeks` 1, and the next week 2. A relapse entry
  restarts at 1.
- 5 (replaced) `condition-recovery-declines-as-stable`: recovery goes to warning after 4 low weeks and to distress only
  through warning after 8 negative weeks; 13 clear weeks give stable.
- 5b `condition-no-single-week-distress`: from every stage, one negative week, or any run shorter than 8 negative
  weeks, never enters distress.
- 15 `condition-distress-week-is-eighth-negative`: across fixed sequences of cash, including long low but positive
  stretches, distress begins in exactly the week `negativeRun` first reaches 8, and never on low-positive weeks alone.
- 11 adds `loan-zero-fixed-cost`: `weeklyFixedCost = 0` gives `max = 0`, the loan is ineligible, and remedies exclude
  LOAN.
- 14 adds the installment-exactness bound above.
- 9 adds the rival-shaped capability case.

## Next

One confirmatory pass by the same reviewer on these amendments (1352-B2). After it, Wave 1 RED staging (1352-C) goes
to a test author.
