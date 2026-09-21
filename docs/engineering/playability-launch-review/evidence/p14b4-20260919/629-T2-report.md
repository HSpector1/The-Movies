# 629-T2 report — cancel-causal RED extended on the landed candidate

Status: DONE. Role test-author (629-T2), the only test process; one vitest run of the one file, one typecheck.

## Identity

- Worktree `/Users/zacheryspector/The-Movies-headless-program`. Assigned HEAD `61833f0d`; during the task the parent committed `df944978` (evidence 631–632 only: `git diff --stat 61833f0d HEAD -- src/ bridge/ ui/ tests/` is empty). Both runs below record HEAD `df944978`; the tested source is byte-identical to `61833f0d`.
- Landed law read: `src/core/promises.ts` `targetSpecificImpossibility` :661-667 (doc :641-660), `breakPromisesOnCancel` :779-796 (cancel cause :791, receipt reason :793), `expectedFirstTakeWeek` :352-370 (narrowed `Pick<PromiseDraft, ...>` :354), `qualifyingTakes` :625-638, `promiseCastSlots` :597-602; `src/core/actions.ts` `applyCancel` :567-600 passes `withoutProduction` (post-cancel state) at :599.
- Only file changed: `tests/p14b4-cancel-causal-proof.test.ts` (592 → 765 lines; sha256 `3eb7f1fcc1c227fa360a0242a71c9ffefd07774a8b35a05cbbc1da41a33e8c28`). Nothing under src/, bridge/, ui/, tests/fixtures/**, no other test. No git write.
- Patch `629-T2.patch` (`git diff HEAD -- tests/`): 29771 bytes, sha256 `034887915509ffaa9a5cffdb69a9308e9830571b0947cf68ec5af976f77c13d0`; numstat +208 −35.
- Logs: `629-T2-vitest-run1.log` (22 passed / 22, exit 0, node v20.20.2, vitest 2.1.9, start 2026-09-21T19:52:00Z), `629-T2-typecheck.log` (`tsc --noEmit && tsc -p ui/tsconfig.json --noEmit`, exit 0).

## Checks run

| Command | Result |
|---|---|
| `node_modules/.bin/vitest run --project core tests/p14b4-cancel-causal-proof.test.ts` | 1 file, 22 tests, 22 passed, 0 failed; 5.83 s |
| `npm run typecheck` | exit 0 |

16 pre-existing cases (record 631: 16/16 on the unamended bytes) + 6 new = 22. No case was skipped, weakened or re-run.

## New cases (all requirement-based; every root a real bound root via `bind`, takes only from the real 5→4, outcomes only from `advancePromisesWeek` / `tick` / the action seams)

Weeks: roster at 21; greenlit-this-week shape at 21; `took()` take at 30 (greenlight 21). The proof runs on the post-cancel state, where the person sits on no running picture, so `expectedFirstTakeWeek(k=0) = week + 5` in every shape here.

| Case (describe / it) | Law sentence | Route | Paper: remaining / t0 / nMax | Expected | Observed |
|---|---|---|---|---|---|
| 629-T2 case 5N (`629-5N`) | R1 "remaining = count − actual class-qualified distinct takes"; plan :324-326, :331-334 | `took('support')` (new seat variant: actors[0] SUPPORT on A, real take at 30); bind tagged lead count 2, window [21,38); `qualifyingTakes` = [] asserted; `advancePromisesWeek` leaves progress 0; cancel A (immune, `untouched`); greenlight B at 30 with P lead (concept 1); cancel B | remaining 2 − 0 = 2; t0 = max(21, 35) = 35; nMax = ceil(3/5) = 1; 2 > 1 | BROKEN at 30, CANCEL_CAUSE, progress 0, receipts +1, one own receipt, lawful | as expected (direct pin on the pre-cancel state also returns the sentence; B's own clock is 35) |
| 629-T2 separator (`629-S`) | R1 hard bound t0 + 5k vs the quote's SEAT_CYCLE_WEEKS cadence; 629-B Q2 D2; plan :341-343, :350-351 | greenlit at 21 with P lead; bind tagged lead count 2, window [21,33); premise `reclassifyPromise` IMPOSSIBLE/PHYSICAL_BOUND (quote nMax 1 < 2); cancel; tick to 33 | remaining 2; t0 = max(21, 26) = 26; nMax = ceil(7/5) = 2; 2 ≤ 2. `quoteNMax(21,33)` = 1, `hardBound(26,33)` = 2 asserted | untouched at the cancel; helper null on the cancelled state; BROKEN at 33 with DUE_CAUSE, own receipt | as expected. The test states in its own words that this root would be BROKEN under the quote cadence (the pre-writer coupling) |
| 629-T2 D1 (`629-D1`) | R1 "t0 = max(windowStartWeek, expectedFirstTakeWeek(...))", "the window start is a floor because a picture can be held at ticks 5"; 629-B Q2 D1 | greenlit at 21 with P lead; bind tagged lead count 1, window [23,28); pre-cancel `reclassifyPromise` not IMPOSSIBLE (running picture reaches 27); cancel; post-cancel `reclassifyPromise` IMPOSSIBLE/PHYSICAL_BOUND (quote clamps the greenlight to 23 → 28 ≥ 28, the pre-writer BROKEN path); tick to 28 | remaining 1; t0 = max(23, 26) = 26 < 28; nMax = ceil(2/5) = 1; 1 ≤ 1. `quoteNMax(23,28)` = 0, `hardBound(26,28)` = 1 asserted | untouched; helper null; BROKEN at 28 with DUE_CAUSE, own receipt | as expected |
| 629-T2 D1 mirror (`629-D1m`) | same, boundary t0 ≥ due → 0 | same shape, window [23,26); cancel at 21 | t0 = max(23, 26) = 26 ≥ 26; nMax 0; 1 > 0 | BROKEN at 21, CANCEL_CAUSE, receipts +1, own receipt, lawful | as expected |
| 629-T2 direct pins (probe) | R1 boundaries | roster at 21 (no productions); four bound tagged-lead roots via `bind` + `lawful`, `targetSpecificImpossibility(state, root, 21)` | count 1 due 26: t0 26 ≥ 26 → 0 → sentence; count 1 due 27: nMax 1 → null; count 2 due 31: nMax 1 → sentence; count 2 due 32: nMax 2 → null; `hardBound` pinned 0/1/1/2 | as listed | as expected |
| 629-T2 direct pins (remaining 0) | R1 "zero → null" | `took()` (lead take at 30); bind count 1 tagged lead, window [21,31); `qualifyingTakes` = [take] asserted | remaining 0 | null even with due = week + 1 | as expected |

## Relabel (follow-up 4)

- `nMaxAfterCancel` → `quoteNMax` (10 call sites renamed mechanically; values and expectations unchanged). Its doc now says it is the QUOTE LAW's SEAT_CYCLE_WEEKS estimate used for RED premises, equal to the hard bound at count 1 and an undercount from 2 upward.
- New `hardBound(t0, due) = t0 < due ? ceil((due − t0)/W5) : 0` transcribing R1; used in every new case.
- Header: the "SCHEDULE LAW TRANSCRIBED ... the bound" block is now "QUOTE LAW TRANSCRIBED ... NOT the landed cancel bound" plus a "LANDED BOUND (record 630 R1; :661-667)" block naming remaining/t0/nMax and the two places the laws separate. The "AUTHORED AGAINST THE LAW" paragraph names the pre-writer coupling (:753 at cb13a457) and the landed coupling (:779-796, proof on the post-cancel state at actions.ts :599). ":755" → ":791" (landed literal; byte-identical to the pre-writer :756). Constants-region line refs refreshed (:736 due, :762 termination, :791 cancel, :793 reason; bottlenecks :214, :399, :426-427; proof sentence :666).
- `took()` gained a `seat` parameter (`'lead'` default byte-equivalent to the old fixture; `'support'` seats actors[0] support with actors[1]/[2] lead/antagonist) and a per-seat cache; the take assertion uses `cast: { [seat]: actors[0] }`.
- Existing cases: every removed line is a header/constants comment, the helper doc, the `took` builder or a `nMaxAfterCancel(` → `quoteNMax(` rename; no expectation line changed (verified with `git diff -U0 | grep '^-' | grep -v nMaxAfterCancel`).

## Observations (not defects)

- Existing paper checks at :370 (case 2a, `quoteNMax` 2) and :413 (case 3, 2) are quote-law values; the hard bound there is 3 (t0 26, due 41). Neither assertion depends on the value beyond ≥ 1 (629-B Q4 said the same). Left byte-identical per the brief.
- Comment line refs inside existing cases (`promiseCastSlots :592-597`, validator `:969-970, :986-990`) drifted with the writer (now :597-602 and ~:1027-1039); record-only, not touched.
- The cancel-attribution question from 630 R2 (a cancel credited with a pre-existing impossibility) is visible in 5N and D1m: in both the shape was already impossible before the cancel by the hard bound; the seam credits the cancel because the person held an in-mask seat. Record-only for the Owner as ruled.

## Evidence limits

- One vitest run and one typecheck; no other file, no controls (parent runs p14b1-promises / outcomes / live-P2 / full core).
- Cases exercise the greenlit-this-week and took shapes only; the 5-week greenlight→take lawful path the hard bound presumes is not constructed (the fixture's setup-recipe route reaches the take 9 weeks after greenlight, as 629-B noted). The separator therefore pins the bound's arithmetic and the outcome, not a two-take witness.
- No native/Unity, no browser; TS source assertions only.

## Next

Parent: record-check the amended RED bytes (this patch) as a new record, run the controls, then 629-R review.
