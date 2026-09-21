# 638-T report: text-only pass (record 637 NEXT637 (c); 600-R Q2/R-8; 616 R-8; 629-R Q6)

Status: DONE (with one concurrent-worker observation, see Evidence limits).

Worktree /Users/zacheryspector/The-Movies-headless-program, HEAD 438f302a, tree clean at start.
Git read-only; no commit/stash/checkout/reset/add/push. Files touched: 7 test files under tests/ only.
Every changed line is a `//` comment or an `it('...')` title (grep of the diff for any other changed line: 0).
No assertion, expectation value, code token, thrown/asserted string, fixture, import or version literal changed.

Artifacts
- Patch (git diff HEAD -- tests/): /private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/6ed44184-f9ac-40ba-bf1b-321fc7506549/scratchpad/638-T.patch
  11803 bytes, sha256 d65d896d1fcfb8c1e1782d27f4b2b93fd62c8e52431ff41dc8fdff15f72b3106; 7 files, +28/-20.
- Run log: /private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/6ed44184-f9ac-40ba-bf1b-321fc7506549/scratchpad/638-T-run.log
  10538 bytes, sha256 63b35a90d6bb3cf679a7786e9a3f09d95986517656fc48c87d097c6ab2353a0c.
- Edit scripts (assert-then-write, one match each): scratchpad/638-T-edit.py (14 edits), scratchpad/638-T-edit2.py (1 correction).
- HEAD blob used for line verification: scratchpad/promises.HEAD.ts (= git show HEAD:src/core/promises.ts).

## Change table (file:line at HEAD; old -> new; reason)

1a. tests/p14b1-save-v29.test.ts:108 (title)
    old: it('LIVE_SAVE_VERSION is 29'
    new: it('LIVE_SAVE_VERSION is 30 (the P14B.4 cutover, record 600 / qualified 616; the V29 lift this slice pins is the intermediate step)'
    reason: 600-R Q2 — title stated 29 over expect(...).toBe(30). describe :107 (historical P14B.1 test-8 identity) untouched.
    (Cutover commit verified: 3b8f5b6a "600-W S3 save: LIVE_SAVE_VERSION 30"; qualified at record 616 / 1f6015d0.)
1b. tests/p14b1-save-v29.test.ts:193-194 (comment)
    old: "B4 additive reader recognizes V30 before the live writer cuts over; this is the CURRENT dispatch sentinel, not a change to frozen V29 fixture law."
    new: "The B4 additive reader recognized V30 before the live writer cut over (it did at record 600 / 616, LIVE_SAVE_VERSION 30); 30 is the current dispatch sentinel, not a change to frozen V29 fixture law."
    reason: 600-R Q2 — "before the live writer cuts over" narrated as current; the writer has cut over. Past tense for the history.

2a. tests/bridge-p14b1-promises.test.ts:206 (title)
    old: it('LIVE_SAVE_VERSION stays 29; the live promise surface carries projection 46 after P14B.2'
    new: it('LIVE_SAVE_VERSION is 30 and the live promise surface carries projection 47 after the P14B.4 cutover (record 600 / 616)'
    reason: 600-R Q2 — body asserts LIVE_SAVE_VERSION 30, PROJECTION_VERSION 47, schema $id ...:projection-47, projectionVersion 47.
2b. tests/bridge-p14b1-promises.test.ts:498 (title)
    old: 'a live V29 state carrying a real promise round-trips ...'
    new: 'a live V30 state carrying a real promise round-trips ...'
    reason: 600-R Q2 — the test builds a live state (openCaseWithBothProposals + attachPromise), saves through BridgeSession and asserts parsed.saveVersion 30.
2c. tests/bridge-p14b1-promises.test.ts:491-494 (comment; NOT on the list — same file, same defect class, sits two lines above `toBe(30)`)
    old: "stay V28. Save V29 is the live writer and `fromSaveJson` migrates on load (the two empty roots asserted above ARE that conversion), so the re-save is V29 bytes by law. The fixture's V28 sha ..."
    new: "stay V28. The live writer (V29 when T3 corrected this; V30 since the P14B.4 cutover, record 600 / 616) migrates on load through `fromSaveJson` (the two empty roots asserted above ARE the V28->V29 step of that conversion), so the re-save is live-version bytes by law. The fixture's V28 sha ..."
    reason: 600-R Q2 — "Save V29 is the live writer ... re-save is V29 bytes" is a current-state claim directly over expect(saveVersion).toBe(30). Drop this edit if the parent wants the enumerated lines only; it is independent of 2a/2b.

3a. tests/p14b3-rule-revision.test.ts:97 (title)
    old: it('pins the new evaluator generation independently of unchanged Save29/projection46'
    new: it('pins the live evaluator generation (PROMISE_RULES_VERSION 4; Save30/projection47 landed in the same record-600 cutover)'
    reason: 600-R Q2 / record 600-T — body asserts PROMISE_RULES_VERSION 4; the sibling it.each asserts governed.saveVersion 30; "unchanged Save29/projection46" is false since the coordinated cutover.
3b. tests/p14b3-rule-revision.test.ts:1 (header comment; NOT on the list — found by the requested header scan)
    old: "// DRAFT ONLY: intended tests/p14b3-rule-revision.test.ts. Not installed or run."
    new: "// Drafted before B3 T0 as the intended tests/p14b3-rule-revision.test.ts; installed and run in the core project since f4e1230."
    reason: 600-R Q2 class — false current-state claim; the file is under tests/**, included by vitest.workspace.ts project "core", and ran in this pass (6/6). Added-in commit f4e1230 from git log --diff-filter=A.
    Header scan result: :2-11 narrate B-F2 (3) and record 600 (3->4) as history — accurate, left. :61 and :75 are fixture-provenance ASSERTIONS (saveVersion 29 / projectionVersion 46 of the genuine evaluator1 corpus) — code, accurate, left. describe :96 already says "(4 after record 600)".

4.  tests/bridge-operations-events.test.ts:323 (title)
    old: '... validates inside the served projection-46 envelope'
    new: '... validates inside the served projection-47 envelope'
    reason: 600-R Q2 — :333 asserts PROJECTION_VERSION 47.

5a. tests/p14bf2-acting-discipline.test.ts:1 (header comment; NOT on the list — found by the requested header scan)
    old: "// DRAFT ONLY, intended tests/p14bf2-acting-discipline.test.ts. Not installed/run."
    new: "// Drafted as the intended tests/p14bf2-acting-discipline.test.ts; installed and run in the core project since 957d2de."
    reason: as 3b (file ran 13/13 in this pass; added in 957d2de).
5b. tests/p14bf2-acting-discipline.test.ts:4 — LEFT AS ACCURATE (see below).

7a. tests/p14b1-promises.test.ts:577-578 (comment)
    old: "Plus the assigning brief: BROKEN-on-capacity-collapse via the landed `cancel` action, asserted iff re-feasibility is IMPOSSIBLE."
    new: "Plus the assigning brief: BROKEN-on-capacity-collapse via the landed `cancel` action. As landed (records 630/637) the cancel seam breaks iff the separate target-specific proof `targetSpecificImpossibility` (remaining count > nMax = ceil((due - t0) / 5), t0 = max(windowStart, week + 5 or the running picture's take week)) fails on the post-cancel state; the offer re-feasibility is no longer the trigger."
    reason: 629-R Q6 / record 630-637 — "asserted iff re-feasibility is IMPOSSIBLE" describes the pre-630 coupling.
7b. tests/p14b1-promises.test.ts:780 (title)
    old: '... makes re-feasibility IMPOSSIBLE and the promise BROKEN'
    new: '... fails the target-specific proof (remaining 1 > nMax 0) and the promise is BROKEN at the cancel'
    reason: same. Paper check against HEAD promises.ts :661-667: post-cancel the lead has no running picture, so expectedFirstTakeWeek(k=0) = week+5; t0 = max(week, week+5) = week+5; due = week+2; t0 >= due -> nMax 0; remaining = 1 - 0 qualifying takes = 1 > 0 -> BROKEN. Seam relevance: count-only APPEARANCE_COUNT -> generic CAST_SLOTS, lead seated on the cancelled picture, no first take recorded.
7c. tests/p14b1-promises.test.ts:819-822 (comment)
    old: "sanity: re-feasibility is already IMPOSSIBLE BEFORE the cancel too (the window is too tight regardless) — the meaningful claim this test pins is the STUDIO-CAUSED cancel producing the BROKEN outcome, not that cancelling is what tips it into IMPOSSIBLE by itself."
    new: "PREMISE (not the trigger): the offer service already says IMPOSSIBLE BEFORE the cancel (the window is too tight regardless). The landed seam (records 630/637) does not consult this quote; it breaks iff the separate target-specific proof fails on the post-cancel state — here remaining 1 > nMax 0 (t0 = week + 5 >= due = week + 2). The claim this test pins is the STUDIO-CAUSED cancel producing the BROKEN outcome at the cancel."
    reason: same; the promiseFeasibility call and expect('IMPOSSIBLE') at :823-828 stay byte-identical as the premise.

8a. tests/p14b4-cancel-causal-proof.test.ts:414 (comment, numbers only)
    old: "(promises.ts :969-970, :986-990)"
    new: "(promises.ts :1011-1012, :1028-1032)"
    reason: 629-R Q6 line drift. Verified on the HEAD blob (git show HEAD:src/core/promises.ts): :1011-1012 = the family-catalogue `.includes(...)` refusal; :1028-1032 = the `} else { ... exact(predicate, ['count'], ...) }` count-only branch. NOTE: the parent's "~:1027-1039" and my own first write (:1017-1018, :1034-1038) were working-tree numbers shifted +6 by a concurrent comment-only edit to promises.ts (see Evidence limits); corrected to HEAD before the patch was cut.
8b. tests/p14b4-cancel-causal-proof.test.ts:422 (comment, numbers only)
    old: "(promiseCastSlots :592-597)"   new: "(promiseCastSlots :597-602)"
    reason: 629-R Q6 line drift; HEAD :597 signature, :602 closing brace.
    All other promises.ts citations in that file verified accurate at HEAD and left: :214, :352-370, :399, :416-427, :420-425, :426-427, :633-634, :661-667, :664-665, :666, :736, :762, :779-796, :791, :793. Historical pins ":753 at cb13a457" and "pre-writer :756" are commit-anchored history, left. actions.ts :567-600 (applyCancel), :599 (breakPromisesOnCancel call), :2637 (breakPromisesOnTermination call in applyReleaseTalent) verified accurate at HEAD, left.

## Items left as accurate (with reason)

- Item 5b tests/p14bf2-acting-discipline.test.ts:4 "No candidate-pool, rival-policy, label, Save29/projection46 or P2 change." — a scope statement of the F2 slice as landed (F2 changed none of those); :2 ("B-F2 uses3") and :5-11 (record 600 moved 3->4 in the coordinated cutover) frame it as history. Left. Title scan: :97 and :291 already say "4 after record 600"; :271 is a fixture-provenance assertion (code). Nothing else in the file states 3/Save29/projection46 as current.
- Item 6 tests/bridge-contract-generator.test.ts:655-662 — a dated log chain ("P14A.2-T2 (projection 43) ... P14B.2 (projection 46) ... P14B.4 (projection 47, record 600)"); each entry is prefixed by its own projection and 47 is the last entry. No phrase claims 46 is current. Left.
- Item 9 tests/d11-cycle2.test.ts:227 `if (reloaded.saveVersion !== 30) throw new Error('expected V28')` — a thrown STRING (code token), not a comment; out of this pass's authority. Left. Noted as a stale message for a future code-side pass: the guard checks 30 while the message says V28.
- tests/p14b1-save-v29.test.ts :1-10 header, describe :107, titles :112/:160/:184 — describe the V28->V29 lift those tests exercise via migrateToV29 (history + accurate mechanics). Left.
- Borderline, left, flagged: tests/bridge-p14b1-promises.test.ts:467 (group-6 banner "converts to V29 ... a live V29 promise") and :470 (title "converts to V29 with empty firstTakes/promises"). The bridge load lands on the live V30 envelope through the V29 step; the empty tables are the V29 step's effect. Not clearly false; parent's call. Suggested wording if wanted: "converts through V29 to the live V30 envelope with empty firstTakes/promises".

## Run (once, after the 14-edit pass; before the single 8a number correction)

Command: node_modules/.bin/vitest run --project core tests/p14b1-save-v29.test.ts tests/bridge-p14b1-promises.test.ts tests/p14b3-rule-revision.test.ts tests/bridge-operations-events.test.ts tests/p14bf2-acting-discipline.test.ts tests/p14b1-promises.test.ts tests/p14b4-cancel-causal-proof.test.ts
EXIT 0; Test Files 7 passed (7); Tests 79 passed (79); start 23:04:26, 26.55s.
Per file: p14b4-cancel-causal-proof 22/22; p14b1-promises 15/15; p14bf2-acting-discipline 13/13; bridge-operations-events 6/6; p14b1-save-v29 6/6; bridge-p14b1-promises 11/11; p14b3-rule-revision 6/6.
Matches the expected p14b1-promises 15/15 and cancel-causal 22/22. No "before" run was taken (instruction: run once).
Typecheck NOT run (parent does).

## Evidence limits

- Concurrent worker in this worktree: src/core/promises.ts (mtime 23:02:05) and src/core/promiseCapacityOwners.ts (23:02:01) were modified by someone else during this pass (tree was clean at my start; I did not touch src/). git diff HEAD -- src/ shows doc-comment lines only (0 non-comment changed lines), so the 23:04:26 run is behaviorally equivalent to HEAD, but it executed against that modified working tree, not the HEAD blob. Those two files are NOT in my patch. The +6-line shift above promises.ts :449 is what produced the wrong validator numbers I first wrote for 8a; the committed patch carries HEAD numbers, verified on git show HEAD:src/core/promises.ts. If the concurrent src edit lands before this patch, the :1011-1012 / :1028-1032 citations will drift to :1017-1018 / :1034-1038 again (and :597-602 -> :603-608, :661-667 -> :667-673, etc.) — every promises.ts line citation in that file is fragile to any edit above it.
- The 8a number correction (one comment line) was applied after the run; the run log therefore reflects the patch minus two integers in one comment. Not re-run (instruction: once).
- Title changes cannot alter pass/fail; the run confirms no accidental syntax breakage only.
- No native/browser results; source assertions above are from the HEAD blob and paper computation of the :661-667 bound for the p14b1-promises cancel case.

## Next concrete action
Parent: review 2c/3b/5a (unlisted but same-class edits) and the :467/:470 borderline; land or trim the patch; run typecheck; record 638.
