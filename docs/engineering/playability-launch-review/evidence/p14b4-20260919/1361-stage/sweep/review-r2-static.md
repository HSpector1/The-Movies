# Preliminary independent r2 delta review

Reviewer: Codex independent sweep reviewer. Status: static review only; execution, guard observations and final approval remain pending.

Reviewed `git diff HEAD` in `/Users/zacheryspector/studio-scratch/1361-sweep/{G1-r2,G4a-r2,G4b-r2}/tree`, then the requested comment corrections and regenerated cumulative `G1/patch-r2.diff`, `G4a/patch-r2.diff`, and `G4b/patch-r2.diff` for those corrections.

Parent-reported measurement context, not independently rerun here: x2 core completed with 155 failed/5096 passed, SAME 78/CHANGED 7/NEW 70/GONE 0. The 18 NEW identities beyond 45 declared 1355 leaves and seven bridge-supervisor environment rows are deferred Power Ranking downgrade assertions. Causal-core and byte-parity passed. UI/d16 were still running when this delta review was requested.

## Initial delta conclusion

The 17 anchored replacements across 11 test files are structurally sound. No regex broadening, production/fixture edits, changed inputs, removed assertions or new stripping were found. Each new pin is the exact anchored `migrateToV44: cannot downgrade or discard a recorded Power Ranking quarter` refusal.

The used-extension coverage limitation in `p14c2b-save-v36` survives. Scientist, V39, shelving receipt/count, entrant and romance coverage references otherwise remain consistent with retained assertions.

Files in the delta:

- G1-r2: `tests/p14c2s-scientist-retirement.test.ts`.
- G4a-r2: `tests/p14c2b-save-v36.test.ts`, `tests/p14c2rm-writer-continuation.test.ts`, `tests/p14c3-cohort-transition.test.ts`, `tests/p14c3-dual-extensions.test.ts`, `tests/p14c3-offmenu-extensions.test.ts`, `tests/p14c3-profession-history.test.ts`.
- G4b-r2: `tests/p14c3-transitions.test.ts`, `tests/p14p3-directing-promises.test.ts`, `tests/p14p4p5-opportunities.test.ts`, `tests/p14r3-save-v41.test.ts`.

## Original findings and disposition

1. **Restore the termination coverage limitation.** Initially, `G4b-r2/tree/tests/p14r3-save-v41.test.ts:380` said the staged assertion was “in the next leaf”; it is below in the same leaf. The replacement also deleted the important disclosure that the movement-only leaf stops in V41 reconciliation, so it does not independently cover the downgrade movement guard. Requested: restore that limitation and identify the staged assertion as receipt-guard coverage.

   **Resolved by source inspection.** Current lines 380–382 identify the staged V41 assertion below in this leaf as receipt-guard coverage, and explicitly retain the movement-only reconciliation limitation, with `hollywoodValidation.ts:294` and 1358-X7t attribution.

2. **Distinguish the two historical writer controls.** Initially, `G4a-r2/tree/tests/p14c2rm-writer-continuation.test.ts:285` conflated adjacent coverage. The commissioned V37→V36 control at line 278 covers the V36 extension guard; the finishing V37 control at line 279 covers the not-contracted refusal formerly named by the live chain. Requested: name both explicitly.

   **Resolved by source inspection.** Current lines 285–286 separately name the commissioned extension control and the finishing not-contracted control. Both underlying assertions are retained.

3. **Keep measurement language provisional.** Repeated text “the follow-up confirms every call” read as completed evidence although masked calls and variants remained unmeasured. Requested: “the follow-up must confirm every call” until measured confirmation.

   **Resolved by source inspection.** All 17 relevant comment occurrences now say “must confirm”: two in G1, seven in G4a and eight in G4b. The three regenerated cumulative patches contain those same counts and contain no occurrence of the stale “the follow-up confirms every call” phrase.

## Remaining limits

These dispositions close the three static comment findings. They do not establish that every repinned assertion or loop variant has run. Subsequent calls and variants masked by x2 still require confirmation; bare/loose guard observations remain separately required. No final sweep approval or readiness claim is made.

No tests, Node/tsc commands, fixture access, process inspection or execution of the candidate were performed. The only write was this evidence file, explicitly authorized by the parent; no source or patch was modified by the reviewer.
