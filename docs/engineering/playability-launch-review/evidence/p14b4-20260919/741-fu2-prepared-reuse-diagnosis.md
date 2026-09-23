# 741 — FU-2 TRIGGERED: the prepared-reuse diagnosis

Record 719 set FU-2's trigger as a recurrence and its method as "identify the OPERATION that
failed to finish, with comparable timings both sides, never defaulting to engine defect or
environmental noise". Run 739 is the recurrence. This is that investigation.

Prediction 738 named this outcome in advance and said what it would mean, so it is being read as
registered rather than explained after the fact.

## The operation

`tests/bridge-runtime-checkpoint-prepared-reuse.test.ts:367`

> preserves live authority on failed Save and replays the exact successful receipt after later
> changes and restart

It carries an EXPLICIT per-test budget, `}, 20000)`. The repository sets no global `testTimeout`,
so every other test in the file runs on vitest's 5000ms default and this one was deliberately
given 20000ms.

## Comparable timings, both sides

Measured in isolation at source `d5293b1f`, whole file green, 21 passed (21), file 108.20s:

| measurement | source | ms |
| --- | --- | --- |
| isolated, this run | `d5293b1f` | **14161** |
| archived (719) | `43817117` | 14278 |
| archived (719) | `e63d6143` | 13710 |
| archived (719) | `e63d6143` | 13328 |

Four measurements across three commits: spread 950ms, about 7%. **The operation is not getting
slower.** There is no performance regression to find, which is the thing FU-2 existed to rule in
or out.

The same file under the full core suite:

| run | file wall time | this test |
| --- | --- | --- |
| isolated | 108.20s | 14161ms, passed |
| 737 (`2feacdc0`) | 188.19s | passed |
| 739 (`d5293b1f`) | 180.29s | **timed out at 20000ms** |

Contention multiplies this file's wall time by **1.67× to 1.74×**. The budget is 20000ms against
an operation costing 14161ms, so the crossing point is **1.412×**. A contention factor the full
suite exceeds on every observed run is enough to fail it. On these numbers the surprising result
is 737 passing, not 739 failing.

## What the class is budgeted at elsewhere

The test does a restart and replays a receipt. The repository already has a file for exactly that
class, `tests/bridge-process-restart.test.ts`, and it budgets all three of its restart tests at
`}, 60_000)`:

| test | observed | budget |
| --- | --- | --- |
| withholds a durably committed load response until SIGKILL and replays it byte-identically | 21929ms | 60_000 |
| withholds a durably committed command response until SIGKILL and replays it byte-identically | 16516ms | 60_000 |
| withholds a durably committed save response until SIGKILL and replays it byte-identically | 10447ms | 60_000 |

All three pass, and the slowest runs 1.55× longer than the prepared-reuse operation that fails.

## The finding

This is neither an engine defect nor environmental noise, and both were the defaults FU-2 forbade.

The operation is stable at about 14.2s. Its budget is 20000ms, which is 1.41× its cost, set on a
restart-class operation in a repository whose own restart-class convention is 60_000ms, or 4.2×
the cost of the slowest member. The 20000ms figure is the outlier. Under the contention the full
core suite actually imposes, the budget is not achievable, and the test will keep flipping.

The margin, recorded as the Owner asked: **5839ms of 20000ms, 29.2% remaining**, at the newest
measurement.

## What was NOT done, and why

The threshold was not widened. The Owner's instruction is explicit — "retain the existing
threshold and record the measured margin" — and it was given knowing the margin was narrow. The
recurrence instruction was to investigate, not to then move the number. An assertion was not
removed, skipped, quarantined or retried, and no `it` became `it.skip`.

The evidence above is a case for aligning this budget with the repository's restart-class
convention, and that case is now on the record with its measurements. It is a recommendation, not
a change, because raising a timeout is the exact move the Owner named as illegitimate, and the
distinguishing evidence should be read by them rather than acted on by me.

**Recommended disposition, for decision:** set this one test's budget to `60_000` to match
`bridge-process-restart.test.ts`, on the grounds that the operation class is identical, the
operation is demonstrably not regressing, and the current figure is unachievable under full-suite
contention. Nothing else in the file changes; the other 20 tests keep the 5000ms default.

## What this does and does not block

Nothing. The file passes 21/21 in isolation at the current source, the test is untouched by P14B.7,
and no B.7 claim depends on it. It is one intermittent failure in a suite carrying 24 known
inherited ones.

FU-2 stays OPEN with its diagnosis complete. Its remaining question is a disposition, not a
measurement.
