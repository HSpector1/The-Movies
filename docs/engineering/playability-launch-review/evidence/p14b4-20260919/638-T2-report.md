# 638-T2 report: promises.ts line-cite re-verification after the 638-W +6 shift

Status: DONE.

Worktree /Users/zacheryspector/The-Movies-headless-program, HEAD 438f302a. Working tree at start carried the uncommitted 638-W (src/core/promises.ts doc comment :449-458, +6 lines; src/core/promiseCapacityOwners.ts header, +6 lines) and 638-T (7 test files). Git read-only; no commit/stash/checkout/reset/add/push. src/ not touched (mtimes still 23:02:05 / 23:02:01 from 638-W).

Shift proof (working tree vs `git show HEAD:src/core/promises.ts`): HEAD :1-448 byte-identical to WT :1-448; HEAD :453-end byte-identical to WT :459-end. So every HEAD cite >= :453 moves exactly +6; every cite <= :448 is unchanged. Each corrected cite below was also read directly with sed -n at its new number.

## Scope result
- tests/p14b4-cancel-causal-proof.test.ts: the only 638-T file with numeric promises.ts cites. 10 comment lines corrected.
- tests/p14b1-promises.test.ts: NO numeric promises.ts / promiseCapacityOwners cites (grep `:[0-9]{2,4}` outside string literals: 0; the 638-T edits at :577-582, :784, :823-828 name `targetSpecificImpossibility` without line numbers). No change.
- Other five 638-T files (bridge-operations-events, bridge-p14b1-promises, p14b1-save-v29, p14b3-rule-revision, p14bf2-acting-discipline): grep for `promises.ts :`, `promiseCapacityOwners`, `promiseCastSlots :`, `qualifyingTakes :`, `targetSpecificImpossibility (:`, `breakPromisesOn* :`, `reclassifyPromise :`, `promiseFeasibility :` — 0 hits. No test anywhere under tests/ cites promiseCapacityOwners line numbers (grep `promiseCapacityOwners(\.ts)? *:[0-9]`: 0).

## Change table (tests/p14b4-cancel-causal-proof.test.ts; file:line in the working tree = HEAD, no line count change)

| file:line | old cite -> new cite | function / line read in the working tree |
|---|---|---|
| :15 | promises.ts :779-796 -> :785-802 | `export function breakPromisesOnCancel(` :785 ... `}` :802 (HEAD :779-796 identical text) |
| :16 | targetSpecificImpossibility (:661-667) -> (:667-673) | `export function targetSpecificImpossibility(` :667 ... `}` :673 |
| :49 | promises.ts :661-667 -> :667-673 | same function, :667-673 |
| :59 | landed :791 literal -> :797 | :797 `outcomeCause: 'the studio cancelled the picture this person was cast in, and no path was left',` |
| :77 | :736 due -> :742 | :742 `outcomeCause: 'the window closed before the promised pictures began filming',` |
| :77 | :762 termination -> :768 | :768 `outcomeCause: 'the studio terminated this contract early, ending the window',` |
| :77 | :791 cancel -> :797 | as :59 |
| :77 | :793 receipt reason -> :799 | :799 `}, week, 'a promise to this person was broken by a cancelled picture')` |
| :82 | PHYSICAL_BOUND sentence (:666) -> (:672) | :672 `return remaining > nMax ? 'no filming week inside the window can reach that many pictures' : null` |
| :103 | promises.ts :664-665 -> :670-671 | :670 `const t0 = Math.max(promise.windowStartWeek, expectedFirstTakeWeek(...))`, :671 `const nMax = t0 < promise.dueWeekExclusive ? Math.ceil(...) : 0` |
| :414 | promises.ts :1011-1012, :1028-1032 -> :1017-1018, :1034-1038 | :1017-1018 family-catalogue `.includes(...)` refusal; :1034-1038 `} else { ... exact(predicate, ['count'], ...) }` count-only branch |
| :422 | promiseCastSlots :597-602 -> :603-608 | `export function promiseCastSlots(` :603 ... `}` :608 |
| :710 | qualifyingTakes :633-634 -> :639-640 | :639 `|| take.studioId !== promise.issuerStudioId`, :640 `|| take.week < promise.windowStartWeek || take.week >= promise.dueWeekExclusive` |

(:77 is one line carrying four cites; 10 physical lines changed, 13 cite corrections.)

## Cites verified and left (all in tests/p14b4-cancel-causal-proof.test.ts)
- Before the shift, unchanged and re-read: :214 (NOT_OFFERED_IN_B1 catalogue entry, :81), :352-370 `expectedFirstTakeWeek` (:36; WT :352 signature, :370 brace), :399 seat-class refusal (:81), :416-427 `promiseFeasibility` from/nMax/refusals (:37), :420-425 nMax loop (:95), :426-427 the two refusals (:81).
- Commit-anchored history, left: :9 "promises.ts :753 at cb13a457", :60 "pre-writer :756".
- actions.ts cites, left per instruction: :30 :567-600, :32 :599, :34 :599 and :2637, :17 :599, :628 :599.
- plan/26-map cites (:4-5, :280, :310, ...), not promises.ts, left.

## Stale cite OUTSIDE my authority (flag for the parent)
- tests/p14b4-cancel-causal-proof.test.ts:737 `describe('629-T2 direct pins on the exported proof (record 630 R1 boundaries; promises.ts :661-667)', () => {` — a describe TITLE (string), so "comment lines only" excludes it. After 638-W lands it reads :661-667 where the function sits at :667-673. Suggested title text if the parent authorizes a title change: replace `:661-667` with `:667-673` (one string token; cannot alter pass/fail).

## Run (once, after all edits)
Command: node_modules/.bin/vitest run --project core tests/p14b4-cancel-causal-proof.test.ts tests/p14b1-promises.test.ts
EXIT 0; Test Files 2 passed (2); Tests 37 passed (37); p14b4-cancel-causal-proof 22/22 (5293ms); p14b1-promises 15/15 (7794ms); Start at 23:10:22, Duration 10.44s.
Executed against the working tree (638-W src doc comments present), which is behaviourally identical to HEAD (0 non-comment src lines changed). Typecheck NOT run (parent does).

## Artifacts
- Patch (git diff HEAD -- tests/, cumulative with 638-T): /private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/6ed44184-f9ac-40ba-bf1b-321fc7506549/scratchpad/638-T2.patch
  16965 bytes, sha256 d2e283287ed9fe9e74689ad78b2a5706d77b3e5a1b9f3104a3bcad0b7054b125; 7 files, +36/-28.
  Delta vs 638-T.patch: 20 diff lines = the 10 p14b4 comment lines (8 newly changed + the 2 638-T lines :414/:422 re-numbered). Non-comment/non-title changed lines in the whole patch: 0.
- Run log: /private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/6ed44184-f9ac-40ba-bf1b-321fc7506549/scratchpad/638-T2-run.log
  3610 bytes, sha256 b79cf2519bc41bda6065851d6d57f565fb24b88e2e277fdb473ca8c6c764f63a.
- Edit script (assert-then-write, exactly one match per edit, new text asserted absent before write): scratchpad/638-T2-edit.py (10 edits).
- HEAD blob used for the side-by-side: scratchpad/promises.HEAD.638T2.ts (= git show HEAD:src/core/promises.ts).

## Evidence limits
- The corrected numbers are correct only if 638-W lands byte-identical to the current working tree (promises.ts doc comment :449-458 = +6). Any further edit above a cited line re-drifts every cite in this file; the parent's commit order (638-W first, then tests) is what these numbers assume.
- Comment/title edits cannot change pass/fail; the run confirms no syntax breakage only. No native/browser results.
- p14b1-promises.test.ts was run as instructed although it carries no line cites and 638-T2 did not change it.

## Next concrete action
Parent: land 638-W, then 638-T2.patch (supersedes 638-T.patch); decide on the :737 describe-title cite; run typecheck; record 638.
