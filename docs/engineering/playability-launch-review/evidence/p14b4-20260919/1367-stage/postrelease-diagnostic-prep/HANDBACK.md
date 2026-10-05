# Bounded post-release diagnostic replay proposal

Prepared statically for independent review and parent-controlled typecheck/execution. No Node, TypeScript, tests, runtime replay, fixture payload, live source or index operation was performed. Only this new preparation directory was written. No automatic run is scheduled.

## Preserved route and result contract

`probe/postrelease.ts` starts as an exact copy of completed `S/1361-postrelease-runs/trial-r1/probe/postrelease.ts` (original SHA `87e45c65f8972da3106c2e4d9e3382db90962377f1686fb67069a181507b505d`). The original bytes are retained as `probe/postrelease-original.ts.txt`; `probe.diff` is the complete reviewable delta. The original trial's result/run records are copied with their exact hashes, not reminted game saves.

The only controller call change is `captureIntents: false` → `true`. Genesis stays `initializeHollywood(foundRosterWallStudio('seed-b', 'direct-package'), 'fresh')`. Staffing/actions/order, discarded helper tick, real `tick(stateAfterActions, {develop:true})`, 520-week horizon, checkpoints and original qualification expression are unchanged. Diagnostic setup rejects any other horizon and rejects a supplied qualification token. The retained original full-route observation branches are unreachable under that bound; no code path launches a second run.

After genuine final Save45 validation, the probe checks exact original final-state hash and all deterministic recorded fields: qualification, recent releases, horizon/final week, hires/renewals, replacement hires, staffing refusal counts/samples, checkpoints, post-release fields and final state hash. Hash/canonical equality includes the state RNG. Timing and probe identity necessarily differ and are separately labeled. The expected qualification remains **false**. Diagnostic exit 0 means only that the observation replay preserved the original result; `diagnostic.neverQualifiesFullRoute` is true. A parity change or unexpectedly true qualification refuses after emitting the observed diagnostic result. This is not permission to extend the horizon or qualify a full route.

## Actual observation fields and bounds

The new observer receives the actual staffed input, actual helper `stateAfterActions`, actual next state and returned `driven.intents`. It supplies no actions/results and writes no game fields. `nextStudioDecision` is the existing pure projection (`src/core/scriptReadModel.ts:1280`). All retained inventories are detached copies. No generic walk through game objects is used to infer dependencies or causes.

- `firstStall` is the first actual refused `production-operation` / `release-commitment` intent, or the first production with eight unchanged coarse work-clock transitions. The latter compares remaining ticks, workflow phase, shooting status, plan revision and credited setup units; it is explicitly a diagnostic lead, **not a proven refusal cause** or product timeout.
- `aroundFirstStall` retains at most 25 weekly rows: previous 12, trigger, following 12. Each has input week and before/after-actions/after-tick inventories plus at most 32 actual intents. The pre-trigger ring holds only 12 rows. If no trigger occurs, the window stays empty and final inventory is still recorded.
- Each inventory includes actual cash/released count and `nextDecision`; up to four active productions with IDs, concept/start/remaining ticks, exact assigned people, release-commitment presence and their workflow phase/revision/blocker/bindings/shooting task; up to eight reservations per workflow; selected setup identity/progress fields and prior-work count, not recursive setup history.
- Inventories also contain up to 16 non-produced script projects (ID/concept/writer/status/due/production/reservation), total/used/unused concept counts and first 16 unused IDs/costs, first 16 physical sets (ID/blueprint/mount/status/completion/condition), and first 16 facilities (ID/capability/capacity). Craft IDs cap at eight. Every bounded array states total and omitted count.
- `refusalGroups` retains the first 64 distinct hashes of actual intent kind/owner/reason/action across the full trial, with first/last week and recurrence count. `totalIntents`, `refusedIntents` and `omittedRefusals` disclose overflow. The sum of retained group counts plus omitted refusals must equal refused intents. Existing staffing refusal output remains separate and byte-compared with the original.
- Exact decisions and intent records are serialized separately with full canonical hash, character count, explicit truncation flag and at most 8,192 characters. Truncated text is not presented as a complete JSON value or full causal proof. The entire emitted JSON is capped at 16 MiB; overflow refuses rather than silently dropping more evidence. These are diagnostic resource/output bounds, not game rules or acceptance thresholds.

The real source seams are `campaign.ts:573–639` (actual caught action refusal and observation gate), `:651–704` (decision resolution), `:1028–1046` (one-active-production policy), `:1070–1143` (concept and commission inventory), and `:1604–1642` (existing capture seam). Named schema fields are in `src/core/types.ts` Production, ProductionWorkflow, ScriptProject and StudioSet. If the first diagnostic lead does not explain the later stall, report that limit; do not improvise another policy/run.

## Wrapper and typecheck

`run-diagnostic.sh` takes exactly two arguments: actual full HEAD and a new exclusive leaf. It requires HEAD's `src` tree to equal **88d0197645b3a5bd69d73ebff0c5c1c9ff0aa837**, while allowing a later documentation-only HEAD. It checks relevant live tracked inputs before/after, copies exact archived source, binds original and diagnostic identities separately, verifies copied inputs before/after, and records result hashes only after source/input postflight. The run mode is `diagnostic-observation-only`; the original full wrapper requires `mode: trial`, so this output cannot serve as that wrapper's qualification certificate.

The output path is `S/1361-postrelease-diagnostic-runs/<new-exclusive-leaf>`. All ancestors are checked for symlinks and non-directories before exclusive creation. The wrapper preserves pinned Node v20.20.2, a 5 GiB disk guard, `caffeinate`, observed battery/power logging, and the original 600,000 ms operational cap (external wait adds the same 30-second grace, then terminates the child process group). There is no AC hard refusal, automatic retry or full-route mode. Original completed trial files and active run directories are never overwritten.

Parent must first stage this exact layout in a separate typecheck scratch directory: archived accepted `src`, `package.json`, `package-lock.json`, `tsconfig.json` under `tree/`; `tree/node_modules` linked to the existing dependency installation; the proposed `probe/` and root `tsconfig.diagnostic.json`. The config extends the source's strict options, sets no emit, includes only the diagnostic entry with its transitive imports, and supplies the staged Node type roots. From that staging directory the intended check is:

```bash
./tree/node_modules/.bin/tsc -p tsconfig.diagnostic.json --noEmit
```

After independent static review and parent typecheck, the single-lane execution form is:

```bash
bash /Users/zacheryspector/studio-scratch/1361-postrelease-diagnostic-prep/run-diagnostic.sh "$ACTUAL_HEAD" trial-r1-observation
```

The leaf is proposed, not created. Parent supplies the actual full HEAD; neither command has run here. The wrapper intentionally does not launch TypeScript and the replay together. `SHA256.json` binds proposal inputs and `probe.diff`. Static authoring does not establish typecheck success, observer neutrality, a discovered refusal cause or continuing-production viability.
