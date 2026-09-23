# 728-W — parent brief: implement the P14B.7 promise waiver against the landed RED

Authority: the amended expansion `720-b7-waiver-expansion.md` at source `480aa7fe`. Read it in
FULL before writing. It has been amended three times and corrected twice; read the current bytes.

## The contract

`tests/p14b7-promise-waiver.test.ts`, sha256 `68c76efe…`, 619 lines, currently **27 failed /
2 passed (29)**. That suite is the requirement. Your job is to make it green by implementing what
it pins.

**You do not own it. Do not edit it, not one character**, including its two currently-passing
cases. If you believe a case pins the wrong thing, STOP and report it with the evidence. A
disagreement between the suite and the source is a finding worth more than a green run; a green run
obtained by editing the suite is worth less than nothing, because it destroys the only independent
check on your work.

## What to implement, and where

`src/core/promises.ts` unless stated otherwise. Every numbered item is 720 §2; read it there, since
this list is an index and not a substitute.

1. `waivePromise(state, {promiseId, substitute})`, pure, no RNG, opening with
   `requirePromiseRoots(state)`, reachable from the action dispatch.
2. `waiverAccepted(...)`, a SEPARATE pure predicate returning **`string | null`** (interpretation
   I1, 720 §2a), a reason or nothing.
3. Refuse when the original is not `evaluable()`: already terminal, or never bound.
4. The substitute's feasibility draft, which is where BOTH traps live. See below.
5. The substitute carries its own `feasibilityReceipt`.
6. Refuse a substitute identical to the original.
7. The original settles through the EXISTING `settle()` with ONE `promiseOutcome` receipt.
8. `progress` and `evidenceRefs` PRESERVED on the waived original.
9. `outcomeCause` non-empty.
10. The substitute minted BOUND, never through `attachPromise`.
11. Save **V31 → V32**, `supersededByPromiseId: string | null`. Functions named
    `convertV31ToV32` / `convertV32ToV31` (interpretation I3). Field opens `null` on every existing
    record, recomputes nothing, downgrade REFUSES a non-null value through a separate
    `projectPromisesPreV32`-style helper called BEFORE envelope validation.
12. `bridge/trust.ts` mints an attention row for a waived promise. Read item 18 first.
16. A REFUSED waiver leaves the original promise AND the game state UNCHANGED, and publishes the
    refusal. The Owner's requirement, verbatim: cleanly refused, "not accepted and rejected later
    during saving."
17. The substitute starts at `progress: 0`, `evidenceRefs: []`. The original's takes are NOT swept
    in and do NOT become retroactively eligible.
18. The attention row says WAIVED. `bridge/trust.ts:69` is a two-way ternary with NO third arm, so
    widening the gate at `:68` without touching `:69` publishes a waiver as **"broken"**, reporting
    a breach that did not happen.

Plus: correct the comment at `bridge/industry.ts:133-134` so the WAIVED exclusion is a decision on
the record. The fold's CODE does not change. The Owner decided: private confirmation, no public
announcement, and the existing public kept/broken announcements preserved untouched.

## The two traps. Both fail silently. Both are already in 720 §3

**Trap 1, the contract interval.** `promiseFeasibility` refuses a window overrunning its contract
at `:406-409`, and both refusals read `startWeek`/`termWeeks`, documented at `:203` as the CONTRACT
interval. `reclassifyPromise` passes the promise's own window instead, which makes both refusals
tautological. That is correct for a live promise and WRONG for a new substitute. Read the
substitute's interval from the real employment contract named by `promise.contractId`. Do not copy
`reclassifyPromise`; it also has no production caller.

**Trap 2, the self-reservation.** `activePromiseReservations` (`:289-297`) filters competing
reservations on `promise.promiseId !== draft.promiseId` and `reservedByActivePromises` (`:300-303`)
sums `count - progress`, which is exactly the remaining obligation the substitute must cover. So
the ORIGINAL books the capacity its own replacement needs, unless the substitute's draft sets
`promiseId` to the **ORIGINAL's** id. `PromiseDraft.promiseId` exists for this (`:206-207`).
Measured: every happy-path candidate reads `FRAGILE — needs a picture not yet commissioned` until
the exclusion is applied.

## Settled, so do not re-derive or re-open

- **Strength is a SUBSET test**, `substituteMask ⊆ originalMask`, via `promiseCastSlots` (`:603`).
  Strength runs OPPOSITE to mask size. Testing superset inverts it silently.
- **Count**, Owner-approved: `substitute.count >= original.count - original.progress`.
- **Trust effect: NONE.** The companion (`:379`, ruling S11 `:568`) settles it, and the engine
  already agrees because `trustDrivers` enumerates five kinds and none is a waiver. **Write no
  trust driver.** The "recorded and visible" half is items 12 and 18.
- **Rival waiver policy: record-only.** Rivals do not waive.
- **The retirement-moot branch: P14C.** Not yours.

## Boundaries

- Touch NO test file, NO fixture, NO existing helper's contract. The values-only sweep, if the save
  bump needs one, is the test-author's separate patch and not yours.
- `PROJECTION_VERSION` stays **49**. B.7 has no wire change. If you find you need one, STOP and
  report it, because that is a slice-shape change and the parent owns it.
- Commit nothing, push nothing. Do not run the evidence runner. Do not run the full suite; run the
  RED file and whatever targeted checks you need.
- Leave nothing under `tests/`. If you use a disposable probe, keep its text and report it: under
  record 726's rule a probe is ARCHIVED, never silently deleted.

## Report

Write `729-W-b7-report.md`: every file and hunk you touched with a one-line reason, the RED file's
sha256 re-read from disk at the END to prove you did not touch it, the suite's final result, your
typecheck results, and anything in 720 you found to be wrong. 720 has already been wrong twice,
both times in exactly the way that is invisible until someone does the work. If it is wrong a third
time, that finding outranks the implementation.
