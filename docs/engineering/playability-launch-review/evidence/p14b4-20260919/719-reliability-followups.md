# 719 — TWO RELIABILITY FOLLOW-UPS, ASSIGNED

Opened at the B.6 checkpoint (record 718), on the Owner's instruction of 2026-09-23. Both are
engineering follow-ups on test reliability. Neither is a gameplay decision and neither blocks
independent engine work.

The Owner's own framing, which corrects an earlier parent statement that called investigating
these "bending tests to look green":

> Fixing a demonstrated synchronization problem, leaked test state, fixture error or performance
> regression is legitimate. Removing assertions, suppressing failures, or increasing timeouts
> merely to pass would not be.

That line is the standard both follow-ups are held to. The parent's earlier framing conflated
the two and is withdrawn.

---

## FU-1 — the `ui` vitest project is not currently a regression baseline

**Owner: test-author (bounded diagnosis, independent test ownership preserved).**

**Trigger: BEFORE the next UI-affecting acceptance claim. Not now.** Engine and bridge work
continues without it. B.6 made no UI-affecting claim and record 718 makes none.

### What is measured, not supposed

Three full runs of `npm run test:ui`, each `fixedSource: true` (record 713):

| run | source | failed cases | failed files |
| --- | --- | --- | --- |
| 673, recorded earlier | `df693294` | 26 | 8 |
| baseline source, re-run today | `df693294` | **32** | 9 |
| 713, today | `fc37bd27` | 30 | 8 |

Across the three, 24 cases fail in all three and 38 fail in at least one, so **14 are
intermittent**. The unchanged baseline source is WORSE today (32) than the candidate (30). Four
files are perfectly stable across all three runs; all the movement sits in five:

| file | 673 | baseline today | HEAD today |
| --- | --- | --- | --- |
| `ui/src/lot/WorldFirstWorldInspectorDefault.test.tsx` | 10 | 9 | 12 |
| `ui/src/lot/livingTurn.scheduler.test.tsx` | 1 | **6** | 1 |
| `ui/src/lot/WorldFirstLotNativeNextEventApp.test.tsx` | 1 | 2 | 2 |
| `ui/src/lot/WorldFirstLotNativeCastingReviewApp.test.tsx` | 1 | 1 | 2 |
| `ui/src/lot/livingTurn.parity.test.tsx` | 0 | 1 | 0 |

`livingTurn.scheduler` swings 1 → 6 → 1, its largest excursion at the source that did not change.

### What this does and does not mean

The AGGREGATE pass count from this project carries no signal about a source change. An
INDIVIDUAL failure in it is still real evidence and is not to be dismissed as noise.

### The bounded diagnosis

Take the five files above, in the order listed. For each, identify which of these it is, by
evidence rather than by default:

1. a synchronization problem (unawaited effect, fake timers against a real scheduler, a
   render not flushed before assertion),
2. leaked state between cases or files (a module singleton, a jsdom global, a shared fixture
   mutated in place),
3. a fixture error (a premise that was never true and passes only by ordering luck),
4. a genuine performance regression under load.

Then fix what the evidence names, at its cause.

**NOT AUTHORIZED under this follow-up:** removing or weakening an assertion; `skip`, `todo` or
quarantine of a failing case; raising a timeout to make a case pass; adding a retry. Any of
those turns an unreliable signal into a silent one. If the diagnosis lands on a case that is
genuinely asserting the wrong thing, that is a finding to report, not a licence to edit the
assertion inside this follow-up.

### Return condition

FU-1 returns when three consecutive full `ui` runs at one unchanged source produce the SAME
failed-case count and the SAME failure identities. Until it does, record 718's qualification
stands verbatim in every header and checkpoint: **UI not rerun; reliability issue remains open.**

---

## FU-2 — `bridge-runtime-checkpoint-prepared-reuse` runs at roughly 68% of its own budget

**Owner: parent (the runtime is the parent's).**

**Trigger: A RECURRENCE. Not a scheduled investigation.** The threshold is retained as it
stands. Nothing is widened now.

### The measured margin, recorded rather than acted on

`bridge-runtime-checkpoint-prepared-reuse.test.ts` > "preserves live authority on failed Save
and replays the exact successful receipt after later changes and restart" carries a raised
timeout of `20000` ms at `:367` against vitest's 5000 default, so whoever wrote it already knew
it ran long. Measured on an idle machine, same command, main tree untouched (record 711):

| revision | contains | elapsed |
| --- | --- | --- |
| `43817117` | pre-B.6, `bridge/relationships.ts` does not exist | 14278 ms |
| `e63d6143` | B.6 complete, D1 and D2 landed | 13328 ms, and 13710 ms on a repeat |

Roughly **6.3 s of margin** with zero contention, at BOTH revisions. The test is marginally
FASTER at HEAD than before B.6 existed, so the B.6 source change did not cause the timeout that
appeared in run 703. It passed 21/21 in 176619 ms inside the closing run 717.

A narrow margin alone proves neither a defect nor adequate performance. That is why nothing is
being changed on the strength of it.

### On a recurrence, investigate this and nothing else

1. **Which operation failed to finish.** Not "the test timed out": the specific await or
   assertion, and how far the case had progressed when the budget expired.
2. **Comparable timings.** The same case, same machine, idle and under the load it failed
   under, at the recurring source and at a source that predates the suspected cause. Record 711
   is the template and its numbers are the comparison set.
3. **Whether the landed change can reach that path at all.** Record 711 cleared the B.6 cost
   path this way: `bridge/people.ts:530` does build `collaborators` per talent, and that was
   examined and shown not to be on this test's route.

**NOT AUTHORIZED:** widening the timeout to clear a recurrence, quarantining the case, or
opening a speculative optimization campaign on the checkpoint path. Per the Owner, a recurrence
is classified from what actually failed to finish, never defaulted to either "engine defect" or
"environmental noise".

### Return condition

FU-2 returns when a recurrence is attributed to a named operation with comparable timings on
both sides, or when it has not recurred across the next three full core runs, whichever comes
first. Either outcome is recorded; neither authorizes a change to the threshold without its own
disposition.
