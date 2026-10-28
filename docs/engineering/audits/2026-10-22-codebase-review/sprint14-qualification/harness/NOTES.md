# Sprint 14 measurement harness: notes (ENTRY items 3 and 4)

Written 2026-10-28 from file reads only. No script, compiler, test or game ran.

## What the routes are

Both drivers run the 1367-K natural G-L route: `p13aGeneratedStudio(seed)` from `src/harness/p13a/fixtures.ts`, then one tick per week. The helper calls `generateWorld(seed)`, sets `economyEngagedEver: true`, applies one `activateStudioOperations` action and calls `initializeHollywood(..., 'fresh')`. No other player action follows: no hiring, film, rights, continuation, cameo or TV command. `git diff d5e2dad1..HEAD` is empty for that helper and for `src/harness/roster-wall/campaign.ts`, so the route code is byte-identical to the Save45 source 1367-K ran. The same route drives `1361-GL-probe.ts` (`runSeed`) and the 1363-V kit's `1368-natural-recovery.test.ts`. No action in either harness is new.

### Why each seed can run in two arms

Since P15B (Save48), `tick` calls `assertOperatingPlayer` (tick.ts:225) and refuses to advance after the player's actual closure. The natural route burns the player's cash: 1367-K's seed-b player held −111,865,000 at week 8791 under Save45, which had no closure law. On Save51 the default `tick(state)` route will therefore stop at the player's closure. The INVENTORY header line "No natural campaign in a test reaches week 6240 from a fresh founding" agrees.

- **`default` arm:** `tick(state)`, exactly the 1367-K call. It runs to the horizon or to the player's actual closure, whichever comes first. A stop before the horizon becomes a FINDING.
- **`closure-deferred` arm:** `tick(state, { deferPlayerClosure: true })`. The option already exists (`TickOptions`, tick.ts:208-214). `tests/helpers/p15b-live.ts` composes it with `advanceTo` as `advanceDeferred` ("natural ticks, the player's closure left due"), and `tests/helpers/p14c3-genuine-evidence-fixtures.ts` ticks natural routes with it. The player's closure is recorded as due and stays due, rivals close as ever, and no money moves. This arm runs only when the default arm stops early.

**Decision for the coordinator.** The deferred arm is the one judgement call in this harness. It reaches 6240 and 8791 without cash, roster or controller input, and it is the only way to measure rivals and the Legacy freeze past the player's closure on the current tree. It is still a different `tick` option from the one 1367-K used. If you rule it inadmissible, read only the `default` arm: the measurement then says the natural route ends at the player's closure in week C, and 6240 is unreachable from a fresh start on Save51 without an operating controller. The rows already separate the two arms; no rerun is needed to drop one.

The arms should match at every checkpoint before the closure week. `armsAgree` reports that comparison. A mismatch is a FINDING, not an exit code, because the deferral option could in principle act before the closure week. The asserted determinism check is the rebuild.

## What I reused

| Source | Reused how |
|---|---|
| `src/harness/p13a/fixtures.ts` `p13aGeneratedStudio` | Imported; the route |
| `src/core/tick.ts`, `save.ts` (`makeSave`, `validateSaveV51`, `exportSave`, `stableStringify`, `LIVE_SAVE_VERSION`), `campaignLegacy.ts` (`LEGACY_BOUNDARY_WEEK`), `hollywood.ts` (`rivalWeeklyOperatingCost`, `rivalCapacityOpex`), `employment.ts` (`weeklySalary`) | Imported, read-only |
| 1361-GL-probe.ts | Route, seeds (p13a-core-causal-01, seed-b), horizons (6240; seed-b on to 8791), three paired makeSave plus additional-validation samples at 6240 and 8791, progress line every 520 weeks |
| 1361-postrelease-prep/probe/postrelease.ts (sha256 87e45c65…b505d, the 1367-K trial policy) | Ported as `operated-trial-312.ts` with the smallest diff (below) |
| 1363-V kit, `1368-natural-recovery.test.ts` clean mode | Its state-only read-outs, rebuilt on current APIs: per-rival cash, reserve, weekly operating cost, payroll, facility opex, headcount by role, money by kind, cost-cutting entry and the first hire, commission, greenlight, first take, release and revenue after entry, terminations with the payroll they avoid, disposal refunds |
| capture67.ts and capture67-r3/run.sh | Root-relative imports, `import.meta.url` self-hash, output directory from an env var, `wx` writes, the run.sh verify block and `run()` |

### operated-trial-312.ts diff against the 1367-K policy

```
-import ... from '../tree/src/...'        +import ... from './src/...'          (9 import lines, paths only)
-import { makeSave, stableStringify, validateSaveV45 }   +... validateSaveV51 }
-    validateSaveV45(save)                +    validateSaveV51(save)            (timing())
-validateSaveV45(makeSave(state))         +validateSaveV51(makeSave(state))    (final check)
```

Plus a three-line header comment. Run `diff 1361-postrelease-prep/probe/postrelease.ts operated-trial-312.ts` to see it whole. The staffing policy (`staff`, `terms`, `attempt`), `foundRosterWallStudio('seed-b', 'direct-package')`, `runRosterWallOperatingWeek`, `tick(..., { develop: true })`, the 520 horizon, the qualification rule and the stdout JSON are unchanged. The unchanged file cannot run on Save51: `validateSaveV45(makeSave(state))` precedes its stdout write and refuses a version-51 save, so the result would be lost. Its `policySha` in `result.json` is the port's hash, not 87e45c65; this file records the difference. The later "one lawful controller correction" (`1361-postrelease-maintenance-prep`) is a controller change and is not used.

## What I could not reuse, and why

- **The 1363-V kit as a runnable package.** See the next section.
- **The 1368-C delayed-player route** (`1368-postrelease-prep-v3/probe/postrelease.ts`), the only existing route that produces a real post-2040 player release. It is pinned to the Save45 source (`ORIGINAL_HEAD` and `ORIGINAL_SRC` binding, `saveVersion === 45` checks, `validateSaveV45`, `*.save45.json.gz` names), and ENTRY lists re-running 1368-C evidence as out of scope. A post-2040 player release on Save51 therefore stays unmeasured; carry it as ACCEPTANCE OPEN. A port would touch about nine era sites and needs the coordinator's ruling first.
- **The 1052 endurance driver.** A funded active stress scenario at Save38 ("not an affordability result"); ENTRY excludes the 1052 variants.
- **1357-P probe arms (arm A no loans, arm B shadow loans).** They modelled P15B in shadow before it landed. The live `corporateCondition` and `studioClosure` roots replace them, so the harness reads live loans and closures. `p13a-wait-control-01`, a 1357-P seed, is not in the default list; add it with `RIVAL_ROUTES`.
- **`tests/helpers/p15b-live.ts` by import.** It imports `expect` from `vitest`, which a plain vite-node script should not load. The harness passes the same one-field option literal and cites the helper.
- **scripts/measure-*.mts and scripts/p13a/*.** Earlier-era economy and performance probes on other routes; none measures the G-L routes.

## The 1363-V kit: verified state

- `1368-recovery-measurement-prep` (v1), `-prep-v2` (revision plus review-r1), `-assembly-prep` and `1368-recovery-measurement-arms-01` exist, all dated 2026-10-04.
- The kit measures four historical arms (C0, A, AB, ABC), each a copy of 188 pinned source files at Save45/Save46. The driver refuses any manifest whose `saveVersion` is not 45 or 46, and its observer patches bind to those arms' source hashes.
- `arms-01/types-r1/result.json` records a strict type pass for all eight copies at head 6c60c26a. That is the only execution on record.
- No run directory exists (`1368-recovery-measurement-runs` is absent), and no records file holds a 1363-V result. `P15B-O1-O6-REPROBE-NEXT.md`, `P15B-full-gate-r1/PRIOR-QUALIFICATION.md` and `1370-ar-post-r8-baseline-20261011/README.md` all say the matrix remains unrun.
- **Verdict:** stale for the current tree and never run. Reusable: the read-out list and the clean-mode reading of state. Stale: arms, manifests, source pins, observer patches, the 45/46 version gate, the 1357-P shadow condition adapter, the 520-only horizon, and the vitest wrapper with its 300-second limit.
- The nearest live-root evidence is the P15B O1/O6 route (`P15B-O1-O6-OUTCOME-DISPOSITION.md`): the genuine week-130 p13a capture ticked 130 to 600 with four real loans, no later greenlight or release, and closures at 186, 328, 346 and 378. It starts from a capture, not a fresh natural route, and predates P16 to P18.

## What would count as inventing a scenario (none is done)

- Funding the player or a rival, draining cash, or editing roster, receipts or history. The p15b-live drains are fixtures for other laws; the harness uses none.
- A new seed, horizon or seed search. Every seed and horizon comes from 1367-K or 1363-A §6.1; `RIVAL_ROUTES` accepts only 520 or 6240.
- Scripting TV, continuation, cameo or rights actions on the natural route. The route has no player command for any of them, so `eraRoots` shows only what the engine and rivals do on their own. If the coordinator wants those systems exercised in a long campaign, that needs a new route and an Owner-level ruling. The natural p18 route for item 2 belongs to the witness writer.
- Fixing the 1367-K controller (the maintenance correction) or widening its horizon to find a release.
- Treating the deferred arm as player survival. The player's closure stays due on every row (`player.conditionStage` "closed", `player.closedWeek` null); nothing pays its costs.
- Reading a measured outcome as acceptance. Dormant survivors, closures, a missing week-312 release or a changed Legacy hash are findings to route.

## Limits

- No source observers, so the kit's package, evaluation, refusal-gate and promise-movement attribution (1363-A §6.4 and §6.5) is not measured. Controls (a), (b), (e), (f) and (g) need the historical arms and are not measured either.
- Reserve-based weeks come from sampled weeks only: every 10 weeks to 520, every 520 after, and event weeks. A full receipt scan per rival per week would cost more than the route itself.
- Save timings are isolated `makeSave` plus `validateSaveV51` calls, not a Bridge step. Checkpoints before 6240 take one sample; 6240 and 8791 take three, as 1367-K did.
- The determinism rebuild runs in the same process as the route. It catches route nondeterminism but not module-state carry-over between runs. seed-b is rebuilt to week 520 only; a full 8791 rebuild would repeat about 12 minutes of Save45 time. The arms comparison adds a second same-process witness through the closure week.
- No final save is kept. Only its size and sha256 are. Keeping the 6240 Save51 save as a fixture would need a decision on the 8 MiB UI import ceiling (SAVE-11) and on disk space.
- The natural routes cannot answer the week-312 question, because they issue no player production action. Only operated-trial-312 measures it.

## Compile status

I did not run tsc, as instructed. vite-node transpiles without type-checking. A type error will not fail the run; a wrong import path or a missing export fails within the first seconds. The lane run is therefore an import and runtime check, not a type check. For a type check, list the four files in a scratch tsconfig and run tsc in the lane. I read every import against the current source at 0774e16e (src is identical to 85c09bc6): `p13aGeneratedStudio`, `tick` and `TickOptions.deferPlayerClosure`, `makeSave`, `validateSaveV51`, `exportSave`, `stableStringify`, `LIVE_SAVE_VERSION` (51), `LEGACY_BOUNDARY_WEEK` (6240), `rivalWeeklyOperatingCost`, `rivalCapacityOpex`, `weeklySalary`, `RivalBusiness.costCutting`, `corporateCondition`, `studioClosure`, and the controller's `foundRosterWallStudio`, `runRosterWallOperatingWeek`, `ROSTER_WALL_OPERATING_POLICIES`, `activeContract`, `contractOffer`, `hiringMarketIds`, `renewalWindowOpen`, `contractEndRefusal`.
