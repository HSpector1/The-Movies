# 629-W report — breakPromisesOnCancel causal-coupling correction (sim-core, ONE writer)

Status: DONE (S1 + S2). Worktree /Users/zacheryspector/The-Movies-headless-program, HEAD ca2a83dc, tree clean at start. No commit, stash, checkout, reset, add or push. Two files changed (`git diff HEAD --stat`: src/core/actions.ts 10 (+5/-5), src/core/promises.ts 51 (+43/-8)).

## S1 — src/core/promises.ts only (HEAD line numbers)

Hunks (git diff -U2 against HEAD): @@ -350,5 (signature :352), @@ -634,4 (helper inserted after qualifyingTakes), @@ -736,8 (doc comment), @@ -746,10 (body). No hunk in :383-460 or :673-733 (C5). settle, reclassifyPromise (still exported, :453 at working tree, no internal caller), promiseFeasibility, advancePromisesWeek, breakPromisesOnTermination, validators, version literals (PROMISE_RULES_VERSION 4, LIVE_SAVE_VERSION 30), imports and index.ts untouched. CAST_SLOTS is a module const still used at :595/:615/:832/:959/:960/:982.

1. :352 (R4, type-only):
```ts
function expectedFirstTakeWeek(
  state: GameState,
  draft: Pick<PromiseDraft, 'issuerStudioId' | 'beneficiaryPersonId' | 'predicate'>,
  from: number,
  k: number,
): number {
```
2. Helper after :634 (R1, R5, C1, C4), verbatim:
```ts
/**
 * Plan :331-336 / :348-355: the SEPARATE target-specific physical proof for a
 * BOUND promise after a studio action (the cancel seam), never the offer
 * classification. `remaining` is the count minus the ACTUAL class-qualified
 * distinct first takes (`qualifyingTakes`), never the stored `progress`
 * counter; zero remaining is a met predicate the weekly owner settles, not a
 * failed probe. The bound presumes M16 one-seat exclusivity
 * (`assertGreenlightStaffingIdle`: a person on a running picture cannot be
 * greenlit again) and fixed cast (no recast verb), so each later take needs a
 * greenlight at least WEEKS_TO_FIRST_TAKE after the previous take week:
 * t0 + 5k is a floor on the k-th remaining take week and ceil((due - t0) / 5)
 * a ceiling on the count reachable before `dueWeekExclusive` — a hard upper
 * bound (plan :348-349), deliberately looser than the quote's SEAT_CYCLE_WEEKS
 * hypothesis, which may not write a permanent BROKEN. The physical clock runs
 * from `week` (a picture greenlit now first-takes at week + 5); the window
 * start is only a floor on t0 because a picture can be held at ticks 5 until
 * the window opens. No reservation subtraction, no family or class refusal, no
 * FRAGILE term, no receipt (record 26 §2): a joint conflict, an unsupported
 * family and a FRAGILE remainder are all `null` here. Pure, no RNG.
 */
export function targetSpecificImpossibility(state: GameState, promise: ProfessionalPromise, week: number): string | null {
  const remaining = Math.max(0, promise.predicate.count - qualifyingTakes(state, promise).length)
  if (remaining === 0) return null
  const t0 = Math.max(promise.windowStartWeek, expectedFirstTakeWeek(state, promise, week, 0))
  const nMax = t0 < promise.dueWeekExclusive ? Math.ceil((promise.dueWeekExclusive - t0) / WEEKS_TO_FIRST_TAKE) : 0
  return remaining > nMax ? 'no filming week inside the window can reach that many pictures' : null
}
```
3. breakPromisesOnCancel :735-761 (R2, R3, C2, C3), verbatim working-tree body; immunity line and the cause/reason strings byte-identical:
```ts
/**
 * §4.4's "any studio-caused event that makes the predicate unsatisfiable": the
 * studio cancelled a picture the beneficiary held a CLASS seat on BEFORE its
 * first take. BROKEN iff the separate target-specific proof finds no physical
 * path for the REMAINING count on the post-cancel state (plan :243-252, :331-336;
 * record 26 §2). A cancellation the schedule can still absorb costs the studio
 * nothing here (it is priced by trust, §4.5); a joint reservation conflict, an
 * unsupported family or a FRAGILE remainder never breaks; a first take already
 * taken is never un-taken (companion §4.2: "first take, then cancellation").
 */
export function breakPromisesOnCancel(state: GameState, issuerStudioId: string, cancelled: Production): GameState {
  requirePromiseRoots(state)
  const week = state.market.tick
  if (state.firstTakes.some((t) => t.productionId === cancelled.id)) return state
  let next = state
  for (const promise of state.promises) {
    if (!evaluable(promise)) continue
    if (promise.issuerStudioId !== issuerStudioId) continue
    if (!promiseCastSlots(promise).some((slot) => cancelled.cast[slot] === promise.beneficiaryPersonId)) continue
    if (targetSpecificImpossibility(state, promise, week) === null) continue
    next = settle(next, promise, {
      outcome: 'BROKEN',
      outcomeCause: 'the studio cancelled the picture this person was cast in, and no path was left',
      outcomeEventId: null,
    }, week, 'a promise to this person was broken by a cancelled picture')
  }
  return next
}
```

S1 self-checks (each run once, sequentially, no watch, no full suite):
- `npm run typecheck` → EXIT 0. Log: 629-W-S1-typecheck.log
- `node_modules/.bin/vitest run --project core tests/p14b4-cancel-causal-proof.test.ts` → 16 passed / 0 failed (1 file), EXIT 0. Log: 629-W-S1-red.log. The never-before-executed tails of cases 1 and 4 (post-`untouched` due-week assertions) executed and passed; no attribution needed.
- `node_modules/.bin/vitest run --project core tests/p14b1-promises.test.ts` → 15 passed / 0 failed, EXIT 0. Log: 629-W-S1-p14b1-promises.log
- `node_modules/.bin/vitest run --project core tests/p14b4-cast-class-outcomes.test.ts` → 23 passed / 0 failed, EXIT 0. Log: 629-W-S1-outcomes.log

S1 artifacts: 629-W-cum-S1.patch sha256 ae3e8c1d8afec5471885ef24943d62f5cb65e2622d5450db32f481cbb72eb410 (85 lines, promises.ts only); 629-W-status-S1.txt (` M src/core/promises.ts`).

## S2 — src/core/actions.ts :591-595 COMMENT-ONLY (R6)

Five comment lines replaced by five (line count preserved so :599 and :2637 do not drift; the call at :599 is unchanged). No code line changed. Verbatim:
```ts
  // P14B.1 (6) / companion §4.4 / plan :243-252 / record 26 §2: BROKEN is recorded
  // IMMEDIATELY iff the SEPARATE target-specific physical proof finds no path for the
  // REMAINING count on the post-cancel state, in the promise's class mask. A joint
  // reservation conflict, an unsupported family or a FRAGILE remainder never breaks; an
  // absorbable cancellation is priced by trust; a picture that already filmed never un-satisfies.
```
Self-check: `npm run typecheck` → EXIT 0. Log: 629-W-S2-typecheck.log.
S2 artifacts: 629-W-cum-S2.patch sha256 bc4e50199769c32298c456b6963c50efb89e010b309b0ec4854811223237ac4a (cumulative S1 + S2; the promises.ts section is byte-identical to the S1 patch, verified by cmp); 629-W-status-S2.txt (` M src/core/actions.ts`, ` M src/core/promises.ts`). `git diff HEAD --stat`: exactly two files.

All logs and patches are under /private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/6ed44184-f9ac-40ba-bf1b-321fc7506549/scratchpad/. Edit scripts (assert-then-write, replacement text from quoted-heredoc files): 629-W-S1-edit.py, 629-W-S2-edit.py, 629-W-S2-edit2.py with their 629-W-S1-old-*/new-* and 629-W-S2-old/new/new5 text files.

## Evidence limits

Only the four named suites and typecheck were run; no full core, no live-P2 set, no bridge/UI suite, no natural-chain sweep (those are the parent's record-checks). No native/Unity work (R7). The RED tests import `reclassifyPromise`/`qualifyingTakes` from promises.js; index.ts untouched. No commit made; the parent lands the patches.
