# OWNER DIRECTIVE — LOGIC FIRST WHILE UNITY IS UNAVAILABLE (activated on this branch 2026-09-16)

Activated verbatim from the Owner packet `FABLE-LOGIC-FIRST-PROGRAM.zip` (packet SHA256SUMS verified). This directive temporarily amends the
sequencing recorded in `OWNER-DIRECTIVE-THREE-WEEK-AUTONOMOUS-20260915.md`: headless P13B → P14 → P15 → P16 → supported P17/P18 engine
work proceeds now on `wip/headless-program-20260916-ts`; the UI/UX overhaul (paused branch `wip/playability-interaction-01-ts` at
`e2e409e80eccb6a7fd49fa16aa0f750faeb51253`) and all Unity/native verification are deferred to the replacement laptop, never converted to a pass.

## 01-OWNER-TASK.txt (verbatim)

```
OWNER DIRECTIVE — LOGIC FIRST WHILE UNITY IS UNAVAILABLE
2026-09-16 · OWNER-HEADLESS-PROGRAM-20260916-01

My previous laptop is no longer available. The old execution is paused. For the next 2–3 weeks, use a supported cloud/non-Unity development environment to implement and TEST as much of our planned engine work as the recorded decisions support. Do not merely produce plans. Do not postpone all verification until I have a better laptop.

This directive temporarily permits headless P13B → P14 → P15 → P16 → P17 work before the unfinished UI/UX overhaul is accepted. It includes P18 only to the extent of selected, specified engine behavior; Section 15 alone is not a complete television design. This is not acceptance of earlier UI work or permission to invent unresolved product choices. Existing product rulings and later corrections still govern.

Read 02-EXECUTION-BOUNDARIES.md and use 03-SOURCE-INDEX.md / source-pins.json. Read the current handoff and code for each dependency just before using it; do not read the entire historical archive before coding. Read FABLE-COORDINATOR.md, apply this newer directive to its old sequencing/local-path instructions, and preserve the current task board.

Start from the latest published working TS source after recording its full SHA and baseline checks—not stale main or a planning branch. Create ONE isolated headless-program branch, or use the cloud provider's assigned branch, based on that source. Preserve the paused TS/Unity branches, unresolved UI defects, last admitted player, evidence and Owner campaigns. Do not assume the old terminal, filesystem, private metadata or native-input ownership transferred. No Unity runtime/source edits, builds, scene imports, desktop automation or native tests in this task.

Start real implementation with the first unmet P13B engine slice. Recommended first outcome: full named research staffing/allocation uses the real weekly scheduler, budget limits, payroll and retained progress, with command/refusal and save/load tests. Confirm what already exists rather than duplicating it. Then finish useful research consumers and the other retained P13B engine obligations before consuming them in P14.

For every slice: briefly record scope, authoritative choices, current producer contracts, tests and a realistic capability/verification budget; implement; run focused and affected existing tests; obtain a genuinely separate bounded review when available; fix failures; publish a coherent checkpoint. Continue routinely without asking me to say "keep going." Advance downstream only against working, tested upstream contracts. A stub/mock can help a unit test, but cannot stand in for an implemented upstream system at integration acceptance.

TEST NOW: determinism/replay, legal commands and refusals, exact IDs, payroll/cash/ledger reconciliation, save/load and ordered migrations, campaign isolation, research/production dependencies, bounded historical growth, bridge schemas and player-safe disclosure. Run relevant core/bridge/type checks and applicable full suites at slice boundaries. Record inherited failures, skips and environment limits. Never disable tests or validation simply to proceed.

Use current generated DTO/schema owners. Preserve earlier supported save/schema inputs and old fixtures as migration tests; create new generated fixtures separately. Record every producer version and pending Unity consumer change. Generated C# files may be produced by the existing TS generator, but are not a compiled or tested Unity implementation. Keep engine-only candidates away from the old executable's live saves.

Work through all listed packages as far as their actual specifications permit. P17 uses the current canonical model and real P16 rights; keep its unresolved product decisions explicit. For P18, first produce the missing bounded engine charter from Section 15 and existing producers. Implement only settled portions; isolate genuinely missing television/streaming/season economics or policy instead of inventing them. Record a recommendation and continue another independent task. Do not stop the entire program over an unrelated later-phase question.

Keep Fable as coordinator, at most two specialists concurrently and one production writer by default, with separate test/review ownership. Use existing profiles when this environment actually loads them; do not repeat the old setup campaign or pretend missing specialists ran. Existing subscription/resource limits apply. No purchases, new paid infrastructure, permission bypass changes, hooks, parallel swarms or global OS changes.

Commit and push recoverable increments. Extend the existing CONTINUATION-STATE.md, handoff and plans on the NEW working branch; maintain HEADLESS-PROGRESS.md and UNITY-INTEGRATION-BACKLOG.md beside them. Every slice records exact commits, decisions, tests, migrations, fixture provenance, unresolved requirements and the precise UI/binding/native tasks left for the new laptop. Keep non-sensitive records in the source repo and restricted evidence in the private repo. Do not copy private assets, credentials, campaign payloads or session links into public Git.

Use the labels LOGIC VERIFIED / ENGINE INTEGRATION VERIFIED / UNITY NOT VERIFIED / DESIGN BLOCKED / IN PROGRESS accurately. Headless verification permits dependent engine work, NOT a complete-package or Owner-acceptance claim. Draft review PRs are allowed; no automatic main/protected promotion while required Unity/integration gates remain open. Never force-push or overwrite the paused UI branch.

Carry prior usage forward; publish updated phase forecasts, protect future integration/verification time and disclose overruns. Earlier hour caps remain planning checkpoints under my delegation, not a fresh clock. Do not claim one session will run continuously for weeks. At quota/environment exhaustion, window end, a safety block or completion, push an honest restartable handoff.

The target for my return is tested, integrated engine logic with concrete gameplay examples and a finite Unity integration list—not an enormous pile of unexecuted code or a declaration that every package is finished. When a suitable laptop is available, finish the current UI fixes, pair/compile the generated contracts, then integrate and verify the engine slices in dependency order with the full rendered/native and performance checks.
```

## 02-EXECUTION-BOUNDARIES.md (verbatim)

# Logic-first execution boundaries

**Proposed Owner task for activation by Howard.** This file accompanies the task text; it does not itself start a session, modify GitHub, upgrade a candidate or attest to tests. Date: 2026-09-16.

## Purpose and sequencing amendment

Use the hardware-limited period for substantial implementation, not another broad research pass. This changes **work sequencing**, not the finished-game definition: temporarily build and verify headless engine portions before the UI overhaul closes. P13A stays closed. UI/UX is paused and still required. Required native proof is deferred, never converted to a pass. P17 is newly included in this temporary assignment beyond the earlier P13B–P16 window; P18 is scoped preparation plus only genuinely selected/specifiable engine work, not carte blanche to invent a television game.

The latest user statement that the old laptop is gone controls over historical logs saying writers/tests are running or the desktop is available. The cloud coordinator accepts a new engine-only workstream from published state; it cannot attest to recovery of unpushed local work. Do not contact, restart or wait for the old Mac.

## Entry: one finite baseline, then the first actual feature

Current Ops observed these remote source tips on 2026-09-16:

| Role | Commit | Meaning |
|---|---|---|
| TS paused source/continuation | `e2e409e80eccb6a7fd49fa16aa0f750faeb51253` | Working candidate, not accepted UI |
| Unity paused source | `08c32c47f6faf223068d0999ec4a7a6c90649948` | Working N4 correction; rendered failures still recorded |
| Last admitted build in that record | Build56, TS `70a8c3ec` / Unity `288c4ddb`, projection 31 | Historical admitted player; full SHA and binaries are in its original manifests |
| TS working bridge manifest | protocol 4, projection 32; schema `sha256:b3a76d197481175c3a4a615f634cf227ae00b95981625df3f67784b307fc9e5c` | Do not overwrite with the older P13B plan's projection 30 |

Refresh just the relevant published heads/authority before branching. Record and preserve any newer work. If the cloud assigned branch is based on stale main, create a new clean branch at the verified working commit using the platform's permitted route; do not reset a dirty branch or push into the paused branch. Prefer `wip/headless-program-20260916-ts` where branch names are unrestricted; an enforced `claude/...` branch is fine. Publish its exact branch URL as the new live entry point. Do not circumvent a cloud push restriction.

The normal working directory is the actual cloud checkout, NOT `/Users/bruce/...`. Verify repository, runtime, lockfile, installed tools and available memory/disk. Use the existing lockfile and suitable supported runtime. No Unity or macOS tool installation; no dependency downgrade to fit the old Air. Install only the repository's declared dependencies under the environment's existing permissions. If this environment cannot execute tests or access required sources, name the precise gate; code drafted there stays UNVERIFIED.

Run the applicable baseline using the actual package scripts. At the reviewed pin these include `npm run test:core`, `npm run test:bridge`, `npm run typecheck:bridge`, `npm run typecheck`, and `npm test`. Select appropriate low-concurrency execution for the runner; do not drop assertions to fit it. A macOS-only launcher failing on Linux is not evidence of a core regression. Conversely, unrelated baseline failures cannot be silently ignored: record them, their isolation and what can proceed safely.

Within the first bounded baseline/reading interval, return the environment/baseline facts and begin the first unmet P13B feature. Do not consume an entire phase producing a new PM hierarchy.

## Programme: source scope vs headless deliverable

| Package | Source-supported scope | Engine-first deliverable and prerequisite |
|---|---|---|
| P13B | All eight Ready obligations: full named staffing; multiple Labs/cooperation/splitting; queues; gap-aware conversion/purchase; forecasts/replacement; installation cancellation; component inventor pricing/prototypes; symmetric rival research | Real commands, weekly state transitions, retained work, allocation/finance, deployment effects and testable read models. Preserve proposed-versus-selected tuning. A second useful technology needs its real production consumer, not just another progress bar. |
| P14 | Talent market, proposals/chooser, work-derived relationships, career/lifecycle | Real P10/P12 identity/employment producers; implement bounded market, relationship and lifecycle slices. Consume implemented P13 retained-work/filming contracts; do not reuse old P12-only reconnaissance as current code. |
| P15 | Shared market, ranking/financial distinctions, loans/distress/settlement and Legacy | Preserve existing release/result/accounting owners. P15 supplies failure/estate facts, never acquisition purchases. Isolate remaining material disclosure/ranking choices and provisional tuning. |
| P16 | StoryProperty/library/rights and initial full-absorption acquisitions | Build real chain-of-title/licensing and transaction/settlement interfaces against tested producers. No autonomous acquired subsidiary, no ownership of people, no teleporting installed buildings. |
| P17 | Current canonical Recognition/Momentum/Fatigue model, continuations, branches and related rights-dependent behavior | Read report sections 5/5.7/8–10 and 19 before coding. Reproduce the canonical calculator, then implement selected behavior against P16 rights. Five product questions are recorded by the index; do not silently resolve those through code. Historical model variants are not alternate current specifications. |
| P18 | Section 15 allocates television/series/seasons/renewal/cancellation/streaming/cross-media/platform workflows under exact P16 rights | No complete implementation plan is supplied. Draft the minimum finite engine charter from existing decisions, list missing rules and code only settled/specifiable pieces. Missing economics, platform policy or season lifecycle cannot be filled from imagination or from generic TV knowledge. |

This matrix is an execution decomposition, not a claim that each package is ready, fully implementable, balanced or completable in the available weeks.

## Corrections that must travel forward

- P13B paper correction: Post operating cost begins at its own completion. Reconciled totals do not approve prices or prove balance. Keep the full eight obligations and known early-campaign content-depth limitation.
- P14's later Owner-directed early-termination rule is distinct from the older shipped rule; migrate by governed evidence, not fabricated history. Preserve completed contributions separately from remaining work and employment status.
- P15's later reconciliation overrides the P16 register where it still repeats the withdrawn 14-week estate maximum. P15 does not execute P15D purchases. No artificial replacement studios or rival floor is smuggled back in.
- P16 initial full absorption is selected. Its register has no blocking product question, but real producers, numerical recommendations and technical readiness still need implementation.
- P17 revision 02 and its canonical calculator supersede historical variants. Read its explicit remaining product-choice list rather than treating the whole report as Owner law.
- The older blueprint and roadmap describe destination and boundaries; their historical runtime/status/version claims do not override the actual branch.

For every material decision use **Owner selected / delegated implementation decision / provisional tuning / proposed product choice**. Choose routine methods and reversible tuning within authority, with tests and rationale. Do not ask the Owner to settle every implementation detail; do not label new product policy as already selected. A genuinely unresolved policy blocks only its dependent feature.

## Verification now, integration later

Each meaningful slice must execute actual scheduler/command tests—not merely getters or mock objects—covering positive and negative cases, money/work/capacity conservation, same-name identity collisions, deterministic replay, interleavings, cancellation and save/reload. Use generated lawful test studios with recorded provenance, never personal saves. Run neighbouring regression tests and a bounded full core/bridge pass at checkpoints. Test cross-phase contracts with real upstream modules; test doubles do not close engine integration.

Add new save/schema versions through the existing owners. Preserve original prior-version fixtures for migration assertions; replacing them all with freshly generated current fixtures would erase the evidence of backward compatibility. Regenerate current DTOs/read-model fixtures consistently and distinguish save version from bridge protocol/projection. Do not claim Unity consumption from generated-text equality alone. A future player must explicitly pair with the new engine before loading its generated test saves.

Long-campaign tests and storage-growth checks can run headlessly when the runner supports them. Record workload, environment and raw results. New-hardware timing is not a matched comparison with the old Mac; preserve the native +5% Save/load and acknowledgement obligations for an appropriately matched later run.

Default writable areas: the actual existing TypeScript core/bridge/test/generated-contract owners, narrow schema/migration and fixture tooling, and project documentation. Browser/headless read-model tests are allowed; do not restart the browser prototype as a competing UI. Unity handwritten source, scenes, art, prefabs, project settings and native automation are out of scope. Generated C# stays in the TypeScript generator's established output until the future Unity integration task.

## Small recovery records, not another documentation programme

Continue `CONTINUATION-STATE.md` and the existing handoff **on the new engine branch**. Add:

- `HEADLESS-PROGRESS.md`: package/slice, exact source, test results, status, decision class, budget and next task.
- `UNITY-INTEGRATION-BACKLOG.md`: per-slice producer/consumer versions, required UI action/feedback, C# binding changes, exact future compile/render/native tests, and unresolved product choices.
- one bounded plan per phase under the existing `plans/` directory.

A completed headless slice is **LOGIC VERIFIED**, and only a real multi-system test earns **ENGINE INTEGRATION VERIFIED**. It remains **UNITY NOT VERIFIED** until the counterpart is compiled and tested. Preserve **DESIGN BLOCKED** and **IN PROGRESS** honestly. Do not claim Owner acceptance.

Use one cloud task/coordinator at a time for this branch, with bounded specialists on disjoint paths. If project-local roles are unavailable, describe actual review provenance; do not simulate an independent review or repeat the historic setup campaign. Independent preparation can continue while a specific role/tool is unavailable, but final technical claims still require their real checks.

The-Movies was last verified PUBLIC; the Unity/evidence repo was PRIVATE. Preserve those boundaries and verify before publishing sensitive copies. No credentials, personal campaign data, private session links, raw private snapshots or private Unity assets in public commits. Source materialized from an already published public document remains a reference copy, not authority to republish confidential data found elsewhere. Do not download the old release movie/evidence mirror just to begin engine work. Fetch only source and small required evidence.

## Return to the new laptop

Pin the final engine branch, first failing test if any, save/bridge migrations and last test-verifiable checkpoints. Resume the paused UI branch and its remaining F26/rendered failures; do not pretend headless work repaired them. Pair the future Unity consumer with engine slices incrementally, restore real action/reason/receipt routes, then run rendered/native integration, campaign preservation, matched performance and final whole-game critique. Keep old executables and rollback sources distinct. No blind merge of all packages into a working player.

This packet changes no repository or machine by itself. Publish the activated directive on the engine branch so its sequencing amendment is explicit. Respect the current access/usage budget and three-week authorization window; no claim of continuous background execution, automatic renewal or guaranteed completion.

## Packet identity

```
a1703dc1cc85be7a1b3f17167ac01358a53052ef8c678a1b3c1e408fb435c438  00-START-HERE.md
98c51eea681be9a018a9d41e8b10f9c998387c944851f09addc7ca5175651f12  01-OWNER-TASK.txt
0a876bf44fed1d4a9c34e53988b102fa1b5087112f2248bf874b2d2fa4543094  02-EXECUTION-BOUNDARIES.md
580fe089c1357b25046b126e9834ff40191ae63cc15ea71d989a21f43dddf23a  03-SOURCE-INDEX.md
6d92b086e6d87e5a2d700f0e55aaddc588d336007962edd0da35331cb860851d  QA-RECEIPT.json
e647a7b1b7be1b068953bbb71c5a4823ced649e15d721e6c736431c3a268be7b  materialize_sources.py
e2ce86b033acb601a0af053ba166eff5991c73fbe2f55bc55f9f4b1b18e0c6e3  source-pins.json
```
