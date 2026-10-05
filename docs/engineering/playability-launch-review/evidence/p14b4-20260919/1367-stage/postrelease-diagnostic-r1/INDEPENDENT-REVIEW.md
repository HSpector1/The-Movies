# Independent diagnostic result review

**PROCEED as an observation-equivalent diagnosis of the failed trial, not as full-route qualification.** All 12 deterministic output comparisons independently match the original failed trial. The persistent production stall has an observed `set-unavailable` blocker, with both available standing sets below the source's minimum usable condition. Paid set maintenance is a grounded next controller action; its ability to restore continuing production or reach 2040 remains unmeasured.

The completed diagnostic used actual HEAD `689a69f314a61a71c2ee4fc813fb4f16c7245ec1`, source tree `88d0197645b3a5bd69d73ebff0c5c1c9ff0aa837`. Child exit 0, no timeout, and recorded postflight passed. I independently matched result/stderr/probe/wrapper hashes to `run.json`, all five staged input hashes to the retained preparation manifest, and the inspected archived sets/operations/actions/tuning/read-model source files to that HEAD. No replay, Node, typecheck, fixtures or live source/index writes were used for this review.

## Observed parity and evidence

Directly compared diagnostic and original result values for qualification, recent releases, horizon, final week, accepted staffing counts, replacement hires, staffing refusals, staffing samples, checkpoints, post-release object, post-release measured flag, and final state hash: all equal. `trialQualified` remains false, recent releases remain zero, and the full state hash (including RNG) remains `3629164c1ff825f876c14ab4908f07247b55d864cd1d64047a6f936d2eddef74`.

The controller returned 103 intents, all accepted: zero refused intents, zero omitted refusal counts, no refusal groups. This does **not** contradict a blocked production: the work allocator can wait without any legal next decision or refused command. The 25-row window covers input weeks 142–166 and contains complete primary production/set/facility/project inventories and untruncated decisions. Relevant exact transitions:

- Input week 144 commits the previous picture; output week 145 has 16 released films and no active production.
- Input week 145 greenlights `prod-0145` from `c-16`; output week 146 holds it in development with eight remaining ticks.
- Input 146 → output 147 moves it to preProduction with seven remaining ticks and no blocker yet.
- Input 147 → output 148 records `{kind: 'set-unavailable', targetPhase: 'rehearsal'}`. Both `set-0` and `set-1` stand at condition 28, mounted respectively on soundstages 07 and 12. `nextStudioDecision` is null. The available source inventory contains these two soundstages and a scenery shop with capacity two.
- The diagnostic's coarse-clock detector fires at input week 154 after eight unchanged transitions. **154 is the detector week, not the first blocked week.** Every remaining observed window row retains the same blocked production, as does the final week-520 inventory.
- Final inventory still has both sets standing at condition 28, the same preProduction blocker and seven remaining ticks, no next decision, two ready scripts, and 11 unused concepts. Initial concept exhaustion is therefore excluded by actual inventory. The unchanged qualification and finances remain those of the original failed route.

## Proven source mechanism

Line references below are in the exact archived `tree/src/core/` source. `sets.ts:180–184` requires a standing set's condition to meet `TUNING.SET_CONDITION_UNUSABLE_THRESHOLD`; `tuning.ts:891` sets that threshold to **35**. `bindableSetsOn` (`sets.ts:741–750`) requires this usability in addition to the correct stage and no holder. Thus neither actual condition-28 set can be selected.

`operations.ts:312–353` admits a stage and usable set atomically. If a stage slot exists but no bindable set does, it emits precisely the observed `set-unavailable` blocker. This matches the observed progression into rehearsal and proves the immediate blocking mechanism, rather than inferring it from a release gap. The direct-package controller's one-active-production target then prevents another greenlight while this picture occupies that target (`src/harness/roster-wall/campaign.ts:96,1028–1032`).

The controller resolves `nextStudioDecision` and ordinary film actions; that projection covers script/casting, production operations and release review (`scriptReadModel.ts:1280–1300`), not general set maintenance. Consequently all actual film intents can succeed while the next picture waits on a worn set. The later renewal market-case refusals remain separate; they did not cause the initial block before the first renewal window opened at 196.

The existing lawful remedy is public `applyActions` with `{kind: 'repairSet', setId}` (`types.ts:2723`; `actions.ts:1572–1582`). Its authoritative refusal guard uses `canAfford` and `repairSetRefusal`: managed operations, known standing worn set, no rehearsal/shooting holder, free scenery capacity, and affordability (`sets.ts:522–539,407–430`). A successful action pays the existing **60,000** `SET_REPAIR_COST`, records one negative `setMaintenance` ledger movement and schedules **two** weeks of real scenery work (`tuning.ts:892–893`; `sets.ts:551–581`). Completion restores condition to **100** through ordinary ticks while preserving novelty (`sets.ts:646–673`; `tuning.ts:725`). Repair does not replace a set, mint revenue, remove an obligation or make audiences forget prior use.

Whether a repair is affordable/admissible at an actual attempted week must be decided by that public action, and whether the route subsequently qualifies must be measured. No repair action was performed in this diagnostic. It does not establish future staffing availability, sustainable cash, concept replenishment or a post-2040 release; no such policy expansion is authorized by this review.

## Artifact binding

- `run.json`: `9f54ef1c6b18ababc5674d74e573618a7523342fd8eb4d22492b5b01ffc6678c`
- `result.json`: `ef21d9cee1325947ff61978afa97f0736846f3a4c153d35326e956187e118ca7`
- `stderr.txt`: `eb63ea1ecf1afb7216d92167b6a6f5a989eda267d96da0b04a1ec05ad98dd085`
- Diagnostic probe: `07e2d1e4b03f3a37f460f953bb94156ea6fd3960684674ab334ce9be40f74cec`
- Executed wrapper: `2dc023792f953f2bbbfb037ba21a23792a6f541dda298e0ddab4351a40f81886`

Elapsed wrapper time was 47,807.577 ms under its operational resource cap. That is a diagnostic runtime observation, not a Bridge/per-save timing gate. Exit 0 and `diagnosticPassed: true` certify parity only; `neverQualifiesFullRoute` remains true.
