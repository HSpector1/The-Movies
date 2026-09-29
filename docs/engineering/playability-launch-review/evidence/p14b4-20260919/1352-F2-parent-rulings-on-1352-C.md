# 1352-F2: parent rulings on the P15B Wave 1 RED findings (1352-C)

[1352-C](1352-C-p15b1-red-handback.md) staged 44 leaves, all failing at RED for stated reasons, and disclosed three
interpretations rather than resolving them silently. The parent rules on each and amends the causes of 1352-A §4.2.

## 1. The first evaluation counts its own week

`stepCondition(null, facts)` steps from a zero condition: stage stable, every counter 0, `since = facts.week`,
`week = facts.week − 1`. The week's facts then apply exactly as in any other week. A studio whose first evaluated week
has negative cash therefore starts at `lowRun` 1 and `negativeRun` 1. It does not drop that week. With every counter at
most 1, no transition can fire on the first evaluation.

The worked example of 1352-F (negative from week 1: warning 4, distress 8, closure 33) holds when the first
evaluation is week 1. The suite's healthy week-0 bootstrap also still reproduces it. Its first-evaluation leaf changes:
after a healthy week, `clearRun` is 1, not 0. A new leaf pins a first evaluation with negative cash: `lowRun` 1,
`negativeRun` 1, `clearRun` 0, no transition.

## 2. `distressWeeks` is positive exactly in distress

After the transition step, `next.distressWeeks` is 0 whenever `next.stage` is not distress, closed included. This
adopts the test author's reading and completes Amendment 1 of 1352-F. The week a studio leaves distress stores 0. The
closure week's duration lives in the transition's `DISTRESS_DURATION` cause.

## 3. Causes are durations, with an exact list per row

1352-A §4.2 gave `LOW_COVER` and `COVER_RESTORED` the value `floor(cover)`. For a studio with no obligations and
negative cash, cover is −∞, and the cause would carry `−Infinity`, which JSON cannot store. Every cause now carries an
integer duration of at least 1, read from the counter-step values of the transition week:

| Code | `weeks` |
|---|---|
| `LOW_COVER` | `lowRun` |
| `NEGATIVE_CASH` | `negativeRun` |
| `DISTRESS_DURATION` | `distressWeeks` from the counter step, before the transition step resets it |
| `COVER_RESTORED` | `clearRun` |

Causes per row, in this order:

| Transition | Causes |
|---|---|
| stable → warning, recovery → warning | `LOW_COVER`, then `NEGATIVE_CASH` if `negativeRun > 0` |
| warning → distress | `NEGATIVE_CASH`, `LOW_COVER` |
| warning → stable, distress → recovery, recovery → stable | `COVER_RESTORED` |
| distress → closed | `DISTRESS_DURATION`, `NEGATIVE_CASH` |

Each list holds at most 2 causes, inside the annex bound of 5. No cause carries a cash or cover value. The player's
finance view shows the numbers. Rivals disclose the stage only (1122-A).

## Revision 1352-C2

- The first-evaluation leaf and the new negative-first-week leaf (ruling 1).
- `distressWeeks` stays asserted as the suite already does (ruling 2).
- The causes leaf asserts the exact list and values for every row of the table above, not only for two rows
  (ruling 3). Its `LOW_COVER` value at the week-4 warning is 4, not −1.
- A leaf for the zero-obligation negative-cash week: `weeks` is a finite integer, and the transition serializes and
  parses back to an equal object through JSON.
