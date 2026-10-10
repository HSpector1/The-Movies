# RED-FIRST EVIDENCE — 1370-ar P15B Waves 2–5

Clone: /Users/zacheryspector/studio-specialists/p15b @ 6510c971. Every command below ran from the clone root. Full outputs are in `evidence/`.

## Wave 2 — corporate condition root, events, loans (1357-A §3–§6, 1357-F Amendment 1)

RED command (2026-10-10 15:49):
```
npx vitest run --project core --no-file-parallelism tests/p15b2-corporate-condition-live.test.ts tests/p15b2-corporate-condition-save.test.ts
```
Failing excerpt BEFORE (evidence/w2-red.txt; 20 failed of 20):
```
 × condition-root-fresh-and-live-version
   → RED: GameState has no `corporateCondition` root (1357-A §4); the P15B Wave 2 step has not landed
 × condition-facts-mapping / condition-evaluated-set / condition-step-final-cash / condition-step-rng-neutral
   → RED: src/core/corporateConditionLive.ts does not exist (dynamic import failed)
 × condition-root-migration-empty-genuine-v42
   → RED: src/core/save.ts exports no function 'validateSaveV46' / 'convertV45ToV46'
 Tests  20 failed (20)
```
Passing output AFTER (evidence/w2-green.txt, 2026-10-10 16:11):
```
 Test Files  2 passed (2)
      Tests  20 passed (20)
```
Intermediate runs: evidence/w2-run1.txt (16 passed, 4 failed: three test-premise errors and one message wording), evidence/w2-run2.txt (19 passed). The premise corrections are listed in PROGRESS.md 16:12.

## Wave 3 — remedy parity (1352-A §3 row 3, §4.3; 1357-A §3.4)

RED command (2026-10-10 16:35), run in `/Users/zacheryspector/studio-specialists/p15b-red`, a detached worktree of the clone at the unchanged base `6510c971` with the test and its helper copied in:
```
npx vitest run --project core --no-file-parallelism tests/p15b3-remedy-parity.test.ts
```
Failing excerpt BEFORE (evidence/w3-red.txt; 6 failed of 6):
```
 × release-predicate-player / release-predicate-rival-seats-and-writing / rival-release-loop-uses-the-predicate
 × remedy-capability-both-studios / remedies-live-both-studios / shared-cost-phase
   → RED: src/core/corporateConditionLive.ts does not exist (Failed to load url ../src/core/corporateConditionLive.js ...)
```
Passing output AFTER (evidence/w3-green.txt, 2026-10-10 16:40):
```
 Test Files  1 passed (1)
      Tests  6 passed (6)
```
Note: the predicate was implemented in the Wave 2 commit (both the rival loop and the player action compile against it), so the first run in the working tree (evidence/w3-run1.txt) already passed 5 of 6; the one failure was a test premise (label format), corrected and recorded in PROGRESS.md 16:40.
