# Sprint 2 performance checkpoint

Entry candidate f6c31caab28ee2290a5d9b8ab35a7463bacc9ce5. Source patch removes repeated pure title-resolution folds inside one unchanged estate validation operation. No historical checks, money rules, serialization boundaries or timeout budgets changed. Source diff and proposed patch are retained; independent review found no actionable source blocker (review.md).

Existing S7 Save As leaf: fresh pre-P16 main a92e2c66 passed ~20.1s; entry P16 timed out ~32.4s at original30s; changed P16 passed ~20.9s. Profiled candidate36.7s is instrumentation evidence only. One before/after comparison supports improvement, not a statistical benchmark or broad qualification. profile-summary.txt and raw cpuprofile files retain actual bottleneck evidence, separating runtime from collection.

Existing complete valuation/estate/join-negative files:22/22 assertions passed in focused-b. One corruption leaf took8.220s against default5s in the combined run, so assertion PASS is not timing acceptance. Final checkpoint must preserve and classify this overrun. Freshness sequence extends an existing opening leaf; no new performance test leaf, retained cache, budget increase or redundant unchanged-suite rerun.

Corrected pending-title witness passed3.086s, all substantive assertions reached. Initial wrong prediction of remainingTicks1 versus managed first-take5 is preserved in pending-first.json and premises/pending-first.failed.test.ts. Complete original authority file after integration and broader P16 gate remain outstanding at this checkpoint.
