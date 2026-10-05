# Paid set maintenance: bounded operated-route proposal

Static proposal only. The completed diagnostic was independently reviewed at `S/1361-postrelease-diagnostic-runs/trial-r1-observation/out/INDEPENDENT-REVIEW.md`. This directory contains a new policy candidate, not an executed or qualified route. No Node, TypeScript, tests, replay, fixture access, live source or index change was performed; no automatic run is scheduled.

## Proven reason for this one policy addition

The diagnostic preserved the original trial's full final-state hash and all 12 deterministic outputs. `prod-0145` first acquired a `set-unavailable` blocker on input 147 → output 148; the detector reported it at 154. Both standing sets were at condition 28. Exact Save45 source requires condition ≥35 to bind a set (`sets.ts:180–184,741–750`; `tuning.ts:891`) and records that blocker when a stage exists but no usable set does (`operations.ts:312–353`). The controller has no general maintenance step and no next studio decision at that point. This is a source-grounded remedy for the observed block, not an assumption that the route will remain viable through 2040.

The price is the existing **`TUNING.SET_REPAIR_COST`**, currently 60,000, not a newly guessed amount or blueprint refund. The existing public `repairSet` action checks `repairSetRefusal` with the real `canAfford` function, set occupancy and shared scenery capacity (`actions.ts:1572–1582`; `sets.ts:407–430,522–581`). Ordinary ticks complete two weeks of paid scenery work and restore condition to 100, leaving novelty unchanged (`sets.ts:646–673`; `tuning.ts:725,892–893`). No gameplay source constant/catalogue changes are proposed.

## Exact delta

`probe/postrelease.ts` copies the original completed operated-trial probe, SHA `87e45c65f8972da3106c2e4d9e3382db90962377f1686fb67069a181507b505d`. Its exact original bytes remain in `probe/postrelease-original.ts.txt`. `probe.diff` contains the entire change:

1. Import the existing `setIsUsable`, `repairSetRefusal` and `canAfford` readers.
2. Immediately after the unchanged `staff(state)`, before the unchanged film controller, inspect standing sets that are currently unusable. In ascending exact set ID order, attempt `{kind: 'repairSet', setId}` through `applyActions` once per selected set per week. Recompute the actual refusal/affordability input after each earlier accepted action. Sets still under repair are not selected again. No action is attempted on usable sets.
3. Record each actual repair acceptance/refusal and its paid ledger movement. Public refusal returns the same input; unexpected errors stop. Accepted repairs must match the owner's existing charge, one `setMaintenance` movement, actual completion week, retained current condition, novelty and quality. A guard/action disagreement stops loudly rather than repairing state or accepting an invented quote.

The original staffing function is byte-identical. Genesis, seed-b, roster targets, hiring/renewal choices, film policy, action order relative to staffing, discarded helper tick, `{develop:true}` continuation and original trial qualification expression are unchanged. There is no proactive refurbishment above the usability threshold, set replacement/strike/commission, cash grant, faster work, new concept generation, market bidding or contract override. The two-week work and competition for real scenery capacity remain effective.

Maintenance logging is separate from original staffing counts/refusals. It reports total attempts, accepted/refused, total paid, refusal counts by the actual source guard code, and at most 512 detailed rows with an explicit omitted count. Each row includes week/set, condition before/after, quoted source cost, structured refusal and actual public message, before/after cash, resulting status/completion week, paid amount and exact new ledger row. The full ledger remains in game state; this output bound removes no history. The row bound is a diagnostic storage limit, not a game limit. The original state/result hash must change if maintenance executes; do not require old-state parity of this newly authorized controller.

## Fixed route, wrapper and next gates

`run-maintenance.sh` is copied from the original executed trial wrapper; `wrapper.diff` shows only the new prep/output roots, explicit original source-tree guard, and a check that a qualified maintenance trial actually accepted at least one paid repair. It retains original process-group timeout handling, Node v20.20.2, 5 GiB disk guard, battery/power log, caffeinate, exclusive output and ancestor-symlink refusal, source pre/post guards, copied probe/wrapper hashes and original trial/full certificate binding.

The accepted source must have `src` tree `88d0197645b3a5bd69d73ebff0c5c1c9ff0aa837`. The actual full HEAD is an argument. New outputs go only to `S/1361-postrelease-maintenance-runs/<new-leaf>`; old failed and diagnostic runs are untouched.

The bounds remain **520 weeks for trial** and **6344 for full**. The full command remains a separate parent decision and requires a successful 520-week trial at the same actual HEAD and exact new policy SHA, with recent releases, replacement hiring and the original qualification predicate. A failed original trial or observation-only diagnostic cannot qualify this changed policy. An additional full-wrapper check requires an observed accepted repair; it is a measurement-premise check, not a product rule.

After independent review, parent can stage the exact candidate and copied strict `tsconfig.maintenance.json` in the same `probe/`, `tree/` layout as the prior diagnostic typecheck. The config extends the archived strict source options, includes only the entry and its transitive imports, has no emit, and resolves Node types from `tree/node_modules/@types`.

```bash
./tree/node_modules/.bin/tsc -p tsconfig.maintenance.json --noEmit
```

Only after parent-controlled checks, the intended single-lane trial command is:

```bash
bash /Users/zacheryspector/studio-scratch/1361-postrelease-maintenance-prep/run-maintenance.sh "$ACTUAL_HEAD" trial-r1 trial
```

The leaf is proposed, not created. Full mode is available only with the later qualified trial output directory as the fourth argument; it is not invoked by trial completion. Resource bounds remain 600,000 ms for trial and 7,200,000 ms for full, the existing operational caps rather than game/Bridge acceptance thresholds. Neither command nor syntax/type checks were run by the author.

If maintenance does not restore qualifying production, report the actual remaining failure. Existing finite concepts, renewal-market behavior, aging/retirement and long-run affordability remain unmodified. Do not extend the horizon, add another policy or reinterpret temporary cash/repair success as proof of sustainable operation. The post-2040 release must still be genuine, preserve the official freeze and receive the existing save/validation timing observations before that obligation is closed.
